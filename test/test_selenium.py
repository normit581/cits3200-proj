import unittest
from selenium import webdriver
from flask import url_for
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoAlertPresentException
import time

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app import create_app
from app.config import TestingConfig
class FlaskSeleniumTest(unittest.TestCase):
    
    # setup
    @classmethod
    def setUpClass(cls):
        cls.app = create_app(TestingConfig)
        cls.app_context = cls.app.app_context()
        cls.app_context.push()

        #  web driver
        cls.driver = webdriver.Chrome()

        # start test server
        cls.app.testing = True
        cls.app.test_client().get('/')

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()
        cls.app_context.pop()

    def setUp(self):
        if not self.client:
            self.skipTest('Web browser not available')
    def tearDown(self):
        pass
    # tests
    # def test_drag_and_drop_files(self):
    #     # wait 5 secs for drop_area to be available
    #     drop_area = WebDriverWait(self.driver, 3).until(
    #         EC.element_to_be_clickable(By.CSS_SELECTOR, ".drop-zone") 
    #     )

    #     current_dir = os.path.dirname(os.path.abspath(__file__))
    #     # set files to use in drag and drop operation
    #     files = {
    #         'file1': os.path.join(current_dir, 'doc1Student.docx'),
    #         'file2': os.path.join(current_dir, 'doc2Student.docx'),
    #         'file3': os.path.join(current_dir, 'doc2Student.docx')
    #     }
        
    #     # highlight drop area
    #     self.driver.execute_script("arguments[0].style.border = '2px dashed red';", drop_area)

    #     # create actions object
    #     actions = ActionChains(self.driver)

    #     # drag and drop files
    #     for file_name, file_path in files.items():
    #         actions.drag_and_drop_by_offset(drop_area, 100, 100).perform()

    #     # test cases
    #     # more than max_files
    #     try:
    #         WebDriverWait(self.driver, 5).until(EC.alert_is_present())
    #         alert = self.driver.switch_to.alert
        
    #         # verify text
    #         alert_text = alert.text
    #         assert "Maximum of 2 files reached" in alert_text

    #         alert.accept()
    #     except NoAlertPresentException:
    #         assert False, "Alert for maximum files reached not displayed."

    


if __name__ == "__main__":
    unittest.main() 