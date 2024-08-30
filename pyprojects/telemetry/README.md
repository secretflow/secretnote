# SecretNote Telemetry

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
