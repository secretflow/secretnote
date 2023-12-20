from jupyter_server.extension.application import ExtensionApp, ExtensionAppJinjaMixin

from secretnote._resources import require

from . import JUPYTER_SERVER_EXTENSION_MODULE
from .handlers import SinglePageApplicationHandler
from .node.handler import nodes_handlers


def static_path():
    package = require.package_of("@secretflow/secretnote/index.html")
    return str(package.path.joinpath("dist").resolve())


class SecretNoteApp(ExtensionAppJinjaMixin, ExtensionApp):
    # -------------- Required traits --------------
    name = JUPYTER_SERVER_EXTENSION_MODULE

    load_other_extensions = True

    extension_url = "/secretnote/"
    static_url_prefix = "/secretnote/"

    @property
    def static_paths(self):
        return [static_path()]

    @property
    def template_paths(self):
        return self.static_paths

    def initialize_handlers(self):
        routes = [
            *nodes_handlers,
            (
                r"/secretnote(.*)",
                SinglePageApplicationHandler,
                {"path": static_path(), "default_filename": "index.html"},
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

    # @classmethod
    # def launch(cls, argv=None):
    #     if argv is None:
    #         args = sys.argv[1:]  # slice out extension config.
    #     else:
    #         args = argv

    #     cls.launch_instance(
    #         [
    #             "--ServerApp.token=''",
    #             "--ServerApp.allow_origin=*",
    #             "--ServerApp.allow_remote_access=True",
    #             "--ServerApp.disable_check_xsrf=True",
    #             "--ServerApp.ip=*",
    #             *args,
    #         ]
    #     )
