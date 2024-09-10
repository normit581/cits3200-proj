# Document Matcher Tool

Project Title: Document Matcher for Cheating Detection  
Client: A/Prof Guy Curtis  
Start Date: 29th Jul 2024  
End Date: 14th Oct 2024 5:00 PM  
Methodology: Scrum  
Sprints: 3  

Team Members:  
- 23335907 (Elijah Mullens)
- 23326698 (Jack Blackwood)
- [student no] [name]  
- [student no] [name]  
- [student no] [name]  
- [student no] [name]  


# Project Overview

Objective: 

Develop a Document Matcher tool that automates the process of comparing rsid
codes in Microsoft Word documents to identify potential instances of cheating or
collusion in an academic setting.

Scope:
1. Develop a backend for extracting and comparing rsid codes from Word documents.
2. Develop a frontend interface for users to upload and view document comparisons.
3. Ensure data privacy and security compliance.
4. Provide thorough documentation and user manuals.

Deliverables:
1. Functional prototype by the end of the first sprint.
2. Fully operational tool by the end of the third sprint.
3. User manuals and technical documentation.
4. Regular progress reports.


# Deployment

DocuMatcher uses environment variables to configure many of its settings. These
environment variables must be set prior to deploying and cannot be performed by
the deployment script.

## Environment Configuration

The config file that is parsed during deployment is `app.env`, so it has to
contain all the following variables.

| Variable Name | Required | Description                                                                                                 |
|:-------------:|:--------:|:------------------------------------------------------------------------------------------------------------|
| `FLASK_DEBUG` | Optional | should only be set to `True` during development                                                             |
| `SECRET_KEY`  | Required | A key that can be used to protect the website. Follow [these steps](#Generating-A-Key) to configure a key   |

## Generating A Key

### Linux (using Bash)

run the following command and copy it's output into `app.env`

```Bash
python -c 'import secrets; print(secrets.token_hex())'
```

### Windows (TODO)

## Example Config

`app.env` when properly configured for deployment should look something like
this (the SECRET_KEY used is just an example)

```env
FLASK_DEBUG=False
SECRET_KEY=06ca425d9bc0b3375983f595c849d4ff755d9dd727a4f98bd40d3c6fb6957a87
```
