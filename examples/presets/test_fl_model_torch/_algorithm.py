import os
import tarfile
import tempfile

import numpy as np
import requests
import torch
from secretflow import PYU
from secretflow.device import reveal
from secretflow.ml.nn import FLModel
from secretflow.ml.nn.fl.compress import COMPRESS_STRATEGY
from secretflow.ml.nn.fl.utils import metric_wrapper, optim_wrapper
from secretflow.ml.nn.utils import BaseModule, TorchModel
from secretflow.preprocessing.encoder import OneHotEncoder
from secretflow.security.aggregation import PlainAggregator, SparsePlainAggregator
from secretflow.security.privacy import DPStrategyFL, GaussianModelDP
from secretflow.utils.simulation.datasets import load_iris, load_mnist
from torch import nn, optim
from torch.nn import functional as F
from torchmetrics import Accuracy, Precision

from secretnote.formal.locations import OnDemandDevice

devices = OnDemandDevice(globals())


class sf_simulation_setup_devices:
    alice = devices(PYU, "alice")
    bob = devices(PYU, "bob")
    carol = devices(PYU, "carol")


class MlpNet(BaseModule):
    """Small mlp network for Iris"""

    def __init__(self):
        super(MlpNet, self).__init__()
        self.layer1 = nn.Linear(4, 50)
        self.layer2 = nn.Linear(50, 50)
        self.layer3 = nn.Linear(50, 3)

    def forward(self, x):
        x = F.relu(self.layer1(x))
        x = F.relu(self.layer2(x))
        x = F.relu(self.layer3(x))
        x = F.softmax(x, dim=1)
        return x


# model define for conv
class ConvNet(BaseModule):
    """Small ConvNet for MNIST."""

    def __init__(self):
        super(ConvNet, self).__init__()
        self.conv1 = nn.Conv2d(1, 3, kernel_size=3)
        self.fc_in_dim = 192
        self.fc = nn.Linear(self.fc_in_dim, 10)

    def forward(self, x):
        x = F.relu(F.max_pool2d(self.conv1(x), 3))
        x = x.view(-1, self.fc_in_dim)
        x = self.fc(x)
        return F.softmax(x, dim=1)


class ConvNetBase(BaseModule):
    """Small ConvNet basenet for MNIST."""

    def __init__(self):
        super(ConvNetBase, self).__init__()
        self.conv1 = nn.Sequential(
            nn.Conv2d(
                in_channels=1,
                out_channels=3,
                kernel_size=3,
            ),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=3),
        )

        # fully connected layer, output 10 classes
        self.out = nn.Linear(192, 64)

    def forward(self, x):
        x = self.conv1(x)
        x = x.view(x.size(0), -1)
        output = self.out(x)
        return output

    def output_num(self):
        return 1


class ConvNetFuse(BaseModule):
    """Small ConvNet basenet for MNIST."""

    def __init__(self):
        super(ConvNetFuse, self).__init__()
        self.fc1 = nn.Linear(64 * 2, 100)
        self.fc2 = nn.Linear(100, 10)

    def forward(self, x):
        x = torch.cat(x, dim=1)
        x = x.view(-1, 128)
        x = self.fc1(x)
        x = self.fc2(x)
        return x


class ConvNetFuseAgglayer(BaseModule):
    """Small ConvNet basenet for MNIST."""

    def __init__(self):
        super(ConvNetFuseAgglayer, self).__init__()
        self.fc1 = nn.Linear(64, 100)
        self.fc2 = nn.Linear(100, 10)

    def forward(self, x):
        x = x.view(-1, 64)
        x = self.fc1(x)
        x = self.fc2(x)
        return x


class ConvRGBNet(BaseModule):
    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.network = nn.Sequential(
            nn.Conv2d(
                in_channels=3, out_channels=16, kernel_size=3, stride=1, padding=1
            ),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),
            nn.Conv2d(16, 16, kernel_size=3, stride=1, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),
            nn.Flatten(),
            nn.Linear(16 * 45 * 45, 128),
            nn.ReLU(),
            nn.Linear(128, 5),
        )

    def forward(self, xb):
        return self.network(xb)


_temp_dir = tempfile.mkdtemp()

NUM_CLASSES = 10
INPUT_SHAPE = (28, 28, 1)


