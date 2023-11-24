import os
import shutil
import subprocess
from pathlib import Path
from typing import Dict, List, Optional

from importlib_resources import as_file, files
from pydantic import BaseModel
from rich.tree import Tree

from secretnote.utils.path import find_all_files
from secretnote.utils.pprint import rformat

RESOLVE_SCRIPT = files().joinpath("resolve.mjs")


class PackageJSON(BaseModel):
    name: str
    version: str
    files: List[str] = []
    dependencies: Dict[str, str] = {}
    devDependencies: Dict[str, str] = {}
    peerDependencies: Dict[str, str] = {}


class Package(BaseModel):
    path: Path
    info: PackageJSON


class ResolutionInfo(BaseModel):
    bin: str
    version: str
    cwd: Optional[str] = None
    root: Optional[PackageJSON] = None

    resolved: Dict[str, Path]
    errors: List[str]

    def resolve_dist(self, dist: Path):
        self.resolved = {
            k: dist.joinpath(v).resolve() for k, v in self.resolved.items()
        }

    def print_params(self):
        tree = Tree("parameters:")
        tree.add(f"node: {self.bin}")
        tree.add(f"version: {self.version}")
        tree.add(f"cwd: {self.cwd}")
        tree.add(f"script: {RESOLVE_SCRIPT}")
        return tree

    def print_errors(self):
        tree = Tree("errors:")
        for error in self.errors:
            tree.add(error)
        return tree


class ResolutionFailure(RuntimeError):
    def __init__(self, node: ResolutionInfo, dist: ResolutionInfo):
        self.node = node
        self.dist = dist

    def __str__(self) -> str:
        tree = Tree("Failed to resolve all specifiers:")
        if self.node.errors:
            node = tree.add("Failed to resolve via node:")
            node.add(self.node.print_errors())
            node.add(self.node.print_params())
        if self.dist.errors:
            dist = tree.add("Failed to resolve via static files:")
            dist.add(self.dist.print_errors())
        return rformat(tree)


class create_require:
    def __init__(self, origin: str, *specifiers: str):
        self._origin = origin
        self._specifiers = specifiers
        self._resolved: ResolutionInfo

    @property
    def origin_dir(self):
        return files(self._origin)

    @property
    def dist_dir(self):
        return self.origin_dir.joinpath("dist")

    @property
    def package(self):
        """
        Find the Node package directory for the current package.
        """
        with as_file(self.origin_dir) as path:
            return find_package_json(path)

    @property
    def info(self):
        """
        Mapping from specifier to the resolved file path.

        This property is lazily evaluated.
        """
        try:
            return self._resolved
        except AttributeError:
            pass
        with as_file(self.origin_dir) as origin, as_file(self.dist_dir) as dist:
            self._resolved = resolve_specifiers(
                *self._specifiers,
                origin=origin,
                dist=dist,
            )
        return self._resolved

    def resolve(self, specifier: str, base: Optional[str] = None) -> Path:
        """
        Resolve a specifier to a file path.

        :raises KeyError: if the specifier was not initially provided
        :raises NodeResolutionError: if resolution failed
        """
        try:
            return self.info.resolved[specifier]
        except KeyError:
            pass
        # try to resolve the specifier as a relative path that may not
        # have been included verbatim in the specifiers
        # https://nodejs.org/api/esm.html#resolution-algorithm-specification 5
        if (
            specifier.startswith("/")
            or specifier.startswith("./")
            or specifier.startswith("../")
        ):
            with as_file(self.origin_dir) as root:
                path_map = {
                    root.joinpath(k).resolve(): v for k, v in self.info.resolved.items()
                }
            base_dir = files(base) if base else self.origin_dir
            with as_file(base_dir) as root:
                try:
                    return path_map[root.joinpath(specifier).resolve()]
                except KeyError:
                    pass
        raise KeyError(f"{specifier} is not available") from None

    def package_of(self, specifier: str):
        """
        Find the Node package directory for the given specifier.

        :raises FileNotFoundError: the specifier does not belong to a Node package,
        meaning a package.json could not be found
        """
        return find_package_json(self.resolve(specifier))

    def export(self):
        with as_file(self.dist_dir) as dist:
            export_resources(self.info, dist)


