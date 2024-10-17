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
        # use sf mode by default
        from .sf.server.app import SecretNoteApp

        SecretNoteApp().launch(
            rest_args if args.mode == "sf" else [args.mode, *rest_args]
        )


if __name__ == "__main__":
    main()
