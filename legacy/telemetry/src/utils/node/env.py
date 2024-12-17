import os


def NODE_ENV():
    try:
        return os.environ["NODE_ENV"]
    except KeyError:
        return "production"
