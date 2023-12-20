import warnings
from contextlib import contextmanager

from loguru import logger


def development_preview_warning():
    warnings.warn(
        "\n🟡 THIS IS A DEVELOPER PREVIEW 🧪🧪🧪"
        "\nAPI may change without prior notice. No guarantee is made about the"
        " security, correctness, performance, or usefulness of this feature.",
        FutureWarning,
        stacklevel=2,
    )


@contextmanager
def optional_dependencies(*features: str):
    try:
        yield
    except ImportError as e:
        module_name = e.name
        extras = ",".join(features)
        logger.exception(
            "Cannot import {module_name}.\nHint: Install SecretNote with"
            " the [{extras}] extras: python -m pip install secretflow[{extras}]",
            module_name=module_name,
            extras=extras,
        )
        if "secretflow" in features:
            logger.exception(
                "You must install SecretFlow separately:"
                " python -m pip install secretflow"
            )
        raise SystemExit(1) from e
