import os


class Config(object):
    FLASK_APP = os.environ.get("FLASK_APP")
    DEBUG = os.environ.get("DEBUG")
