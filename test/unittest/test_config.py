import os
import pytest
from werkzeug.datastructures import FileStorage
from utility.log import Log
# from utility.gen import *

import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from app.utilities.rsid import rsid_extract, rsid_match2
from app import app

# app.config['WTF_CSRF_ENABLED'] = False
TEST_DIRECTORY = 'testdocs'         # change this to the directory palcing docx files
TEST_DOCUMENT = 'document_0.docx'   # change this to sample .docx file
LOG_DIRECTORY = "logs"
LOG_FILE = "test_log.txt"
DEPTH_OF_EDIT = 5                   # Edit to increase or decrease depth, 10% usually fail at depth ~ 10

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
    test_directory = TEST_DIRECTORY
    current = TEST_DOCUMENT 
    current_file = os.path.join(test_directory, current)
    print(current_file)
    
    # Generate random .docx if current not in test_directory
    # if current not in os.listdir(test_directory):
    #     generate_docx(2)
    
    # Generate randomly edited .docx from current.docx
    # current_edit = current
    # for i in range(1, DEPTH_OF_EDIT + 1):
    #     edited = f'edited{i}_{current}'
    #     if edited not in os.listdir(test_directory):
    #         edit_docx(current_edit, edited)
    #     current_edit = edited
    
    return test_directory, current, current_file

@pytest.fixture(scope="class")
def client():
    app.config['DEBUG']
    with app.test_client() as client:
        with app.app_context():
            yield client