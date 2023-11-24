import json
from pathlib import Path


def get_version() -> str:
    try:
        # read from package.json
        from secretnote._resources import require

        return require.package.info.version
    except Exception:
        pass

    try:
        # for distribution, during which dependencies are not installed
        # read from ./dist/resources.json

        resources = Path(__file__).with_name("dist").joinpath("resources.json")

        with open(resources, "r") as file:
            return json.load(file)["root"]["version"]
    except Exception:
        # could happen during repo bootstrapping
        return "0.0.0"
