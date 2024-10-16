def main():
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument(
        "mode",
        type=str,
        default="sf",
        help="Mode of SecretNote to start, in [`sf`, `scql`]. Default: `sf`.",
    )
    args, rest_args = parser.parse_known_args()

    if args.mode == "scql":
        from .scql.server.app import SecretNoteApp

        SecretNoteApp().launch(rest_args)
    else:
        # mode == "sf" or anyhow, defaults to sf mode.
        from .sf.server.app import SecretNoteApp

        SecretNoteApp().launch(rest_args)


if __name__ == "__main__":
    main()
