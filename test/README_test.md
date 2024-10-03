# Unittest
## test_rsid(pytest).py only works on Windows cmd
## test_rsid(pytest).py relies on gen.py to generate edited version of .docx files
## gen.py use pywin32 python module to manipulate .docx file
## pywin32 module calls MS word to perform operations (eg: edit, create) on a .docx file
## process is slow because it is calling MS word
## recommanded to run test in python virtual environment, preventing python module mess up

## setup python virtual environment
    python -m venv <venv dir name>

## activate python virtual environment
    .\<venv dir name>\Scripts\activate

## install python package
    pip install -r test_requirements.txt

## run test
    pytest

## usage
test logs path: /test/test_logs
sample or randomly generated .docx path: /test/testdocs

put <sample.docx> into /test/testdocs, then edit /test/test_rsid(pytest).py line 26: 
    current = "<sample.docx>"

if not using <sample.docx>, test will generate 2 random .docx for testing

edit /test/test_rsid(pytest).py line 34:
    test_depth = <depth>  # Edit to increase or decrease depth
    to simulate how many time <sample.docx> will be edited.
    
for each depth, an "edited<depth>_<sample.docx>" will be created
After that, the test will call rsid_extract() and rsid_match2()

edit /test/test_rsid(pytest).py line 75:
        if file.startswith('edited'):
            assert output >= 10         # change the number
        else:
            assert output <= 60

"edited<depth>_<sample.docx>" should has hiher matching result, 10% usually fail at depth ~ 10

# gen.py
gen.py only works on windows cmd
The way the program works is it open MS word, generate random content and save it as .docx
It will then revise the .docx for random(1 -3) times to let MS word generate more rsid
Can use 'e' option to generate a new .docx form original .docx to obervse the change of rsid after a few edits of a .docx

usage: $ python gen.py <option>

options:
    g <number of .docx>                     -----   generate <number of .docx> new .docx file in /testdocs
    e <input .docx> <output .docx>          -----   randomly edit <input .docx> and save the result to newly created <output .docx> in /testdocs
    rsid <document.docx>                    -----   extract and print rsid of <document.docx> in /testdocs
    rsid_all                                -----   extract and print rsid details of  .docx in /testdocs, only works went filename is document_<int>.docx
    rsid_sim <1.docx> <2.docx>              -----   calculate similarities between <1.docx> and <2.docx>
    clean                                   -----   delete all contents in /testdocs

log.py create logger object

code example :
# logs will write to <logs_directory>/<logs_file>
    logger = Log(<logs_directory>, <logs_file>)

# logging
# format
# 2024-08-05 21:46:48 - INFO - <message>
    message = "message"
    logger.log(message, 'info')
    logger.log(message, 'debug')
    logger.log(message, 'warning')
    logger.log(message, 'error')
    logger.log(message, 'critical')

# clean all logs in a log file
    logger.clean(<logs_file>)

# performmance test
    locust -f performancetest_remote.py --host=http://elijahmullens.com
