import warnings


def development_preview_warning():
    warnings.warn(
        "\nTHIS IS A RESEARCH PREVIEW 🧪🧪🧪"
        "\nNo guarantee is made about the correctness, completeness,"
        "\nusefulness, or performance of this feature,"
        "and API may change without prior notice.",
        FutureWarning,
        stacklevel=2,
    )
