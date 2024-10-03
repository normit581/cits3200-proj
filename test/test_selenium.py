import threading, unittest, sys, os, time
import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app import create_app
from app.config import TestingConfig
# from docx import Document
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

    def create_test_files(self, count, size_in_mb, prefix="test_file"):
        test_files = []
        for i in range(count):
            sanitized_prefix = "".join([c if c.isalnum() or c in "._-+!@#$%^&()" else "_" for c in prefix])
            file_path = os.path.join(current_dir, f"{sanitized_prefix}_{i + 1}.docx")

            # Create a file of the desired size in MB using null bytes
            with open(file_path, "wb") as f:
                f.write(b"\0" * size_in_mb * 1024 * 1024)

            test_files.append(file_path)
            # print(f"Created binary file {file_path} with size: {os.path.getsize(file_path) / (1024 * 1024):.2f} MB")

        return test_files

    def test_upload_files_success(self):
        # wait for the file input element to be available
        file_input = WebDriverWait(self.driver, 5).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='file']"))
        )

        # set files to use in the upload operation
        files = [
            os.path.join(current_dir, 'doc1Student.docx'),
            os.path.join(current_dir, 'doc2Student.docx')
        ]
        # upload files
        file_input.send_keys('\n'.join(files))
        # click match button
        submit_button = WebDriverWait(self.driver, 5).until(
            EC.element_to_be_clickable((By.ID, "submit")),
        )
        submit_button.click()
        time.sleep(2)
        # check progress bar 100%, if is then ok
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
        file_input.send_keys('\n'.join(files))

        submit_button = WebDriverWait(self.driver, 5).until(
            EC.element_to_be_clickable((By.ID, "submit")),
        )
        submit_button.click()

        alert = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "alert-danger"))
        )

        alert_message = alert.text

        assert ("ErrorCode: 500" in alert_message), f"Unexpected alert message: {alert_message}"


    # try more than max file limit
    def test_upload_max_limit(self):
        # create files 22
        files = self.create_test_files(count=22, size_in_mb=1, prefix="max_limit_test")

        file_input = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='file']"))
        )

        file_input.send_keys('\n'.join(files))

        alert = WebDriverWait(self.driver, 10).until(EC.alert_is_present())

        alert_message = alert.text

        self.assertIn("Maximum of 20 files reached.", alert_message)

        alert.accept()

        for file_path in files:
            if os.path.exists(file_path):
                os.remove(file_path)
    # teist size limt
    def test_upload_large_file(self):
        # get file input
        file_input = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='file']"))
        )
        file = self.create_test_files(count=1, size_in_mb=150, prefix="large_file")
        # large_file = os.path.join(current_dir, "large_file.docx")
        file_input.send_keys(file)

        alert = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "alert-danger"))
        )
        alert_message = alert.text

        self.assertIn(f"×\nFailed!\nFile large_file_1.docx exceeds the maximum size of 100MB", alert_message)

        for file_path in file:
            if os.path.exists(file_path):
                os.remove(file_path)

    # Test not .docx
    def test_upload_invalid_file_extension(self):

        file_input = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='file']"))
        )

        invalid_files = [
            os.path.join(current_dir, "invalid_file.pdf"),
            os.path.join(current_dir, "invalid_file.txt"),
        ]

        file_input.send_keys('\n'.join(invalid_files))

        alert = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "alert-danger"))
        )

        alert_message = alert.text

        self.assertIn("Only .docx files are allowed.", alert_message)

    def test_submit_without_files(self):
        submit_button = WebDriverWait(self.driver, 5).until(
            EC.element_to_be_clickable((By.ID, "submit")),
        )
        submit_button.click()
        alert = WebDriverWait(self.driver, 5).until(
            EC.presence_of_element_located((By.CLASS_NAME, "alert-danger"))
        )
        alert_message = alert.text
        self.assertIn("Please add at least one file.", alert_message)

    # max file limit and max fize
    # So test for file size 1.1mb

    # error need to fix
    # def test_max_file_size_limit(self):
    #     # Create 20 files each size of 2mb as limit is 20
    #     file_input = WebDriverWait(self.driver, 2).until(
    #         EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='file']"))
    #     )

    #     files = self.create_test_files(count=19, size_in_mb=2, prefix="max_file_size_limit_test")

    #     file_input.send_keys('\n'.join(files))
    #     print(files)

    #     submit_button = WebDriverWait(self.driver, 5).until(
    #         EC.element_to_be_clickable((By.ID, "submit")),
    #     )
    #     submit_button.click()
    #     # alert = WebDriverWait(self.driver, 10).until(EC.alert_is_present())
    #     alert = WebDriverWait(self.driver, 10).until(
    #         EC.presence_of_element_located((By.CLASS_NAME, "alert-danger"))
    #     )

    #     alert_message = alert.text
    #     print("alert:" , alert_message)
    #     for i in range(1, 20):
    #         file_name = f"exceed_multi_file_size_limit_test_{i}.docx"
    #         self.assertIn(f"File {file_name} exceeds the maximum size of 100MB.", alert_message)

    #     for file_path in files:
    #         if os.path.exists(file_path):
    #             os.remove(file_path)
    def test_special_characters(self):

        file_input = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='file']"))
        )
        special_prefix = "!@#$%^&*()_+-=[]|;':,.<>?"
        file = self.create_test_files(count=1, size_in_mb=1, prefix=special_prefix)
        file_input.send_keys('\n'.join(file))
        submit_button = WebDriverWait(self.driver, 5).until(
            EC.element_to_be_clickable((By.ID, "submit")),
        )
        submit_button.click()


    def test_empty_file(self):
        file_input = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='file']"))
        )
        file = self.create_test_files(count=1, size_in_mb=0, prefix="empty")

        file_input.send_keys('\n'.join(file))

        submit_button = WebDriverWait(self.driver, 5).until(
            EC.element_to_be_clickable((By.ID, "submit")),
        )
        submit_button.click()

    # interrupted downloads pdf download
    # tools to tell us what happened
    # speed tests for the time allowed 
    # corrupted files
    # documentation testing that have been used by other people
if __name__ == "__main__":
    unittest.main() 