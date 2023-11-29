from base64 import b64encode

from jinja2 import Template, select_autoescape
from pydantic import BaseModel

from secretnote._resources import require
from secretnote.utils.node import NODE_ENV
from secretnote.utils.pydantic import ORJSONConfig


def get_ui_bundle() -> str:
    if NODE_ENV() == "development":
        bundle = require.resolve("@secretflow/secretnote-ui/browser").read_text()
    else:
        bundle = require.resolve("@secretflow/secretnote-ui/bundled").read_text()
    bundle = b64encode(bundle.encode("utf-8")).decode("utf-8")
    bundle_data_uri = f"data:text/javascript;base64,{bundle}"
    return bundle_data_uri


class ComponentProps(BaseModel):
    class Config(ORJSONConfig):
        pass

    @classmethod
    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        name = cls.__name__
        if not name.endswith("Props"):
            raise TypeError(f"ComponentProps subclass {name} must end with 'Props'")

    @property
    def _component_name(self) -> str:
        return type(self).__name__[:-5]

    def _repr_html_(self) -> str:
        component_name = self._component_name
        payload = self.json(by_alias=True, exclude_none=True)
        encoded_props = b64encode(payload.encode("utf-8")).decode("utf-8")
        template = Template(
            require.resolve("./templates/component.html", __package__).read_text(),
            autoescape=select_autoescape(["html", "xml"], default_for_string=True),
        )
        return template.render(
            component=component_name,
            script_uri=get_ui_bundle(),
            encoded_props=encoded_props,
        )
