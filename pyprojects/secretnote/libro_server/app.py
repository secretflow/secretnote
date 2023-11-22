import os
import sys

from jupyter_server.extension.application import ExtensionApp, ExtensionAppJinjaMixin

from libro_server.handler import ErrorHandler, TemplateHandler
from libro_server.node.handler import nodes_handlers

DEFAULT_STATIC_FILES_PATH = os.path.join(os.path.dirname(__file__), "static")
DEFAULT_TEMPLATE_FILES_PATH = os.path.join(os.path.dirname(__file__), "template")


class LibroApp(ExtensionAppJinjaMixin, ExtensionApp):
    # -------------- Required traits --------------
    name = "secretnote"
    default_url = "/secretnote"
    load_other_extensions = True
    file_url_prefix = "/secretnote-render"

    # Local path to static files directory.
    static_paths = [DEFAULT_STATIC_FILES_PATH]

    # Local path to templates directory.
    template_paths = [DEFAULT_TEMPLATE_FILES_PATH]

    # ----------- add custom traits below ---------

    def initialize_settings(self):
        """Initialize settings."""
        # Update the self.settings trait to pass extra
        # settings to the underlying Tornado Web Application.
        self.log.info(f"Config {self.config}")

    def initialize_handlers(self):
        """Initialize handlers."""
        self.handlers.extend(nodes_handlers)
        self.handlers.extend(
            [
                # Static files
                (rf"/{self.name}/?", TemplateHandler),
                (rf"/{self.name}/preview/?", TemplateHandler),
                # Error handlers
                (rf"/{self.name}/(.*)", ErrorHandler),
            ]
        )

    @classmethod
    def launch(self, argv=None):
        if argv is None:  # noqa
            args = sys.argv[1:]  # slice out extension config.
        else:
            args = argv

        self.launch_instance(
            [
                "--ServerApp.token=''",
                "--ServerApp.allow_origin=*",
                "--ServerApp.allow_remote_access=True",
                "--ServerApp.disable_check_xsrf=True",
                "--ServerApp.ip=*",
                *args,
            ]
        )


# -----------------------------------------------------------------------------
# Main entry point
# -----------------------------------------------------------------------------

main = launch = LibroApp.launch

if __name__ == "__main__":
    main()
