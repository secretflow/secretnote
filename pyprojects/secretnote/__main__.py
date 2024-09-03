if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument(
        "mode", type=str, help="Mode of SecretNote to start, in [`sf`, `scql`]."
    )
    args, rest_args = parser.parse_known_args()

    if args.mode == "sf":
        from .sf.server.app import SecretNoteApp

        SecretNoteApp().launch(rest_args)
    elif args.mode == "scql":
        from .scql.server.app import SecretNoteApp

        SecretNoteApp().launch(rest_args)
    else:
        raise ValueError(f"Invalid mode argument: {args.mode}")
