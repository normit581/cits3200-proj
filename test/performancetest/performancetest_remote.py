import os
import random
from locust import HttpUser, task, between

class WebAppUser(HttpUser):
    wait_time = between(1, 5)

    @task
    def home_page(self):
        self.client.get("/")

class FileUploadUser(HttpUser):
    wait_time = between(1, 5)

    @task
    def upload_multiple_files(self):
        # Define the directory containing the files you want to upload
        directory = '/mnt/c/Users/cklai/OneDrive/Desktop/cits3200/cits3200-proj/test/testdocs/'  # Update this to your actual directory
        # List all files in the directory
        files = [f for f in os.listdir(directory) if f.endswith('.docx')]

        # Choose a random number of files to upload (1 to n)
        num_files_to_upload = random.randint(2, len(files))

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
