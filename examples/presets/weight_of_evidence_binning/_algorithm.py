import secretflow as sf
from secretflow.preprocessing.binning.vert_woe_binning import VertWoeBinning
from secretflow.preprocessing.binning.vert_woe_substitution import VertWOESubstitution
from secretflow.utils.simulation.datasets import load_linear

from secretnote.formal.locations import OnDemandDevice

devices = OnDemandDevice(globals())

alice = devices(sf.PYU, "alice")
bob = devices(sf.PYU, "bob")
spu = devices(sf.SPU, "alice", "bob")

parts = {
    bob: (1, 11),
    alice: (11, 22),
}
vdf = load_linear(parts=parts)

label_data = vdf["y"]
y = sf.reveal(label_data.partitions[alice].data).values


binning = VertWoeBinning(spu)
bin_rules = binning.binning(
    vdf,
    binning_method="chimerge",
    bin_num=4,
    bin_names={alice: [], bob: ["x5", "x7"]},
    label_name="y",
)

woe_sub = VertWOESubstitution()
vdf = woe_sub.substitution(vdf, bin_rules)

# this is for demo only, be careful with reveal
print(sf.reveal(vdf.partitions[alice].data))
print(sf.reveal(vdf.partitions[bob].data))

# alice is label holder
dict_pyu_object = bin_rules[alice]


def extract_name_and_feature_iv(list_of_feature_iv_info):
    return [(d["name"], d["feature_iv"]) for d in list_of_feature_iv_info]


feature_ivs = alice(
    lambda dict_pyu_object: extract_name_and_feature_iv(
        dict_pyu_object["feature_iv_info"]
    )
)(dict_pyu_object)

# we can give the feature_ivs to bob
feature_ivs.to(bob)
# and/or we can reveal it to see it
sf.reveal(feature_ivs)