def download_and_extract(url, cache_dir, filename=None, extract=True):
    if not filename:
        filename = os.path.basename(url)
    download_path = os.path.join(cache_dir, filename)

    # Download the file
    response = requests.get(url, stream=True)
    if response.status_code == 200:
        with open(download_path, "wb") as file:
            for chunk in response.iter_content(chunk_size=1024):
                file.write(chunk)
    else:
        raise Exception(
            f"Failed to download {url}. Status code: {response.status_code}"
        )

    # Extract the tarball
    if extract and download_path.endswith(".tar.gz"):
        with tarfile.open(download_path, "r:gz") as tar:
            tar.extractall(path=cache_dir)
        return os.path.join(cache_dir, os.path.splitext(filename)[0])
    else:
        return download_path


path_to_flower_dataset = download_and_extract(
    "https://secretflow-data.oss-accelerate.aliyuncs.com/datasets/tf_flowers/flower_photos.tgz",
    _temp_dir,
)


def _torch_model_with_mnist(
    devices, model_def, data, label, strategy, backend, **kwargs
):
    device_list = [devices.alice, devices.bob]
    server = devices.carol

    if strategy in COMPRESS_STRATEGY:
        aggregator = SparsePlainAggregator(server)
    else:
        aggregator = PlainAggregator(server)

    # spcify params
    dp_spent_step_freq = kwargs.get("dp_spent_step_freq", None)
    num_gpus = kwargs.get("num_gpus", 0)
    fl_model = FLModel(
        server=server,
        device_list=device_list,
        model=model_def,
        aggregator=aggregator,
        strategy=strategy,
        backend=backend,
        random_seed=1234,
        num_gpus=num_gpus,
    )
    history = fl_model.fit(
        data,
        label,
        validation_data=(data, label),
        epochs=2,
        batch_size=128,
        aggregate_freq=2,
        dp_spent_step_freq=dp_spent_step_freq,
    )
    result = fl_model.predict(data, batch_size=128)
    assert len(reveal(result[device_list[0]])) == 4000
    global_metric, _ = fl_model.evaluate(data, label, batch_size=128, random_seed=1234)

    assert (
        global_metric[0].result().numpy()
        == history.global_history["val_multiclassaccuracy"][-1]
    )

    assert global_metric[0].result().numpy() > 0.5

    model_path_test = os.path.join(_temp_dir, "base_model")
    fl_model.save_model(model_path=model_path_test, is_test=True)
    model_path_dict = {
        devices.alice: os.path.join(_temp_dir, "alice_model"),
        devices.bob: os.path.join(_temp_dir, "bob_model"),
    }
    fl_model.save_model(model_path=model_path_dict, is_test=False)

    new_fed_model = FLModel(
        server=server,
        device_list=device_list,
        model=model_def,
        aggregator=None,
        backend=backend,
        random_seed=1234,
        num_gpus=num_gpus,
    )
    new_fed_model.load_model(model_path=model_path_dict, is_test=False)
    new_fed_model.load_model(model_path=model_path_test, is_test=True)
    reload_metric, _ = new_fed_model.evaluate(
        data, label, batch_size=128, random_seed=1234
    )

    np.testing.assert_equal(
        [m.result().numpy() for m in global_metric],
        [m.result().numpy() for m in reload_metric],
    )


