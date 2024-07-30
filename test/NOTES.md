gen.py only works on windows cmd

python package needed
    pywin32

setup python virtual environment
    python -m venv env

activate python virtual environment
    .\env\Scripts\activate

install python package
    pip install pywin32

generate random .docx > /testdocxs
    python gen.py <number of .docx>

read rsid on generated .docx in /testdocxs
    python rsid_extract.py <number of .docx>