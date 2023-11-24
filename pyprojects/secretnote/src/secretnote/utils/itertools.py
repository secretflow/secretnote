from collections.abc import Iterator


class NullIterator(Iterator):
    def __next__(self):
        raise StopIteration
