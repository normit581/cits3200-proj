import os
from test_config import *

import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.utilities.metadata import *

# test /app/utilities/metadat.py extract_metadata()
def test_metadata_extract(setup_logger, setup_files) :
    logger = setup_logger
    test_directory, current, current_file = setup_files
    logger.log("test_metadata()", 'info')

    for file in os.listdir(test_directory) :
        if file.endswith('docx') :
            file_path = os.path.join(test_directory, file)
            rsid1 = rsid_extract(file_path)
            rsid2 = rsid_extract(file_path)

            similarity, matching_rsid = rsid_match2(rsid1, rsid2)
            metadata1, metadata2 = extract_metadata(file_path, rsid1, rsid2, matching_rsid)
            
            assert metadata1['title'] is not None
            assert metadata1['created'] is not None
            assert metadata1['paragraphs'] is not None
            
            assert metadata2['title'] is not None
            assert metadata2['created'] is not None
            assert metadata2['paragraphs'] is not None
            
            test_log = f"{file} - metadata extracted - title: {metadata1['title']} - created: {metadata1['created']}"
            logger.log(test_log, 'info')