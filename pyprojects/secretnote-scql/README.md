# SecretNote

[Notebook] suite for [SecretFlow].

[Notebook]: https://jupyter.org
[SecretFlow]: https://www.secretflow.org.cn

**This is currently a developer preview.**

**API may change without prior notice. No guarantee is made about the security, correctness, performance, or usefulness of this feature.**

- [SecretNote](#secretnote)
  - [Install](#install)
  - [Start](#start)
  - [Features](#features)
    - [Using the profiler](#using-the-profiler)
  - [FAQ](#faq)
    - [Environment and dependency versioning](#environment-and-dependency-versioning)

## Install

**Please read our [note about dependencies](#environment-and-dependency-versioning) first.**

We recommend installing in a clean Python environment.

```bash
python --version
# Python 3.8.18
python -m venv .venv
source .venv/bin/activate
python -m pip install 'secretflow==1.2.0b0' 'secretnote==0.1.0.dev0'
```

## Start

In your terminal, run:

```bash
secretnote
```

Or:

```bash
python -m secretnote.server
```

Commonly-used [Jupyter command line options][jupyter-options] are supported. For example, to change the port:

```bash
secretnote --ServerApp.port 8889
```

[jupyter-options]: https://jupyterlab-server.readthedocs.io/en/latest/api/app-config.html

## Features

### Using the profiler

```python
from secretnote.instrumentation.sdk import create_profiler

with create_profiler() as profiler:
    # SecretFlow code here
    weights = alice(...)(...)
    bias = bob(...)(...)
    result = spu(...)(...)

profiler.visualize()
```

## FAQ

### Environment and dependency versioning

_For best results, install this project in a clean Python environment._

SecretFlow has many platform-specific dependencies. As this project is in early stage, we do not yet guarantee that this project will work in all environments, or even that installation will succeed.

Supported Python versions match those of [SecretFlow], currently only Python 3.8.

To see versions of commonly used dependencies, run `python -m secretnote.utils.version`:

```bash
> python -m secretnote.utils.version
environment info
├── system
│   └── platform = macosx-11.0-arm64
├── python
│   ├── version = 3.8.18
│   ├── path = ...
│   └── implementation = cpython
└── packages
    ├── grpc = 1.56.2
    ├── heu = 0.4.4b0
    ├── ipykernel = 6.27.0
    ├── ipython = 8.12.3
    ├── jaxlib = 0.4.12
    ├── jupyter_server = 2.10.1
    ├── pydantic = 1.10.13
    ├── ray = 2.6.3
    ├── secretflow = 1.2.0b0
    ├── secretnote = 0.1.0-dev.0
    ├── spu = 0.6.0b0
    ├── tensorflow = unavailable
    └── torch = 2.1.1
```

Issues usually arise when the versions of `grpc`, `jaxlib`, `ray`, and/or `secretflow` are not compatible with each other. Additionally, you may encounter issues on `macos-*-arm64` (Apple Silicon).
