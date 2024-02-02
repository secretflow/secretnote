import sys

from jupyter_server.extension.application import ExtensionApp, ExtensionAppJinjaMixin

from secretnote._resources import require

from . import JUPYTER_SERVER_EXTENSION_MODULE
from .services.broker.handlers import broker_handlers
from .services.nodes.handlers import nodes_handlers
from .services.pages.handlers import pages_handlers


class SecretNoteApp(ExtensionAppJinjaMixin, ExtensionApp):
    # -------------- Required traits --------------
    name = JUPYTER_SERVER_EXTENSION_MODULE

    load_other_extensions = True
    extension_url = "/secretnote/"
    static_url_prefix = "/secretnote/"

    @property
    def static_paths(self):
        package = require.package_of("@secretflow/secretnote/index.html")
        return [package.path.joinpath("dist")]

    @property
    def template_paths(self):
        return self.static_paths

    def initialize_handlers(self):
        routes = [
            *nodes_handlers,
            *broker_handlers,
            *pages_handlers,
        ]
        self.handlers.extend(routes)

    @classmethod
    def get_extension_package(cls):
        """Returns the name of the Python package containing this extension.

        This allows the extension to be loaded during launch_instance even when not
        explicitly enabled in Jupyter config.
        """

        return JUPYTER_SERVER_EXTENSION_MODULE

    @classmethod
    def launch(cls, argv=None):
        """Launch the app with command line arguments."""

        if argv is None:
            args = sys.argv[1:]  # slice out extension config.
        else:
            args = argv

        cls.ensure_extension_url(args)

        cls.launch_instance(
            [
                "--ServerApp.token=''",
                "--ServerApp.allow_origin=*",
                "--ServerApp.allow_remote_access=True",
                "--ServerApp.disable_check_xsrf=True",
                "--ServerApp.ip=*",
                *args,
            ]
        )

    @classmethod
    def ensure_extension_url(cls, args):
        for arg in args:
            if arg.startswith("--mode="):
                pathname = arg.split("=")[1]
                cls.extension_url += pathname
                break
