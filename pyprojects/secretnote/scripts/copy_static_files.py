import secretnote.display.core.renderer
from secretnote.utils.node import copy_static_files

if __name__ == "__main__":
    copy_static_files(secretnote.display.core.renderer.require)
