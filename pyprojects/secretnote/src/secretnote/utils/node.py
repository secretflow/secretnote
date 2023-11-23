import json
import os
import shutil
import subprocess
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple

import importlib_resources
from loguru import logger
from pydantic import BaseModel


class PackageJSON(BaseModel):
    name: str
    version: str
    files: List[str] = []
    dependencies: Dict[str, str] = {}
    devDependencies: Dict[str, str] = {}
    peerDependencies: Dict[str, str] = {}


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

    def resolve(self, specifier: str) -> Path:
        try:
            return self.resolved_files[specifier]
        except KeyError:
            raise KeyError(f"{specifier} is not available") from None

    def package(self, specifier: str) -> Path:
        return find_package_json(self.resolve(specifier))[0]

    @property
    def source_package(self):
        return importlib_resources.files(self._source_package)

    @property
    def dist_dir(self):
        return self.source_package.joinpath("dist")

    def _resolve_all(self):
        files_node_require: Dict[str, Path] = {}
        files_find_static: Dict[str, Path] = {}

        err_node_require: Optional[str] = None
        err_find_static: Optional[str] = None

        specifiers = self._specifiers
        source_package = self.source_package

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
            dist_dir = self.dist_dir
            with importlib_resources.as_file(dist_dir) as path:
                if not path.is_dir():
                    raise FileNotFoundError(f"{dist_dir} does not exist")
                with open(path.joinpath("resources.json")) as f:
                    content = json.load(f)
                    files_find_static = {
                        k: path.joinpath(v).resolve() for k, v in content.items()
                    }
            if unresolved := set(specifiers) - set(files_find_static.keys()):
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
            files_node_require = {
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

        # prefer Node resolution
        self._resolved_files = files_node_require or files_find_static


def find_package_json(path: Path) -> Tuple[Path, PackageJSON]:
    while True:
        package_json = path.joinpath("package.json")
        if package_json.exists():
            return package_json.parent, PackageJSON.parse_file(package_json)
        if path == path.parent:
            raise FileNotFoundError("package.json not found")
        path = path.parent


def find_all_files(path: Path) -> Iterable[Path]:
    for item in path.iterdir():
        if item.is_dir():
            yield from find_all_files(item)
        elif item.is_file() or item.is_symlink():
            yield item


def copy_static_files(require: create_require):
    with importlib_resources.as_file(require.dist_dir) as root:
        shutil.rmtree(root, ignore_errors=True)

        resources: Dict[str, str] = {}
        packages: Dict[Path, PackageJSON] = {}

        for name, source in require.resolved_files.items():
            package_dir, package_json = find_package_json(source)
            packages[package_dir] = package_json

            relpath = source.relative_to(package_dir)
            target = root.joinpath(package_json.name).joinpath(relpath)
            resources[name] = str(target.relative_to(root))

            os.makedirs(target.parent, exist_ok=True)
            shutil.copy(source, target)

            logger.info(f"Copied {source} to {target}")

        for package_dir, package_json in packages.items():
            target_root = root.joinpath(package_json.name)

            for file in [*package_json.files, "package.json"]:
                source = package_dir.joinpath(file)
                target = target_root.joinpath(file)
                if not source.exists():
                    continue
                elif source.is_dir():
                    shutil.copytree(source, target, dirs_exist_ok=True)
                    logger.info(f"Copied {source} to {target}")
                elif source.is_file() or source.is_symlink():
                    os.makedirs(target.parent, exist_ok=True)
                    shutil.copy(source, target, follow_symlinks=True)
                    logger.info(f"Copied {source} to {target}")
                else:
                    continue

            for resource in find_all_files(target_root):
                name = resource.relative_to(root)
                resources[str(name)] = str(name)

        with open(root.joinpath("resources.json"), "w") as f:
            json.dump(resources, f)


def NODE_ENV():
    try:
        return os.environ["NODE_ENV"]
    except KeyError:
        return "production"
