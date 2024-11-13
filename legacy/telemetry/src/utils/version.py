import platform
import sys
import sysconfig
from collections import defaultdict
from importlib import import_module
from typing import Any

from packaging.specifiers import SpecifierSet
from packaging.version import Version
from rich.text import Text

from .pprint import dict_to_tree, rformat


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


def environment_info():
    info = defaultdict(dict)

    info["system"] = {
        "platform": Text(sysconfig.get_platform(), style="bold green"),
    }

    info["python"] = {
        "version": platform.python_version(),
        "path": sys.executable,
        "implementation": sys.implementation.name,
    }

    for name, version_module, attr in sorted(
        (
            ("secretnote", None, None),
            ("secretflow", None, None),
            ("spu", None, None),
            ("heu", None, None),
            ("jaxlib", None, None),
            ("ray", None, None),
            ("grpc", None, None),
            ("pydantic", None, None),
            ("jupyter_server", None, None),
            ("ipython", "IPython", None),
            ("ipykernel", "ipykernel._version", None),
            ("torch", None, None),
            ("tensorflow", None, None),
        )
    ):
        attr = attr or "__version__"
        version_module = version_module or name
        try:
            module = import_module(version_module)
            version = getattr(module, attr)
            info["packages"][name] = Text(version, style="cyan")
        except ImportError:
            info["packages"][name] = Text("unavailable", style="dim")
        except Exception as e:
            msg = Text(f"{type(e).__name__}: {str(e)}", style="red")
            msg.truncate(30, overflow="ellipsis")
            info["packages"][name] = msg

    return info


if __name__ == "__main__":
    print(rformat(dict_to_tree("environment info", environment_info())).strip())
