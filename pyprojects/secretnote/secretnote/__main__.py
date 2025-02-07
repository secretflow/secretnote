def main():
    import argparse, logging

    MODE_CHOICES = ["sf", "scql"]
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "_positionals",
        nargs=argparse.ZERO_OR_MORE,
        help=f"<mode>? <work_dir>?. <mode> in {MODE_CHOICES} (default: sf). <work_dir> (default: .).",
    )
    # [DEPRECATED] legacy --mode support
    _deprecationWarning = "[DEPRECATED] `--mode`. Use positional `mode` instead."
    parser.add_argument(
        "--mode",
        type=str,
        choices=MODE_CHOICES,
        required=False,
        help=_deprecationWarning,
    )
    args, rest_args = parser.parse_known_args()

    # normalize positional arguments
    positionals = args._positionals
    if len(positionals) == 0:
        positionals = ["sf", "."]
    elif len(positionals) == 1:
        p0 = positionals[0]
        positionals = [p0, "."] if p0 in MODE_CHOICES else ["sf", p0]
    else:
        positionals = positionals[:2]
    # normalize `mode` and `work_dir`
    if args.mode:
        logging.warning(_deprecationWarning)
    mode, work_dir = args.mode or positionals[0], positionals[1]

    if mode == "scql":
        from .scql.server.app import SecretNoteApp

        SecretNoteApp().launch([work_dir, *rest_args])
    else:
        from .sf.server.app import SecretNoteApp

        SecretNoteApp().launch([work_dir, *rest_args])


if __name__ == "__main__":
    main()
