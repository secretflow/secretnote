from jupyter_server.base.handlers import JupyterHandler
from jupyter_server.extension.handler import (
    ExtensionHandlerJinjaMixin,
    ExtensionHandlerMixin,
)


class BaseTemplateHandler(
    ExtensionHandlerJinjaMixin, ExtensionHandlerMixin, JupyterHandler
):
    """The base template handler."""

    pass


class TemplateHandler(BaseTemplateHandler):
    """A template handler."""

    def get(self):
        """Optionally, you can print(self.get_template('simple1.html'))"""
        self.write(self.render_template("secretnote.html"))


class ErrorHandler(BaseTemplateHandler):
    """An error handler."""

    def get(self, path):
        """Write_error renders template from error.html file."""
        self.write_error(400)
