import json
from pathlib import Path


def get_version() -> str:
    try:
        from packaging.version import InvalidVersion, parse

        def normalize(version: str):
            try:
                return str(parse(version))
            except InvalidVersion:
                return version

    except ImportError:

        def normalize(version: str):
            return version

    try:
        # during development and after install
        # read from require
        from secretnote._resources import require

        return normalize(require.package.info.version)
    except Exception:
        pass

    try:
        # during packaging, where dependencies are not installed
        # read from ./dist/resources.json
        resources = Path(__file__).with_name("dist").joinpath("resources.json")
        with open(resources, "r") as file:
            return normalize(json.load(file)["root"]["version"])

    except Exception:
        pass

    try:
        # during repo bootstrapping
        # read from ../package.json
        package_json = Path(__file__).parent.joinpath("package.json")
        with open(package_json, "r") as file:
            return normalize(json.load(file)["version"])

    except Exception:
        pass

    return "0.0.0"
