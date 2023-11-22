import warnings


def development_preview_warning():
    warnings.warn(
        "\n🟡 THIS IS A DEVELOPER PREVIEW 🧪🧪🧪"
        "\nAPI may change without prior notice. No guarantee is made about the"
        " correctness, completeness, performance, or usefulness of this feature.",
        FutureWarning,
        stacklevel=2,
    )
