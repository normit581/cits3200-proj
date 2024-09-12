import os
from test_config import *

import json

# Test the home page route
def test_home_get(client):
    response = client.get('/')
    assert response.status_code == 200
    assert b"DocuMatcher" in response.data  # Checking if the page title or context is rendered

# Test file upload with a POST request (without actual files)
def test_home_post_without_files(client):
    response = client.post('/', data={})
    assert response.status_code == 405 

def test_home_post_with_files(client):
    # Creating a dummy file to upload
    pass

# Test large file upload (greater than max limit)
def test_file_too_large(client):
    pass

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
