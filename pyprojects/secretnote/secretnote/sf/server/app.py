# The implementation of the SecretNote application as an ExtensionApp of Jupyter Server.

import sys
import os
from jupyter_server.extension.application import ExtensionApp, ExtensionAppJinjaMixin
from .services.nodes_handlers import nodes_handlers
from .services.pages_handlers import pages_handlers
from .services.misc_handlers import misc_handlers
from .services.contents_handlers import contents_handlers

__dirname__ = os.path.dirname(__file__)


class SecretNoteApp(ExtensionAppJinjaMixin, ExtensionApp):
    """The SecretNote application acted as an ExtensionApp of Jupyter Server."""

    # Required traits of the ExtensionApp
    name = __package__  # type: ignore
    load_other_extensions = True
    extension_url = "/secretnote/"  # url prefix for APIs
    static_url_prefix = "/secretnote/"  # url prefix for static files

    @property
    def static_paths(self):
        """The static paths of the SecretNote frontend."""
        index = os.path.join(__dirname__, "../www")
        return [
            index,
        ]

    @property
    def template_paths(self):
        """SecretNote frontend does not use templates, so this is the same as static_paths."""
        return self.static_paths

    def initialize_handlers(self):
        """Register the handlers of the SecretNote application."""
        handlers = [
            *misc_handlers,
            *contents_handlers,
            *nodes_handlers,
            *pages_handlers,
        ]
        self.handlers.extend(handlers)

    @classmethod
    def get_extension_package(cls):
        return __package__

    @classmethod
    def launch(cls, argv=None):
        """Launch the app with command line arguments."""
        if argv is None:
            args = sys.argv[1:]  # slice out extension config
        else:
            args = argv

        cls.launch_instance(
            [
                "--ServerApp.ip=*",  # allow all IP addresses
                "--ServerApp.token=",
                "--ServerApp.password=",
                *args,
                # view config_dev.py / jupyter_server_config.py for more
            ]
        )
