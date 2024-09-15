"""
form:
<app.forms.MatchDocumentForm object at 0x7fe05473db70>

form.files:
<input id="files" multiple name="files" type="file">

form.files.data
[<FileStorage: 'document_0.docx' ('application/vnd.openxmlformats-officedocument.wordprocessingml.document')>, <FileStorage: 'document_1.docx' 

"""

import io
import os
from bs4 import BeautifulSoup

from test_config import *

# Test the home page route
def test_home_get(client):
    response = client.get('/')
    assert response.status_code == 200
    assert b"DocuMatcher" in response.data  # Checking if the page title or context is rendered

# Test file upload with a POST request without actual files
def test_home_post_without_files(client):
    response = client.post('/', data={})
    assert response.status_code == 405 

# Test file upload with actual files
def test_home_post_with_files(client, setup_files):
    test_directory, current, current_file = setup_files

    # Fetch the CSRF token
    response = client.get('/home')
    soup = BeautifulSoup(response.data, 'html.parser')

    # Extract CSRF token from the form
    csrf_token = soup.find('input', {'name': 'csrf_token'})['value']

    # Create file-like objects for the test files
    file1 = (io.BytesIO(open(current_file, 'rb').read()), current)
    file2 = (io.BytesIO(open(os.path.join(test_directory, f"edited1_{current}"), 'rb').read()), f"edited1_{current}")

    # Send the files via a POST request with the CSRF token
    response = client.post(
        '/home',
        data={
            'csrf_token': csrf_token,
            'files': [file1, file2],
            'submit': True
        },
        content_type='multipart/form-data'
    )

    assert response.status_code == 200

def test_file_too_large(client, setup_files):
    # Unpack the setup_files fixture
    _, _, _ = setup_files  # Not using these values in this test

    # Fetch the CSRF token
    response = client.get('/home')
    soup = BeautifulSoup(response.data, 'html.parser')

    # Extract CSRF token from the form
    csrf_token = soup.find('input', {'name': 'csrf_token'})['value']

    large_file_content = b"x" * (app.config['MAX_CONTENT_LENGTH'] + 1)  # 1 byte more than the limit
    large_file = (io.BytesIO(large_file_content), 'large_file.docx')

    # Send the large file via a POST request with the CSRF token
    response = client.post(
        '/home',
        data={
            'csrf_token': csrf_token,
            'files': [large_file],  # Single large file
            'submit': True
        },
        content_type='multipart/form-data'
    )

    assert response.status_code == 413

# Test the visualise route with valid files
def test_visualise_post(client):
    # Create a dummy form data to send
    data = {
        'base_file': (b'File content', 'base.docx'),
        'compare_file': (b'File content', 'compare.docx')
    }
    response = client.post('/visualise', data=data, content_type='multipart/form-data')
    assert response.status_code == 200

# Test the team page
def test_team_page(client):
    response = client.get('/team')
    assert response.status_code == 200
    assert b"team" in response.data  # Check for the team content

# Test 404 error handling
def test_404_error(client):
    response = client.get('/nonexistent_page')
    assert response.status_code == 404
