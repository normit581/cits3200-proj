import os


class Config(object):
    UPLOAD_EXTENSIONS = ['.docx']
    MAX_CONTENT_LENGTH = 210 * 1024 * 1024 #For additional headers
    DEBUG = os.environ.get("DEBUG")
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'never-guess'
