import json
import uuid
from base64 import b64encode
from pathlib import Path
from typing import Any

from IPython.core.display import HTML
from IPython.display import display
from jinja2 import Environment, FileSystemLoader, select_autoescape

TEMPLATE_DIR = Path(__file__).parent.joinpath("templates")
STATIC_DIR = Path(__file__).parent.joinpath("static")

env = Environment(loader=FileSystemLoader(TEMPLATE_DIR), autoescape=select_autoescape())


def get_ui_bundle() -> str:
    bundle = STATIC_DIR.joinpath("dist/browser/index.js").read_text()
    bundle = b64encode(bundle.encode("utf-8")).decode("utf-8")
    bundle_data_url = f"data:text/javascript;base64,{bundle}"
    return bundle_data_url


def render_component(component: str, **kwargs: Any):
    template = env.get_template("component.html")
    element_id = f"elem-{uuid.uuid4()}"
    encoded_props = b64encode(json.dumps(kwargs).encode("utf-8")).decode("utf-8")
    result = template.render(
        component=component,
        script_uri=get_ui_bundle(),
        element_id=element_id,
        encoded_props=encoded_props,
    )
    display(HTML(result))
