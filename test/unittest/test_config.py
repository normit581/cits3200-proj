import os
import pytest
from werkzeug.datastructures import FileStorage
from utility.log import Log

import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from app.utilities.rsid import rsid_extract, rsid_match2
from app import app

# app.config['WTF_CSRF_ENABLED'] = False
docs_dir = 'testdocs'         # change this to the directory palcing docx files
current_dir = os.getcwd()     # get absolute path of unittest
parent_dir = os.path.abspath(os.path.join(current_dir, os.pardir))
test_dir = os.path.abspath(os.path.join(parent_dir, 'testdocs'))
TEST_DOCUMENT = 'document_0.docx'   # change this to sample .docx file
LOG_DIRECTORY = "logs"
LOG_FILE = "test_log.txt"

@pytest.fixture(scope="class")
def setup_logger():
    logger = Log()
    logger.set_log_path(LOG_DIRECTORY, LOG_FILE) 
    logger.log("START test", 'info')
    
    # Yield the logger for use in tests
    yield logger
    
    # Log the end message after all tests have run
    logger.log("END test\n", 'info')

@pytest.fixture(scope="class")
def setup_files():
    test_directory = test_dir
    current = TEST_DOCUMENT 
    current_file = os.path.join(test_directory, current)
    # print(current_file)
    
    return test_directory, current, current_file

@pytest.fixture(scope="class")
def client():
    with app.test_client() as client:
        with app.app_context():
            yield client