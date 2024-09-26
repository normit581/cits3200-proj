import threading
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

localHost = "http://localhost:5000/"
current_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "test_files")

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
        # cls.app.testing = True
        # cls.app.test_client().get('/')
        cls.driver.get('http://127.0.0.1:5000')         # we have to start the server manually for now

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()
        cls.app_context.pop()

    def setUp(self):
        self.driver.get(localHost)
        # if not self.client:
        #     self.skipTest('Web browser not available')
        pass
    
    def tearDown(self):
        pass

    def test_title(self):
        self.assertIn("DocuMatcher", self.driver.title)
    def test_upload_files_success(self):
        # Wait for the file input element to be available
        file_input = WebDriverWait(self.driver, 5).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='file']"))
        )

        # Set files to use in the upload operation
        files = [
            os.path.join(current_dir, 'doc1Student.docx'),
            os.path.join(current_dir, 'doc2Student.docx')
        ]
        # Upload files
        file_input.send_keys('\n'.join(files))
        # click match button
        submit_button = WebDriverWait(self.driver, 5).until(
            EC.element_to_be_clickable((By.ID, "submit")),
        )
        submit_button.click()
        # # check progress bar 100%, if is then ok
        progress_bar = self.driver.find_element(By.ID, "upload-progress")
        progress_width = progress_bar.get_attribute("style").split(":")[1].strip().replace(";", "").replace("%", "")
        assert progress_width == "100", f"Expected progress bar width to be 100%, but got {progress_width}%"




    def test_upload_files_failed(self):
        # try file with image inside
        file_input = WebDriverWait(self.driver, 5).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='file']"))
        )

        files = [
            os.path.join(current_dir, "doc1Student.docx"),
            os.path.join(current_dir, "invalid_file.docx")
        ]
        for file in files:
            print(f"File path2: {file}")
        file_input.send_keys('\n'.join(files))

        submit_button = WebDriverWait(self.driver, 5).until(
            EC.element_to_be_clickable((By.ID, "submit")),
        )
        submit_button.click()
            # Wait for the alert message to be visible
        alert_element = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "alert-danger"))
        )

        # Capture the alert message
        alert_message = alert_element.text

        # Assert that either validation error or 500 error is present
        assert ("ErrorCode: 500" in alert_message), f"Unexpected alert message: {alert_message}"


    # try more than max file limit
    def test_upload_max_limit(self):
        # Locate the file input element
        file_input = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='file']"))
        )

        # Create a list of files to upload (exceeding the max limit of 20)
        files = [os.path.join(current_dir, f"doc{i}Student.docx") for i in range(1, 22)]

        # Upload the files
        file_input.send_keys('\n'.join(files))

        # Wait for the alert to be present
        alert = WebDriverWait(self.driver, 10).until(EC.alert_is_present())

        # Get the alert message
        alert_message = alert.text

        # Assert that the alert message is correct
        self.assertIn("Maximum of 20 files reached.", alert_message)

        # Accept (dismiss) the alert to allow the browser to continue
        alert.accept()

    # test size limit
    def test_upload_large_file(self):

        pass
    # # test not .docx
    def test_upload_invalid_file_extension(self):

        # Locate the file input element
        file_input = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='file']"))
        )

        # Create a list of files with invalid extensions (e.g., .pdf, .txt)
        invalid_files = [
            os.path.join(current_dir, "invalid_file.pdf"),
            os.path.join(current_dir, "invalid_file.txt"),
        ]

        # Upload the files with invalid extensions
        file_input.send_keys('\n'.join(invalid_files))

        # Wait for the error message to be generated in the DOM
        alert_element = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "alert-danger"))  # Assuming this is the class of the alert div
        )

        # Get the text of the alert element
        alert_message = alert_element.text

        # Assert that the alert message contains the expected text
        self.assertIn("Only .docx files are allowed.", alert_message)


if __name__ == "__main__":
    unittest.main() 