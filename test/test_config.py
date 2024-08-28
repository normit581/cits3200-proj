import os
import pytest
from utility.log import Log
from utility.gen import *

import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.utilities.rsid import rsid_extract, rsid_match2

@pytest.fixture(scope="class")
def setup_logger():
    logger = Log()
    logger.set_log_path("test_logs", "test_rsid_method.txt")
    logger.log("START test", 'info')
    
    # Yield the logger for use in tests
    yield logger
    
    # Log the end message after all tests have run
    logger.log("END test\n", 'info')

@pytest.fixture(scope="class")
def setup_files():
    test_directory = 'testdocs'
    current = 'document_0.docx' # change this to sample .docx file
    current_file = os.path.join(test_directory, current)
    
    # Generate random .docx if current not in test_directory
    if current not in os.listdir(test_directory):
        generate_docx(2)
    
    # Generate randomly edited .docx from current.docx
    test_depth = 5  # Edit to increase or decrease depth, 10% usually fail at depth ~ 10
    current_edit = current
    for i in range(1, test_depth + 1):
        edited = f'edited{i}_{current}'
        if edited not in os.listdir(test_directory):
            edit_docx(current_edit, edited)
        current_edit = edited
    
    return test_directory, current, current_file
