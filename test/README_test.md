# Unittest
see /randomdox_generatot/README.md if need to generate test .docx files

### recommanded to run test in python virtual environment, 
### setup python virtual environment
```
    python -m venv <venv dir name>
```
## activate python virtual environment
```
    .\<venv dir name>\Scripts\activate
```
## install python package
```
    pip install -r test_requirements.txt
```
## run pytest
```
    cd test/unittest
    pytest
```
## run selenium test
```
    cd test
    python3 test_selenium.py
        or 
    python test_selenium.py
```
    
test logs path: /test/test_logs
sample or randomly generated .docx path: /test/testdocs

put <sample.docx> into /test/testdocs, then edit /test/test_rsid(pytest).py line 26: 
    current = "<sample.docx>"


code example :
### logs will write to <logs_directory>/<logs_file>
    logger = Log(<logs_directory>, <logs_file>)

### log format
### 2024-08-05 21:46:48 - INFO - <message>
    message = "message"
    logger.log(message, 'info')
    logger.log(message, 'debug')
    logger.log(message, 'warning')
    logger.log(message, 'error')
    logger.log(message, 'critical')

#### clean all logs in a log file
    logger.clean(<logs_file>)

# performmance test
run locust on localhost
    cd test
    locust -f performancetest/pt_increment_upload.py --host=http://127.0.0.1:5000
    locust -f performancetest/pt_multi_users.py --host=http://127.0.0.1:5000
    
Then access locust control page in browser
    localhost:8089
