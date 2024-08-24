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
    logger.log("START test rsid", 'info')
    
    # Yield the logger to the test
    yield logger
    
    # This will be executed after all tests have run
    logger.log("END test rsid\n", 'info')

@pytest.fixture(scope="class")
def setup_files():
    test_directory = 'testdocs'
    current = 'document_0.docx'
    current_file = os.path.join(test_directory, current)
    
    # Generate random .docx if current not in test_directory
    if current not in os.listdir(test_directory):
        generate_docx(2)
    
    # Generate randomly edited .docx from current.docx
    test_depth = 20  # Edit to increase or decrease depth
    current_edit = current
    for i in range(1, test_depth + 1):
        edited = f'edited{i}_{current}'
        if edited not in os.listdir(test_directory):
            edit_docx(current_edit, edited)
        current_edit = edited
    
    return test_directory, current, current_file

def test_rsid_extract(setup_logger, setup_files):
    logger = setup_logger
    test_directory, current, current_file = setup_files
    logger.log("test_rsid_extract()", 'info')
    
    for file in os.listdir(test_directory):
        if file.endswith('docx'):
            file_path = os.path.join(test_directory, file)
            rsid_dict, rsid_count = rsid_extract(file_path)
            
            assert rsid_dict is not None
            assert rsid_count == sum(rsid_dict.values())
            
            test_log = f"{file} - RSID count: {rsid_count} - RSID dictionary: {rsid_dict}"
            logger.log(test_log, 'info')

def test_rsid_match2(setup_logger, setup_files):
    logger = setup_logger
    test_directory, current, current_file = setup_files
    logger.log("test_rsid_match2()", 'info')
    rsid_dict1 = rsid_extract(current_file)
    
    for file in os.listdir(test_directory):
        compare_file = os.path.join(test_directory, file)
        rsid_dict2 = rsid_extract(compare_file)
        output = rsid_match2(rsid_dict1, rsid_dict2)
        
        if file == current:
            continue
        
        if file.startswith('edited'):
            assert output >= 10
        else:
            assert output <= 60
        
        test_log = f"{current} - {file} - {output}"
        logger.log(test_log, 'info')
