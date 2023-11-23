import warnings


def development_preview_warning():
    warnings.warn(
        "\n🟡 THIS IS A DEVELOPER PREVIEW 🧪🧪🧪"
        "\nAPI may change without prior notice. No guarantee is made about the"
        " security, correctness, performance, or usefulness of this feature.",
        FutureWarning,
        stacklevel=2,
    )
