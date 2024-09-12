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
            metadata = extract_metadata(file_path)
            
            assert metadata['title'] is not None
            assert metadata['created'] is not None
            assert metadata['paragraphs'] is not None
            
            test_log = f"{file} - metadata extracted - title: {metadata['title']} - created: {metadata['created']}"
            logger.log(test_log, 'info')