from secretnote.utils.node.resolve import create_require


def _test_relative_resolve_from_different_module(require: create_require):
    return require.resolve("../assets/index.html", __package__)
