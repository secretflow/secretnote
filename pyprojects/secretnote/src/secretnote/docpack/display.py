import json
from typing import Any, Tuple, Type, Union

import ipywidgets as widgets
from fastapi import FastAPI
from IPython.display import display

from secretnote.docpack.hazmat.markers import with_implementation_schema
from secretnote.instrumentation.snapshot import to_string
from secretnote.utils.pydantic import iter_union

from .hazmat.primitives import IO, Task


def get_type(t: Any) -> Union[Type[Any], Tuple]:
    try:
        issubclass(t, type)
    except TypeError:
        return tuple(get_type(t_) for t_ in iter_union(t))
    if issubclass(t, bool):
        return bool
    elif issubclass(t, str):
        return str
    elif issubclass(t, int):
        return int
    elif issubclass(t, float):
        return float
    elif issubclass(t, IO):
        return IO
    else:
        return t


def component_form(t: Type[Task]):
    inputs = {}
    for field_name, field in t.__fields__.items():
        type_ = get_type(field.type_)
        if type_ is int:
            i = widgets.IntText(description=field_name)
            inputs[field_name] = i
            display(i)
            continue
        elif type_ is str:
            i = widgets.Text(description=field_name)
            inputs[field_name] = i
            display(i)
            continue
        elif type_ is bool:
            i = widgets.Checkbox(description=field_name)
            inputs[field_name] = i
            display(i)
            continue
        elif type_ is float:
            i = widgets.FloatText(description=field_name)
            inputs[field_name] = i
            display(i)
            continue
        elif type_ is IO:
            i = widgets.FileUpload(description=field_name)
            inputs[field_name] = i
            display(i)
            continue
        elif isinstance(type_, tuple):
            i = widgets.Dropdown(description=field_name, options=map(to_string, type_))
            inputs[field_name] = i
            display(i)
            continue

    class ValueProxy:
        def __getattr__(self, __name: str) -> Any:
            return inputs[__name].value

        def to_kuscia(self):
            dict_ = {k: v.value for k, v in inputs.items()}
            return dict_

    return ValueProxy()


def component_schema(t: Type[Task]):
    app = FastAPI()

    async def endpoint(info: t) -> None:  # type: ignore
        ...

    metadata = t._task_metadata()
    path = f"/{metadata.vendor}/{metadata.namespace}/{metadata.name}"
    name = f"{metadata.namespace}::{metadata.name}"
    app.post(path, summary=name)(endpoint)

    schema = with_implementation_schema(app.openapi())

    print(json.dumps(schema, indent=2))