def test_torch_model(sf_simulation_setup_devices):
    (_, _), (mnist_data, mnist_label) = load_mnist(
        parts={
            sf_simulation_setup_devices.alice: 0.4,
            sf_simulation_setup_devices.bob: 0.6,
        },
        normalized_x=True,
        categorical_y=True,
        is_torch=True,
    )

    loss_fn = nn.CrossEntropyLoss
    optim_fn = optim_wrapper(optim.Adam, lr=1e-2)
    model_def = TorchModel(
        model_fn=ConvNet,
        loss_fn=loss_fn,
        optim_fn=optim_fn,
        metrics=[
            metric_wrapper(
                Accuracy, task="multiclass", num_classes=10, average="micro"
            ),
            metric_wrapper(
                Precision, task="multiclass", num_classes=10, average="micro"
            ),
        ],
    )

    # Test fed_avg_w with mnist
    _torch_model_with_mnist(
        devices=sf_simulation_setup_devices,
        model_def=model_def,
        data=mnist_data,
        label=mnist_label,
        strategy="fed_avg_w",
        backend="torch",
        # num_gpus=0.25,
    )

    # Test fed_avg_g with mnist
    _torch_model_with_mnist(
        devices=sf_simulation_setup_devices,
        model_def=model_def,
        data=mnist_data,
        label=mnist_label,
        strategy="fed_avg_g",
        backend="torch",
    )

    # Test fed_avg_u with mnist
    _torch_model_with_mnist(
        devices=sf_simulation_setup_devices,
        model_def=model_def,
        data=mnist_data,
        label=mnist_label,
        strategy="fed_avg_u",
        backend="torch",
    )

    # Test fed_prox with mnist
    _torch_model_with_mnist(
        devices=sf_simulation_setup_devices,
        model_def=model_def,
        data=mnist_data,
        label=mnist_label,
        strategy="fed_prox",
        backend="torch",
        mu=0.1,
    )

    # Test fed_stc with mnist
    _torch_model_with_mnist(
        devices=sf_simulation_setup_devices,
        model_def=model_def,
        data=mnist_data,
        label=mnist_label,
        strategy="fed_stc",
        backend="torch",
        sparsity=0.9,
    )

    # Test fed_scr with mnist
    _torch_model_with_mnist(
        devices=sf_simulation_setup_devices,
        model_def=model_def,
        data=mnist_data,
        label=mnist_label,
        strategy="fed_scr",
        backend="torch",
        threshold=0.8,
    )

    # Define DP operations
    gaussian_model_gdp = GaussianModelDP(
        noise_multiplier=0.001,
        l2_norm_clip=0.1,
        num_clients=2,
        is_secure_generator=False,
    )
    dp_strategy_fl = DPStrategyFL(model_gdp=gaussian_model_gdp)
    dp_spent_step_freq = 10

    _torch_model_with_mnist(
        devices=sf_simulation_setup_devices,
        model_def=model_def,
        data=mnist_data,
        label=mnist_label,
        strategy="fed_stc",
        backend="torch",
        threshold=0.9,
        dp_strategy=dp_strategy_fl,
        dp_spent_step_freq=dp_spent_step_freq,
    )


def test_torch_model_mlp(sf_simulation_setup_devices):
    aggregator = PlainAggregator(sf_simulation_setup_devices.carol)
    hdf = load_iris(
        parts=[
            sf_simulation_setup_devices.alice,
            sf_simulation_setup_devices.bob,
        ],
        aggregator=aggregator,
    )

    label = hdf["class"]
    # do preprocess
    encoder = OneHotEncoder()
    label = encoder.fit_transform(label)

    data = hdf.drop(columns="class", inplace=False)
    data = data.fillna(data.mean(numeric_only=True).to_dict())

    loss_fn = nn.CrossEntropyLoss
    optim_fn = optim_wrapper(optim.Adam, lr=5e-3)
    model_def = TorchModel(
        model_fn=MlpNet,
        loss_fn=loss_fn,
        optim_fn=optim_fn,
        metrics=[
            metric_wrapper(Accuracy, task="multiclass", num_classes=3, average="micro"),
            metric_wrapper(
                Precision, task="multiclass", num_classes=3, average="micro"
            ),
        ],
    )
    device_list = [
        sf_simulation_setup_devices.alice,
        sf_simulation_setup_devices.bob,
    ]

    fl_model = FLModel(
        server=sf_simulation_setup_devices.carol,
        device_list=device_list,
        model=model_def,
        aggregator=aggregator,
        sparsity=0.0,
        strategy="fed_avg_w",
        backend="torch",
        random_seed=1234,
        # num_gpus=0.5,  # here is no GPU in the CI environment, so it is temporarily
        # commented out.
    )

    history = fl_model.fit(
        data,
        label,
        validation_data=(data, label),
        epochs=20,
        batch_size=32,
        aggregate_freq=1,
    )
    global_metric, _ = fl_model.evaluate(data, label, batch_size=32, random_seed=1234)
    assert (
        global_metric[0].result().numpy()
        == history.global_history["val_multiclassaccuracy"][-1]
    )
    model_path = os.path.join(_temp_dir, "base_model")
    fl_model.save_model(model_path=model_path, is_test=True)
    # FIXME(fengjun.feng)
    # assert os.path.exists(model_path) != None

    # test load model
    new_model_def = TorchModel(
        model_fn=MlpNet,
        optim_fn=optim_fn,
        metrics=[
            metric_wrapper(Accuracy, task="multiclass", num_classes=3, average="micro"),
            metric_wrapper(
                Precision, task="multiclass", num_classes=3, average="micro"
            ),
        ],
    )
    new_fed_model = FLModel(
        server=sf_simulation_setup_devices.carol,
        device_list=device_list,
        model=new_model_def,
        aggregator=None,
        backend="torch",
        random_seed=1234,
    )
    new_fed_model.load_model(model_path=model_path, is_test=True)
    reload_metric, _ = new_fed_model.evaluate(
        data, label, batch_size=128, random_seed=1234
    )

    np.testing.assert_equal(
        [m.result().numpy() for m in global_metric],
        [m.result().numpy() for m in reload_metric],
    )


