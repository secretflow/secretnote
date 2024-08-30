> Serves both Jupyter Server and static files.

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
