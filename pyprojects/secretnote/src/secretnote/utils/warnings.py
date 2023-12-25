import warnings
from contextlib import contextmanager
from typing import Optional


def development_preview_warning():
    return
    warnings.warn(
        "\n🟡 THIS IS A DEVELOPER PREVIEW 🧪🧪🧪"
        "\nAPI may change without prior notice. No guarantee is made about the"
        " security, correctness, performance, or usefulness of this feature.",
        FutureWarning,
        stacklevel=2,
    )


class OptionalDependencyException(RuntimeError):
    def __init__(self, module: Optional[str], *features: str):
        self.module = module
        self.features = features

    def __str__(self) -> str:
        features = ",".join(self.features)
        return (
            f"Cannot import {self.module}."
            f"\nHint: Install SecretNote with the [{features}] extras:"
            f"\n  python -m pip install secretnote[{features}]"
        )


class PeerDependencyException(RuntimeError):
    def __init__(self, module: Optional[str], *packages: str):
        self.module = module
        self.packages = packages

    def __str__(self) -> str:
        packages = " ".join(self.packages)
        return (
            f"Cannot import {self.module}."
            f"\nError: You must install the following dependencies separately:"
            f"\n  python -m pip install {packages}"
        )


@contextmanager
def optional_dependencies(*features: str):
    try:
        yield
    except ImportError as e:
        raise OptionalDependencyException(e.name, *features) from e


@contextmanager
def peer_dependencies(*packages: str):
    try:
        yield
    except ImportError as e:
        raise PeerDependencyException(e.name, *packages) from e
