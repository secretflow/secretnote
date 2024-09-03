from os import makedirs, path


def get_db_path():
    """Get the URI of the SQLite database file for the SecretNote application."""
    from jupyter_core import paths

    jupyter_config_dir = paths.jupyter_config_dir()
    if not path.exists(jupyter_config_dir):
        makedirs(jupyter_config_dir)

    return f"sqlite:///{jupyter_config_dir}/secretnote.db"
