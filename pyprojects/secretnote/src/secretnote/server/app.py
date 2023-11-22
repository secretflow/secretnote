from jupyter_server.extension.application import ExtensionApp, ExtensionAppJinjaMixin

from secretnote.utils.node import create_require

from . import JUPYTER_SERVER_EXTENSION_MODULE
from .handlers import SinglePageApplicationHandler
from .node.handler import nodes_handlers

require = create_require(__package__, "@secretflow/secretnote/index.html")

STATIC_PATH = require.package("@secretflow/secretnote/index.html").joinpath("dist")


class SecretNoteApp(ExtensionAppJinjaMixin, ExtensionApp):
    # -------------- Required traits --------------
    name = JUPYTER_SERVER_EXTENSION_MODULE

    load_other_extensions = True

    static_paths = [STATIC_PATH]
    template_paths = [STATIC_PATH]

    extension_url = "/secretnote/"
    static_url_prefix = "/secretnote/"

    def initialize_handlers(self):
        routes = [
            *nodes_handlers,
            (
                r"/secretnote/preview(.*)",
                SinglePageApplicationHandler,
                {"path": self.static_paths},
            ),
            (
                r"/secretnote(.*)",
                SinglePageApplicationHandler,
                {"path": self.static_paths},
            ),
        ]
        self.handlers.extend(routes)

    @classmethod
    def get_extension_package(cls):
        """Returns the name of the Python package containing this extension.

        This allows the extension to be loaded during launch_instance even when not
        explicitly enabled in Jupyter config.
        """

        return JUPYTER_SERVER_EXTENSION_MODULE
