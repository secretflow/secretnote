import json
import os
import shutil
import subprocess
from pathlib import Path
from typing import Dict, Optional

import importlib_resources


def NODE_ENV():
    try:
        return os.environ["NODE_ENV"]
    except KeyError:
        return "production"


class create_require:
    def __init__(self, source_package: str, *specifiers: str):
        self._source_package = source_package
        self._specifiers = specifiers
        self._resolved_files: Dict[str, Path]

    @property
    def resolved_files(self):
        try:
            return self._resolved_files
        except AttributeError:
            self._resolve_all()
            return self._resolved_files

    def resolve(self, specifier: str):
        try:
            return self.resolved_files[specifier]
        except KeyError:
            raise KeyError(f"{specifier} is not available") from None

    def copy_to(self, dir: Path):
        ...

    def _resolve_all(self):
        resolved_files: Dict[str, Path] = {}
        err_node_require: Optional[str] = None
        err_find_static: Optional[str] = None

        source_package = importlib_resources.files(self._source_package)
        specifiers = self._specifiers

        # Method 1: for distribution
        #
        # We expect data files in `node_modules` to be packaged with the distribution.
        # Further more, we expect an `resources.json` at the root of `node_modules`,
        # which is a mapping from module specifiers to the path of the corresponding
        # data files, relative to `node_modules`.
        #
        # Here, locate `node_modules` within `package`.
        # If `package` is not specified, use the current package.
        # Then, read `resources.json` and populate `resolved_files`.
        #
        # Example, if `package` is `foo.bar` and is on path `/path/to/foo/bar`,
        # the we are looking for `/path/to/foo/bar/node_modules/resources.json`.
        try:
            for file in source_package.iterdir():
                if file.name != "node_modules" or not file.is_dir():
                    continue
                with importlib_resources.as_file(file) as path:
                    with open(path.joinpath("resources.json")) as f:
                        content = json.load(f)
                        resolved_files = {
                            k: path.joinpath(v).resolve() for k, v in content.items()
                        }
                break
            else:
                raise FileNotFoundError(f"node_modules not found in {source_package}")
            if unresolved := set(specifiers) - set(resolved_files.keys()):
                raise KeyError(f"Failed to resolve these specifiers: {[*unresolved]}")
        except Exception as e:
            err_find_static = str(e)

        # Method 2: during development
        # We expect `node` to be available on PATH. We will use `require.resolve`.
        try:
            node_bin = shutil.which("node")
            if node_bin is None:
                raise FileNotFoundError("node not found on PATH")
            script: str = ""
            for specifier in specifiers:
                script += f"console.log(require.resolve({json.dumps(specifier)}));"
            with importlib_resources.as_file(source_package) as cwd:
                result = subprocess.run(
                    [node_bin, "-e", script],
                    cwd=cwd,
                    capture_output=True,
                    text=True,
                    check=True,
                )
            resolved_files = {
                k: Path(v).resolve()
                for k, v in zip(specifiers, result.stdout.strip().splitlines())
            }
        except subprocess.CalledProcessError as e:
            err_node_require = e.stderr.strip()
        except OSError as e:
            err_node_require = str(e)

        if err_node_require is not None and err_find_static is not None:
            error = (
                "Failed to resolve all specifiers:"
                f"\nLooking for static files resulted in: {err_find_static}"
                f"\nModule resolution using Node resulted in: {err_node_require}"
            )
            raise RuntimeError(error)

        self._resolved_files = resolved_files
