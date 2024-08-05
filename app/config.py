import os


class Config(object):
    UPLOAD_EXTENSIONS = ['.docx']
    DEBUG = os.environ.get("DEBUG")
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'never-guess'
