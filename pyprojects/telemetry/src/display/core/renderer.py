from base64 import b64encode

from IPython.core.display import HTML
from jinja2 import Template, select_autoescape
from pydantic import BaseModel

from secretnote._resources import require


def get_ui_bundle() -> str:
    bundle = require.resolve("@secretflow/secretnote-ui/bundled").read_text()
    bundle = b64encode(bundle.encode("utf-8")).decode("utf-8")
    bundle_data_uri = f"data:text/javascript;base64,{bundle}"
    return bundle_data_uri


def render(elem: BaseModel):
    component_name = type(elem).__name__
    props = elem.json(by_alias=True, exclude_none=True)
    encoded_props = b64encode(props.encode("utf-8")).decode("utf-8")
    template = Template(
        require.resolve("./templates/component.html", __package__).read_text(),
        autoescape=select_autoescape(["html", "xml"], default_for_string=True),
    )
    result = template.render(
        component=component_name,
        script_uri=get_ui_bundle(),
        encoded_props=encoded_props,
    )
    return HTML(result)
