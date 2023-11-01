import abc
from typing import Callable, Generic, List, TypeVar

from secretnote.utils.logging import log_dev_exception

T = TypeVar("T", contravariant=True)
A = TypeVar("A")
R = TypeVar("R", covariant=True)


class Parser(abc.ABC, Generic[T, A, R]):
    def __init__(self) -> None:
        self.parsers: List[Callable[[T], R]] = []

    @abc.abstractmethod
    def data_name(self, data: T) -> str:
        raise NotImplementedError

    @abc.abstractmethod
    def rule_name(self, options: A) -> str:
        raise NotImplementedError

    def parse(self, options: A):
        rule_name = self.rule_name(options)

        def wrapper(fn: Callable[[T], R]) -> Callable[[T], R]:
            def wrapped(data: T) -> R:
                if self.data_name(data) != rule_name:
                    raise NotImplementedError
                return fn(data)

            self.parsers.append(wrapped)

            return fn

        return wrapper

    def __call__(self, data: T):
        for parser in self.parsers:
            try:
                return parser(data)
            except NotImplementedError:
                continue
            except Exception as e:
                log_dev_exception(e)
                continue
