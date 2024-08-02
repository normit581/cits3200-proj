import os


class Config(object):
    DEBUG = os.environ.get("DEBUG")
