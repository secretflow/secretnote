from typing import Any

from packaging.specifiers import SpecifierSet
from packaging.version import Version


def assert_version(
    module: Any,
    expected: str,
    *,
    version_attr: str = "__version__",
) -> None:
    """Assert that a module's version satisfies a requirement.

    This is useful for ensuring for determining package compatibility at runtime, which
    is necessary because it is difficult to guarantee package versions in Python
    environments.
    """
    current_version = Version(getattr(module, version_attr))
    acceptable_versions = SpecifierSet(expected)

    if current_version.is_prerelease:
        satisfied = acceptable_versions.contains(current_version, prereleases=True)
    else:
        satisfied = current_version in acceptable_versions

    name = getattr(module, "__name__", str(module))

    assert (
        satisfied
    ), f"This program requires {name} {expected}, but you have {current_version}"
