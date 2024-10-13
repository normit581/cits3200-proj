import os
import random
import io
from bs4 import BeautifulSoup
from locust import HttpUser, task, between

# Define the directory for test documents
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
testdocx_dir = os.path.join(parent_dir, 'testdocs')
os.makedirs(testdocx_dir, exist_ok=True)

class FileUploadUser(HttpUser):
    wait_time = between(1, 5)
    number_of_request = 2  # Start with 2 files

    @task
    def upload_files(self):
        # Step 1: Fetch the CSRF token from the home page
        home_response = self.client.get('/home')
        if home_response.status_code != 200:
            print(f"Failed to load home page, status code: {home_response.status_code}")
            return

        soup = BeautifulSoup(home_response.content, 'html.parser')
        csrf_token_input = soup.find('input', {'name': 'csrf_token'})
        if csrf_token_input is None:
            print("Failed to find CSRF token on the home page.")
            return

        csrf_token = csrf_token_input['value']
        # print(f"CSRF Token extracted: {csrf_token}")

        # Step 2: Select files from the testdocs directory
        directory = testdocx_dir
        files = [f for f in os.listdir(directory) if f.endswith('.docx')]
        
        # Check if all files have been uploaded
        if self.number_of_request > len(files):
            print("All files have already been uploaded.")
            return

        # Adjust the sample size based on the available files
        sample_size = random.randint(50, 100)  # Take the lesser of 50 or the available files
        selected_files = random.sample(files, sample_size)  # Select a random sample of files

        # Create file-like objects for upload (in-memory)
        file_uploads = []
        for selected_file in selected_files:
            file_path = os.path.join(directory, selected_file)
            file_uploads.append(
                ('files', (selected_file, io.BytesIO(open(file_path, 'rb').read()), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'))
            )

        # Step 3: Upload the files with the CSRF token
        response = self.client.post(
            '/home',
            data={
                'csrf_token': csrf_token,
                'submit': True
            },
            files=file_uploads,  # Use the selected files
        )

        # Step 4: Check response and log the result
        if response.status_code == 200:
            # print(f"Uploaded files successfully: {self.uploaded_files_count}, Response: {response.json()}")
            print(f"Uploaded files successfully: {len(selected_files)}")
            self.number_of_request += 1  # Increment the number of files to upload for the next request
        else:
            print(f"Failed to upload files, status code: {response.status_code}, Response: {response.text}")
