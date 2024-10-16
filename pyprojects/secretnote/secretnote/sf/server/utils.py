from os import makedirs, path


def get_db_path():
    """Get the URI of the SQLite database file for the SecretNote application."""
    from jupyter_core import paths

    jupyter_config_dir = paths.jupyter_config_dir()  # ~/.jupyter by default
    if not path.exists(jupyter_config_dir):
        makedirs(jupyter_config_dir)

    return f"sqlite:///{jupyter_config_dir}/secretnote.db"


def get_default_kernelspecs():
    """Get the default kernelspecs as string."""
    return r"""{
        "default": "python3",
        "kernelspecs": {
            "python3": {
            "name": "python3",
            "spec": {
                "argv": ["python", "-m", "ipykernel_launcher", "-f", "{connection_file}"],
                "env": {},
                "display_name": "Python 3 (ipykernel)",
                "language": "python",
                "interrupt_mode": "signal",
                "metadata": { "debugger": true }
            },
            "resources": {
                "logo-32x32": "/kernelspecs/python3/logo-32x32.png",
                "logo-svg": "/kernelspecs/python3/logo-svg.svg",
                "logo-64x64": "/kernelspecs/python3/logo-64x64.png"
            }
            }
        }
    }"""
