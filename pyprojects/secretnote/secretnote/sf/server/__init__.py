JUPYTER_SERVER_EXTENSION_MODULE = __package__


def _jupyter_server_extension_points():
    # See https://jupyter-server.readthedocs.io/en/latest/developers/extensions.html#making-an-extension-discoverable

    from .app import SecretNoteApp

    return [{"module": JUPYTER_SERVER_EXTENSION_MODULE, "app": SecretNoteApp}]
