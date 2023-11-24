import json
from pathlib import Path

import pytest

from secretnote.utils.node.resolve import (
    ResolutionFailure,
    create_require,
    dist_resolve,
    node_resolve,
)
from secretnote.utils.path import find_all_files

NODE_MODULES_PATH = Path(__file__).with_name("node_modules")
DIST_PATH = Path(__file__).with_name("dist")
THIS_PACKAGE = Path(__file__).parent


@pytest.fixture(scope="function")
def node_require():
    yield create_require(__package__, "./assets/index.html", "foo/bar", "@foo/bar")


@pytest.fixture(scope="function")
def node_require_failed():
    yield create_require(__package__, "./assets/nonexistent.html", "foo/baz")


@pytest.fixture(scope="function")
def dist_require():
    from . import distributed

    yield create_require(distributed.__package__, "loremipsum/dolor.js")


@pytest.fixture(scope="function")
def dist_require_failed():
    from . import distributed

    yield create_require(distributed.__package__, "loremipsum/sit.js")


def test_relative_path(node_require: create_require):
    assert (
        node_require.resolve("./assets/index.html")
        == THIS_PACKAGE / "assets" / "index.html"
    )


def test_relative_path_with_alias(node_require: create_require):
    assert (
        node_require.resolve("../node/assets/index.html")
        == THIS_PACKAGE / "assets" / "index.html"
    )

    with pytest.raises(KeyError):
        node_require.resolve("../node/assets/nonexistent.html")


def test_bare_specifier(node_require: create_require):
    assert node_require.resolve("foo/bar") == NODE_MODULES_PATH / "foo" / "lib.js"


def test_bare_specifier_with_scope(node_require: create_require):
    assert (
        node_require.resolve("@foo/bar")
        == NODE_MODULES_PATH / "@foo" / "bar" / "index.js"
    )


def test_unavailable(node_require: create_require):
    with pytest.raises(KeyError):
        node_require.resolve("foo/baz")


def test_this_package(node_require: create_require):
    assert node_require.package.path == THIS_PACKAGE


def test_package_of(node_require: create_require):
    assert node_require.package_of("foo/bar").path == NODE_MODULES_PATH / "foo"


def test_dist_require(dist_require: create_require):
    assert (
        dist_require.resolve("loremipsum/dolor.js")
        == THIS_PACKAGE / "distributed" / "dist" / "lorem" / "dolor.js"
    )


def test_node_require_failure(node_require_failed: create_require):
    with pytest.raises(ResolutionFailure) as exc:
        node_require_failed.resolve("./assets/nonexistent.html")

    error = str(exc.value)

    assert "./assets/nonexistent.html: Cannot find module" in error
    assert "foo/baz: Error [ERR_PACKAGE_PATH_NOT_EXPORTED]" in error


def test_dist_require_failure(dist_require_failed: create_require):
    with pytest.raises(ResolutionFailure) as exc:
        dist_require_failed.resolve("loremipsum/sit.js")

    error = str(exc.value)

    assert "loremipsum/sit.js: not included in dist" in error


def test_node_not_found():
    result = node_resolve("foo/bar", origin=Path(__file__).parent, env_path="/bin")
    assert len(result.errors) == 1 and "node not found on PATH" in result.errors[0]


def test_non_package():
    require = create_require(__package__, "/bin/bash")
    with pytest.raises(FileNotFoundError):
        require.package_of("/bin/bash")


def test_roundtripping(node_require: create_require):
    node_require.export()

    with open(DIST_PATH / "resources.json") as f:
        raw_manifest = json.load(f)
        for path in raw_manifest["resolved"].values():
            assert not Path(path).is_absolute()

    for expected in find_all_files(NODE_MODULES_PATH):
        relpath = expected.relative_to(NODE_MODULES_PATH)
        assert DIST_PATH.joinpath(relpath).exists()

    info = dist_resolve(
        "./assets/index.html",
        "foo/bar",
        "@foo/bar",
        dist=DIST_PATH,
    )

    for path in info.resolved.values():
        assert Path(path).exists()

    assert info.root and info.root.name == "test-resolve"

    require = create_require(__package__, "./assets/index.html")
    require._resolved = info

    from .submodule import _test_relative_resolve_from_different_module

    assert (
        _test_relative_resolve_from_different_module(require)
        == DIST_PATH / info.root.name / "assets" / "index.html"
    )


def test_no_node_resolve_in_site_packages():
    from secretnote.utils.node.resolve import node_resolve

    info = node_resolve(
        "./assets/index.html",
        "foo/bar",
        "@foo/bar",
        origin=Path("/usr/local/lib/python3.11/site-packages"),
    )

    assert not info.resolved
    assert "disabled in site-packages" in info.errors
