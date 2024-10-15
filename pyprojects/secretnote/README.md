# SecretNote

This is the backend of the notebook suite named [SecretNote](https://github.com/secretflow/secretnote). It serves both Jupyter Server, SecretNote specified APIs and static files of the playground, for both SecretFlow in Python and the SCQL.

## Installation

We recommend you to install in a clean Python 3.10 environment. You can use your favorite virtual environment solution.

### From PyPI

```sh
conda create -n secretnote python=3.10 # use conda for example
conda activate secretnote
pip install secretnote
```

### From Source

```sh
pnpm bootstrap # pnpm and rye are required
```

## Start Locally

Start SecretNote SF for SecretFlow Python programming

```bash
secretnote sf . --config=/somewhere/config.py
```

Start SecretNote SCQL for SCQL programming

```sh
secretnote scql . --config=/somewhere/config.py
```

Common [Jupyter Command Line Options][jupyter-options] are supported. For example, to change the port, use

```bash
secretnote sf . --ServerApp.port 8889
```

