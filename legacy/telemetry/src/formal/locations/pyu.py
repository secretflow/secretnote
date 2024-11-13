class SymbolicPYU:
    def __init__(self, name: str):
        self.name = name

    def reify(self):
        import secretflow

        return secretflow.PYU(self.name)
