import unittest
import os
import sys
from utility.log import Log
from utility.gen import *

# Add the project root directory to the sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.utilities.rsid import *

class TestRsidMethods(unittest.TestCase):
    test_directory = 'testdocs'
    logger = Log()
    logger.set_log_path("test_logs", "test_rsid_method.txt")
    logger.log("Start test", 'info')
    
    # test rsid_extract
    # check if the function return a dict is not None
    # check sum of values in dict equals to rsid count
    def test_rsid_extract(self):
        self.logger.log("test_rsid_extract: Starting tests", 'info')
        
        for file in os.listdir(self.test_directory):
            if file.endswith('docx'):
                file_path = os.path.join(self.test_directory, file)
                rsid_dict, rsid_count = rsid_extract(file_path)
                
                self.assertIsNotNone(rsid_dict, "RSID dictionary should not be None.")
                self.assertEqual(rsid_count, sum(rsid_dict.values()), 
                                "The sum of RSID counts does not match the expected rsid_count.")
                
                test_log = f"{file} - RSID count: {rsid_count} - RSID dictionary: {rsid_dict}"
                self.logger.log(test_log, 'info')
                    
    # test rsid_match2()
    # edited_docx file assume to has (matching result > 60) with original
    # different docx files should has (mathcing result < 60)
    def test_rsid_match2(self) :
        self.logger.log("test_rsid_match2: Starting tests", 'info')
        current = 'document_0.docx'
        current_file = os.path.join(self.test_directory, current)
        rsid_dict1 = rsid_extract(current_file)
        
        edit_docx('document_0.docx', 'edited_document_0.docx')
        edit_docx('edited_document_0.docx', 'edited_edited_document_0.docx')
        
        for file in os.listdir(testdocx_dir) :
            compare_file = os.path.join(self.test_directory, file)
            rsid_dict2 = rsid_extract(compare_file)
            output = rsid_match2(rsid_dict1, rsid_dict2)
           
            if file == current : 
                continue
            
            if file.startswith('edited') : 
                self.assertGreaterEqual(output, 60)
                
            else : 
                self.assertLessEqual(output, 60)
            
            test_log = f"{current} - {file} - {output}"
            self.logger.log(test_log, 'info')

if __name__ == '__main__':
    generate_docx(2)
    unittest.main()