def test_torch_model_databuilder(sf_simulation_setup_devices):
    aggregator = PlainAggregator(sf_simulation_setup_devices.carol)
    hdf = load_iris(
        parts=[sf_simulation_setup_devices.alice, sf_simulation_setup_devices.bob],
        aggregator=aggregator,
    )

    label = hdf["class"]

    def create_dataset_builder(
        batch_size=32,
        train_split=0.8,
        shuffle=True,
        random_seed=1234,
    ):
        def dataset_builder(x, stage="train"):
            import math

            import numpy as np
            from torch.utils.data import DataLoader
            from torch.utils.data.sampler import SubsetRandomSampler
            from torchvision import datasets, transforms

            # Define dataset
            flower_transform = transforms.Compose(
                [
                    transforms.Resize((180, 180)),
                    transforms.ToTensor(),
                ]
            )
            flower_dataset = datasets.ImageFolder(x, transform=flower_transform)
            dataset_size = len(flower_dataset)
            # Define sampler

            indices = list(range(dataset_size))
            if shuffle:
                np.random.seed(random_seed)
                np.random.shuffle(indices)
            split = int(np.floor(train_split * dataset_size))
            train_indices, val_indices = indices[:split], indices[split:]
            train_sampler = SubsetRandomSampler(train_indices)
            valid_sampler = SubsetRandomSampler(val_indices)

            # Define databuilder
            train_loader = DataLoader(
                flower_dataset, batch_size=batch_size, sampler=train_sampler
            )
            valid_loader = DataLoader(
                flower_dataset, batch_size=batch_size, sampler=valid_sampler
            )

            # Return
            if stage == "train":
                train_step_per_epoch = math.ceil(split / batch_size)
                return train_loader, train_step_per_epoch
            elif stage == "eval":
                eval_step_per_epoch = math.ceil((dataset_size - split) / batch_size)
                return valid_loader, eval_step_per_epoch

        return dataset_builder

    data_builder_dict = {
        sf_simulation_setup_devices.alice: create_dataset_builder(
            batch_size=32,
            train_split=0.8,
            shuffle=False,
            random_seed=1234,
        ),
        sf_simulation_setup_devices.bob: create_dataset_builder(
            batch_size=32,
            train_split=0.8,
            shuffle=False,
            random_seed=1234,
        ),
    }

    loss_fn = nn.CrossEntropyLoss
    optim_fn = optim_wrapper(optim.Adam, lr=1e-3)
    model_def = TorchModel(
        model_fn=ConvRGBNet,
        loss_fn=loss_fn,
        optim_fn=optim_fn,
        metrics=[
            metric_wrapper(Accuracy, task="multiclass", num_classes=5, average="micro"),
            metric_wrapper(
                Precision, task="multiclass", num_classes=5, average="micro"
            ),
        ],
    )
    device_list = [
        sf_simulation_setup_devices.alice,
        sf_simulation_setup_devices.bob,
    ]

    fl_model = FLModel(
        server=sf_simulation_setup_devices.carol,
        device_list=device_list,
        model=model_def,
        aggregator=aggregator,
        sparsity=0.0,
        strategy="fed_avg_w",
        backend="torch",
        random_seed=1234,
    )
    data = {
        sf_simulation_setup_devices.alice: path_to_flower_dataset,
        sf_simulation_setup_devices.bob: path_to_flower_dataset,
    }

    history = fl_model.fit(
        data,
        None,
        validation_data=data,
        epochs=2,
        aggregate_freq=1,
        dataset_builder=data_builder_dict,
    )
    global_metric, _ = fl_model.evaluate(
        data,
        label,
        batch_size=32,
        dataset_builder=data_builder_dict,
    )

    assert (
        global_metric[0].result().numpy()
        == history.global_history["val_multiclassaccuracy"][-1]
    )
    model_path = os.path.join(_temp_dir, "base_model")
    fl_model.save_model(model_path=model_path, is_test=True)
    # FIXME(fengjun.feng)
    # assert os.path.exists(model_path) != None


test_torch_model(sf_simulation_setup_devices)
test_torch_model_mlp(sf_simulation_setup_devices)
test_torch_model_databuilder(sf_simulation_setup_devices)
