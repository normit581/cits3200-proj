import os


class Config(object):
    PROJECT_NAME = 'DocuMatcher'
    UPLOAD_EXTENSIONS = ['.docx']
    MAX_CONTENT_LENGTH = 210 * 1024 * 1024 #For additional headers
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'never-guess'
    MAX_FILES_UPLOAD = -1

class TestingConfig(object):
    TESTING = True
    DEBUG = True
    PRESERVE_CONTEXT_ON_EXCEPTION = False
    SERVER_NAME = 'localhost:5000'
    MAX_CONTENT_LENGTH = 20 * 1 * 1024 * 1024
    MAX_FILES_UPLOAD = 20
