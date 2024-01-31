import rich
from hatchling.builders.hooks.plugin.interface import BuildHookInterface
from importlib_resources import as_file


class CustomBuildHook(BuildHookInterface):
    def initialize(self, version, build_data) -> None:
        from secretnote._resources import require
        from secretnote.utils.path import path_to_tree

        require.export()

        rich.print("Exported assets:")
        with as_file(require.dist_dir) as path:
            rich.print(path_to_tree(path))
