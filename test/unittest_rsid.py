import unittest
import os
import sys
from utility.log import Log
from utility.gen import *

# Add the project root directory to the sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.utilities.rsid import *

class TestRsidMethods(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls) :
        # test directory and original .docx
        cls.test_directory = 'testdocs'
        cls.current = 'document_0.docx'     # change current file to another file
        cls.current_file = os.path.join(cls.test_directory, cls.current)
        
        # logger setup
        cls.logger = Log()
        cls.logger.set_log_path("test_logs", "test_rsid_method.txt")
        cls.logger.log("START test rsid", 'info')
        
        # genrate random .docx if current not in test_directory
        if cls.current not in os.listdir(cls.test_directory) :    
            generate_docx(2)
        
        # generate randomly edited .docx from current.docx
        test_depth = 5      # edit to increase or decrease
        current = cls.current
        for i in range(1, test_depth + 1) :
            edited = f'edited{i}_{cls.current}'
            if edited not in os.listdir(cls.test_directory) :
                edit_docx(current, edited)
            current = edited
            
    @classmethod
    def tearDownClass(cls) :
        cls.logger.log("END test rsid\n", 'info')
    
    # test rsid_extract
    # check if the function return a dict is not None
    # check sum of values in dict equals to rsid count
    def test_rsid_extract(self):
        self.logger.log("test_rsid_extract()", 'info')
        
        for file in os.listdir(self.test_directory):
            if file.endswith('docx'):
                file_path = os.path.join(self.test_directory, file)
                rsid_dict, rsid_count = rsid_extract(file_path)
                
                self.assertIsNotNone(rsid_dict)
                self.assertEqual(rsid_count, sum(rsid_dict.values()))
                
                test_log = f"{file} - RSID count: {rsid_count} - RSID dictionary: {rsid_dict}"
                self.logger.log(test_log, 'info')
                    
    # test rsid_match2()
    # edited_docx file assume to has (matching result > 60) with original
    # different docx files should has (mathcing result < 60)
    def test_rsid_match2(self) :
        self.logger.log("test_rsid_match2()", 'info')
        rsid_dict1 = rsid_extract(self.current_file)
        
        for file in os.listdir(testdocx_dir) :
            compare_file = os.path.join(self.test_directory, file)
            rsid_dict2 = rsid_extract(compare_file)
            output = rsid_match2(rsid_dict1, rsid_dict2)
           
            if file == self.current : 
                continue
            
            if file.startswith('edited') : 
                self.assertGreaterEqual(output, 10)
                
            else : 
                self.assertLessEqual(output, 60)
        
            test_log = f"{self.current} - {file} - {output}"
            self.logger.log(test_log, 'info')

if __name__ == '__main__':
    unittest.main()