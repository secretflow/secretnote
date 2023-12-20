import json
import sys
from typing import List, Type

from fastapi import FastAPI

from secretnote.utils.warnings import optional_dependencies

from .hazmat.compat import component_to_recipe
from .hazmat.markers import with_implementation_schema
from .hazmat.primitives import Task


def all_recipes() -> List[Type[Task]]:
    with optional_dependencies("secretflow"):
        from secretflow.component.entry import ALL_COMPONENTS

    return [component_to_recipe(component) for component in ALL_COMPONENTS]


def create_app() -> FastAPI:
    app = FastAPI()

    for recipe in all_recipes():
        metadata = recipe._task_metadata()
        path = f"/{metadata.vendor}/{metadata.namespace}/{metadata.name}"
        name = f"{metadata.namespace}::{metadata.name}"

        async def endpoint(info: recipe) -> None:  # type: ignore
            ...

        app.post(path, name=name)(endpoint)

    return app


def export_schema() -> None:
    app = create_app()
    schema = with_implementation_schema(app.openapi())
    sys.stdout.write(json.dumps(schema, indent=2))


if __name__ == "__main__":
    export_schema()
