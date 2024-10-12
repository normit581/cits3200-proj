import os
import random
from locust import HttpUser, task, between

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
test_dir = os.path.dirname(parent_dir)
testdocx_dir = os.path.join(parent_dir, 'testdocs')
os.makedirs(testdocx_dir, exist_ok=True)

class WebAppUser(HttpUser):
    wait_time = between(1, 5)

    @task
    def home_page(self):
        self.client.get("/")

class FileUploadUser(HttpUser):
    wait_time = between(1, 5)
    files_to_upload_count = 2

    @task
    def upload_files(self):
        # Define the directory containing the files you want to upload
        directory = testdocx_dir
        print(testdocx_dir)
        # List all files in the directory
        files = [f for f in os.listdir(directory) if f.endswith('.docx')]

        # Ensure we do not try to upload more files than are available
        num_files_to_upload = min(self.files_to_upload_count, len(files))

        # Select random files to upload
        selected_files = random.sample(files, num_files_to_upload)

        # Prepare files for upload
        files_to_upload = {}
        for file_name in selected_files:
            file_path = os.path.join(directory, file_name)
            files_to_upload[file_name] = (file_name, open(file_path, 'rb'), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')

        # Perform POST request with the files as part of the data
        response = self.client.post("/visualise", files=files_to_upload)

        # Optional: Add assertions or checks on the response
        if response.status_code == 200:
            print(f"Uploaded {num_files_to_upload} files successfully: {', '.join(selected_files)}")
        else:
            print(f"Failed to upload files, status code: {response.status_code}")

        # Close the files after the request
        for file_tuple in files_to_upload.values():
            file_tuple[1].close()  # Close the file object

        # Increment the number of files to upload for the next request
        self.files_to_upload_count += 1
