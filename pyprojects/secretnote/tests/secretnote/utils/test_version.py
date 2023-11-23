import pytest


class MockModule:
    def __init__(self, name: str, version: str) -> None:
        self.__name__ = name
        self.__version__ = version


def test_assert_version_equal():
    from secretnote.utils.version import assert_version

    module = MockModule("foo", "0.0.1")

    assert_version(module, "==0.0.1")

    with pytest.raises(AssertionError):
        assert_version(module, "==0.0.2")


def test_assert_version_range():
    from secretnote.utils.version import assert_version

    module = MockModule("foo", "0.0.1")

    with pytest.raises(AssertionError):
        assert_version(module, ">0.0.1")


def test_assert_version_compatible():
    from secretnote.utils.version import assert_version

    module = MockModule("foo", "1.1.3")

    with pytest.raises(AssertionError):
        assert_version(module, "~=1.0.0")

    assert_version(module, "~=1.0")


def test_assert_version_prerelease():
    from secretnote.utils.version import assert_version

    module = MockModule("foo", "1.1.3rc1")

    with pytest.raises(AssertionError):
        assert_version(module, ">=1.1.3")

    assert_version(module, ">=1.1.3rc1")
