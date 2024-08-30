def _jupyter_server_extension_points():
    # See https://jupyter-server.readthedocs.io/en/latest/developers/extensions.html#making-an-extension-discoverable
    from .app import SecretNoteApp

    return [{"module": __package__, "app": SecretNoteApp}]
