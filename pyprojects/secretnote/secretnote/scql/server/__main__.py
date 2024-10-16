# The very entry point of the SecretNote Jupyter Server.

if __name__ == "__main__":
    from .app import SecretNoteApp

    SecretNoteApp.launch()
