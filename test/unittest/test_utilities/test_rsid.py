import os
from test_config import *

import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.utilities.rsid import rsid_extract, rsid_match2

# test /app/utilities/rsid.py function rsid_extract()
# check if the function return a dict is not None
# check sum of values in dict equals to rsid count
def test_rsid_extract(setup_logger, setup_files):
    logger = setup_logger
    test_directory, current, current_file = setup_files
    logger.log("test_rsid_extract()", 'info')
    
    for file in os.listdir(test_directory):
        if file.endswith('docx'):
            file_path = os.path.join(test_directory, file)
            rsid_dict, rsid_count = rsid_extract(file_path)
            
            assert rsid_dict is not None
            count = 0
            for k in rsid_dict :
                count += rsid_dict[k]['count']
    
            assert rsid_count == count
            
            test_log = f"{file} - RSID count: {rsid_count}"
            logger.log(test_log, 'info')

# test /app/utilities/rsid.py function rsid_match()
# edited_docx file assume to has (matching result > 60) with original
# different docx files should has (mathcing result < 60)
def test_rsid_match2(setup_logger, setup_files):
    logger = setup_logger
    test_directory, current, current_file = setup_files
    logger.log("test_rsid_match2()", 'info')
    rsid_dict1 = rsid_extract(current_file)
    
    for file in os.listdir(test_directory):
        if file == current:
            continue
        
        compare_file = os.path.join(test_directory, file)
        rsid_dict2 = rsid_extract(compare_file)
        rsid_match, matching_risd, common_rsid_count = rsid_match2(rsid_dict1, rsid_dict2)
        
        assert rsid_match is not None
        assert matching_risd is not None
        assert common_rsid_count is not None
        
        test_log = f"{current} - {file} - {rsid_match}"
        logger.log(test_log, 'info')

