import os


class Config(object):
    PROJECT_NAME = 'DocuMatcher'
    UPLOAD_EXTENSIONS = ['.docx']
    MAX_CONTENT_LENGTH = 210 * 1024 * 1024  #For additional headers
    MAX_FILES_UPLOAD = -1
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'never-guess'