import asyncio
import logging
import os
import sys
from pathlib import Path
from typing import Optional, Union

import loguru

from .node.env import NODE_ENV

IGNORED_ERRORS = (asyncio.TimeoutError,)


class InterceptHandler(logging.Handler):
    def emit(self, record):
        # Get corresponding Loguru level if it exists
        try:
            level = loguru.logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        # Find caller from where originated the logged message
        frame, depth = logging.currentframe().f_back, 2
        while frame and frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        loguru.logger.opt(
            depth=depth,
            exception=record.exc_info,
        ).log(level, record.getMessage())


def no_spinner():
    return os.environ.get("CI") or not sys.stderr.isatty()


def formatter_tty(record: "loguru.Record") -> str:
    if record["extra"].get("raw_output"):
        return "{message}\n"
    prefix = "<bold><level>{level: <8}</level></bold>"
    message = "{message}"
    if record["level"].no >= logging.WARNING:
        message = "<level>{message}</level>"
    if record["exception"] and record["exception"].type not in IGNORED_ERRORS:
        return f"{prefix} {message}\n{{exception}}\n"
    return f"{prefix} {message}\n"


def formatter_ci(record: "loguru.Record") -> str:
    if record["extra"].get("raw_output"):
        return "{message}\n"
    fmt = (
        "{time:YYYY-MM-DD HH:mm:ss.SSS ZZ} {level: <8}"
        " {message} [{name}:{function}:{line}]\n"
    )
    if record["exception"] and record["exception"].type not in IGNORED_ERRORS:
        return f"{fmt}{{exception}}"
    return fmt


def configure_logging(
    *,
    log_file: Optional[Union[str, Path]] = None,
    level: Union[int, str] = logging.INFO,
):
    if log_file or no_spinner():
        formatter = formatter_ci
    else:
        formatter = formatter_tty
    loguru.logger.configure(
        handlers=[
            {
                "sink": log_file or sys.stderr,
                "level": level,
                "format": formatter,
            },
        ],
        levels=[
            {"name": "DEBUG", "color": "<magenta>"},
            {"name": "INFO", "color": "<blue>"},
            {"name": "SUCCESS", "color": "<bold><green>"},
            {"name": "WARNING", "color": "<yellow>"},
            {"name": "ERROR", "color": "<red>"},
            {"name": "CRITICAL", "color": "<bold><red>"},
        ],
    )
    logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)


def log_dev_exception(*args, **kwargs):
    if NODE_ENV() == "development":
        loguru.logger.exception(*args, **kwargs)
