import os


class Config(object):
    UPLOAD_EXTENSIONS = ['.docx']
    MAX_CONTENT_LENGTH = 210 * 1024 * 1024 #For additional headers
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'never-guess'

class TestingConfig(object):
    TESTING = True
    MAX_CONTENT_LENGTH = 1 * 1024 * 1024
    DEBUG = True
    PRESERVE_CONTEXT_ON_EXCEPTION = False
    SERVER_NAME = 'localhost:5000'
    