def node_resolve(*specifiers: str, origin: Path, env_path: Optional[str] = None):
    """Resolve specifiers to file paths using Node.

    Look for ``node`` on PATH, and run ``resolve.mjs`` in the given directory.
    The script uses ``require.resolve`` to resolve specifiers.
    """
    info: ResolutionInfo

    # refuse to run if installed in site-packages
    if "site-packages" in origin.parts:
        info = ResolutionInfo(
            bin="",
            version="",
            cwd=str(origin),
            resolved={},
            errors=["disabled in site-packages"],
        )
        return info

    node_bin = shutil.which("node", path=env_path)

    try:
        root_package = find_package_json(origin)
    except FileNotFoundError:
        root_package = None

    try:
        if node_bin is None:
            raise FileNotFoundError("node not found on PATH")

        with as_file(origin) as cwd, as_file(RESOLVE_SCRIPT) as script:
            response = subprocess.run(
                [node_bin, script],
                input="\n".join(specifiers),
                cwd=cwd,
                capture_output=True,
                text=True,
            )

        info = ResolutionInfo.parse_raw(response.stdout)

    except Exception as e:
        info = ResolutionInfo(
            bin=node_bin or "<not found>",
            version="",
            cwd=str(origin),
            resolved={},
            errors=[f"{type(e).__name__} while running node: {e}"],
        )

    info.root = root_package and root_package.info
    return info


def dist_resolve(*specifiers: str, dist: Path):
    """
    Resolve specifiers to file paths by reading ``resources.json``.

    We expect data files in `node_modules` to be packaged with the distribution
    under the ``dist`` directory.

    Further more, we expect an ``resources.json`` at the root of ``dist``,
    which is a mapping from module specifiers to the path of the corresponding
    data files, relative to ``dist``.

    Here, locate ``dist`` within ``package``.
    If ``package`` is not specified, use the current package.
    Then, read ``resources.json`` and populate ``resolved_files``.

    For example, if ``package`` is ``foo.bar`` and is on path ``/path/to/foo/bar``,
    the we are looking for `/path/to/foo/bar/dist/resources.json`.
    """
    info: ResolutionInfo

    try:
        with as_file(dist) as path:
            if not path.is_dir():
                raise FileNotFoundError(f"{dist} does not exist")

            info = ResolutionInfo.parse_file(path.joinpath("resources.json"))
            info.resolve_dist(dist)

            for specifier in set(specifiers) - set(info.resolved.keys()):
                info.errors.append(f"{specifier}: not included in dist")

    except Exception as e:
        info = ResolutionInfo(
            bin="",
            version="",
            cwd=str(dist),
            resolved={},
            errors=[f"{type(e).__name__} while finding static files: {e}"],
        )

    return info


def resolve_specifiers(*specifiers: str, origin: Path, dist: Path) -> ResolutionInfo:
    resolved = node_resolve(*specifiers, origin=origin)
    static = dist_resolve(*specifiers, dist=dist)

    if resolved is not None and not resolved.errors:
        # Node resolution succeeded
        return resolved

    if static is not None and not static.errors:
        # Node resolution failed, but static files are available
        return static

    raise ResolutionFailure(node=resolved, dist=static)


def export_resources(resolved: ResolutionInfo, dist: Path):
    shutil.rmtree(dist, ignore_errors=True)

    manifest = resolved.copy(deep=True)
    manifest.bin = "node"
    manifest.cwd = None

    packages: Dict[Path, PackageJSON] = {}

    for name, source in resolved.resolved.items():
        pkg = find_package_json(source)
        packages[pkg.path] = pkg.info

        relpath = source.relative_to(pkg.path)
        target = dist.joinpath(pkg.info.name).joinpath(relpath)

        manifest.resolved[name] = target.relative_to(dist)

        os.makedirs(target.parent, exist_ok=True)
        shutil.copy(source, target)

    for package_dir, package_json in packages.items():
        target_root = dist.joinpath(package_json.name)

        for file in [*package_json.files, "package.json"]:
            source = package_dir.joinpath(file)
            target = target_root.joinpath(file)
            if not source.exists():
                continue
            elif source.is_dir():
                shutil.copytree(source, target, dirs_exist_ok=True)
            elif source.is_file() or source.is_symlink():
                os.makedirs(target.parent, exist_ok=True)
                shutil.copy(source, target, follow_symlinks=True)
            else:
                continue

        for resource in find_all_files(target_root):
            name = resource.relative_to(dist)
            manifest.resolved[str(name)] = name

    with open(dist.joinpath("resources.json"), "w") as f:
        f.write(manifest.json())


def find_package_json(path: Path) -> Package:
    while True:
        package_json = path.joinpath("package.json")
        if package_json.exists():
            return Package(path=path, info=PackageJSON.parse_file(package_json))
        if path == path.parent:
            raise FileNotFoundError("package.json not found")
        path = path.parent
