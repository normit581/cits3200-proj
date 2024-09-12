import os

class FileHelper:
    @staticmethod
    def remove_extension(filename: str) -> str:
        """
        Removes the extension from the provided filename.
        """
        return os.path.splitext(filename)[0]