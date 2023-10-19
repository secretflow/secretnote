# Copyright 2022 Ant Group Co., Ltd.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.


import math

import numpy as np
import pandas as pd
import scipy.stats as stat
import statsmodels.api as sm
from secretflow import PYU, SPU
from secretflow.data.base import Partition
from secretflow.data.vertical import VDataFrame
from secretflow.ml.linear import LinearModel, RegType, SSRegression
from secretflow.stats import SSPValue
from secretflow.utils.sigmoid import SigType
from secretflow.utils.simulation.datasets import dataset
from sklearn import linear_model
from sklearn.preprocessing import StandardScaler

from secretnote.formal.locations import OnDemandDevice
from secretnote.instrumentation import APILevel, tracing_checkpoint

devices = OnDemandDevice(globals())


class env:
    alice = devices(PYU, "alice")
    bob = devices(PYU, "bob")
    carol = devices(PYU, "carol")
    davy = devices(PYU, "davy")
    spu = devices(SPU, "alice", "bob")


pyus = [env.alice, env.bob, env.carol, env.davy]


@tracing_checkpoint(APILevel.USERLAND)
def _build_splited_ds(pyus, x, y, parties):
    assert x.shape[1] >= parties
    assert len(pyus) >= parties
    step = math.ceil(x.shape[1] / parties)
    fed_x = VDataFrame({})
    for r in range(parties):
        start = r * step
        end = start + step if r != parties - 1 else x.shape[1]
        split_x = x[:, start:end]
        pyu_x = pyus[r](lambda: pd.DataFrame(split_x))()  # noqa: B023
        fed_x.partitions[pyus[r]] = Partition(data=pyu_x)
    pyu_y = pyus[parties - 1](lambda: pd.DataFrame(y))()
    fed_y = VDataFrame({pyus[parties - 1]: Partition(data=pyu_y)})
    return fed_x, fed_y


@tracing_checkpoint(APILevel.USERLAND)
def _run_ss(env, pyus, x, y, p, w, parties, reg: RegType):
    # weights to spu
    pyu_w = env.alice(lambda: np.array(w))()
    spu_w = pyu_w.to(env.spu)

    # x,y to pyu
    pyu_x, pyu_y = _build_splited_ds(pyus, x, y, parties)
    spu_model = LinearModel(spu_w, reg, SigType.T1)

    sspv = SSPValue(env.spu)
    pvalues = sspv.pvalues(pyu_x, pyu_y, spu_model)
    p = np.array(p)
    abs_err = np.absolute(pvalues - p)
    radio_err = abs_err / np.maximum(pvalues, p)

    # for pvalue < 0.2, check abs err < 0.01
    abs_assert = np.select([p < 0.2], [abs_err], 0)
    assert np.amax(abs_assert) < 0.01, f"\n{abs_assert}"
    # else check radio error < 20%
    radio_assert = np.select([p >= 0.2], [radio_err], 0)
    assert np.amax(radio_assert) < 0.2, f"\n{radio_err}"

    print(f"pvalues\n{pvalues}\np\n{p}\nabs_err\n{abs_err}\n")


@tracing_checkpoint(APILevel.USERLAND)
def _run_test(env, pyus, x, y, reg: RegType):
    scaler = StandardScaler()
    x = scaler.fit_transform(x)
    ones_x = sm.add_constant(x)

    if reg == RegType.Linear:
        sm_model = sm.OLS(y, ones_x).fit()
        weights = list(sm_model.params)
        pvalues = list(sm_model.pvalues)
    else:
        # breast_cancer & linear dataset not converged using sm.Logit
        # not sure WHY, use sklearn instead.
        sk_model = linear_model.LogisticRegression()
        sk_model.fit(x, y)
        weights = [sk_model.intercept_[0]]
        weights.extend(list(sk_model.coef_[0]))
        denom = 2.0 * (1.0 + np.cosh(sk_model.decision_function(x)))
        denom = np.tile(denom, (ones_x.shape[1], 1)).T
        F_ij = np.dot((ones_x / denom).T, ones_x)
        Cramer_Rao = np.linalg.inv(F_ij)
        sigma_estimates = np.sqrt(np.diagonal(Cramer_Rao))
        z_scores = weights / sigma_estimates
        pvalues = [stat.norm.sf(abs(x)) * 2 for x in z_scores]

    bias = weights.pop(0)
    weights.append(bias)
    bias = pvalues.pop(0)
    pvalues.append(bias)
    _run_ss(env, pyus, x, y, pvalues, weights, 2, reg)
    _run_ss(env, pyus, x, y, pvalues, weights, 3, reg)


@tracing_checkpoint(APILevel.USERLAND)
def test_linear_ds():
    ds = pd.read_csv(dataset("linear"))
    y = ds["y"].values
    x = ds.drop(["y", "id"], axis=1).values

    _run_test(env, pyus, x, y, RegType.Logistic)
    _run_test(env, pyus, x, y, RegType.Linear)


@tracing_checkpoint(APILevel.USERLAND)
def test_breast_cancer_ds():
    from sklearn.datasets import load_breast_cancer

    ds = load_breast_cancer()
    x, y = ds["data"], ds["target"]

    _run_test(env, pyus, x, y, RegType.Logistic)
    _run_test(env, pyus, x, y, RegType.Linear)


@tracing_checkpoint(APILevel.USERLAND)
def test_ss_lr_logistic():
    ds = pd.read_csv(dataset("linear"))
    y = ds["y"].values
    x = ds.drop(["y", "id"], axis=1).values
    x, y = _build_splited_ds(pyus, x, y, 2)

    sslr = SSRegression(env.spu)
    sslr.fit(x, y, 3, 0.3, 128, "t1", "logistic", "l2", 0.5)
    model = sslr.save_model()
    sspv = SSPValue(env.spu)
    pvalues = sspv.pvalues(x, y, model)
    print(f" test_ss_lr_logistic {pvalues}\n")


@tracing_checkpoint(APILevel.USERLAND)
def test_ss_lr_linear():
    ds = pd.read_csv(dataset("linear"))
    y = ds["y"].values
    x = ds.drop(["y", "id"], axis=1).values
    x, y = _build_splited_ds(pyus, x, y, 2)

    sslr = SSRegression(env.spu)
    sslr.fit(x, y, 3, 0.3, 128, "t1", "linear", "l2", 0.5)
    model = sslr.save_model()
    sspv = SSPValue(env.spu)
    pvalues = sspv.pvalues(x, y, model)
    print(f" test_ss_lr_linear {pvalues}\n")


test_breast_cancer_ds()
test_linear_ds()
test_ss_lr_linear()
test_ss_lr_logistic()
