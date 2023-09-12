import types

from packaging.specifiers import SpecifierSet
from packaging.version import Version


def assert_version(
    module: types.ModuleType,
    expected: str,
    version_attr: str = "__version__",
) -> None:
    current_version = Version(getattr(module, version_attr))
    acceptable_versions = SpecifierSet(expected)

    if current_version.is_prerelease:
        satisfied = acceptable_versions.contains(current_version, prereleases=True)
    else:
        satisfied = current_version in acceptable_versions

    assert satisfied, (
        f"This program requires {module.__name__} {expected},"
        f" but you have {current_version}"
    )
