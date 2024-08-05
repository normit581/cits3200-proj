gen.py only works on windows cmd
The way the program works is it open MS word, generate random content and save it as .docx
It will then revise the .docx for random(1 -3) times to let MS word generate more rsid
Can use 'e' option to generate a new .docx form original .docx to obervse the change of rsid after a few edits of a .docx

python package needed
    pywin32

setup python virtual environment
    python -m venv env

activate python virtual environment
    .\env\Scripts\activate

install python package
    pip install pywin32

usage: $ python gen.py <option>

options:
    g <number of .docx>                     -----   generate <number of .docx> new .docx file in /testdocs
    e <input .docx> <output .docx>          -----   randomly edit <input .docx> and save the result to newly created <output .docx> in /testdocs
    rsid <document.docx>                    -----   extract and print rsid of <document.docx> in /testdocs
    rsid_all                                -----   extract and print rsid details of  .docx in /testdocs, only works went filename is document_<int>.docx
    rsid_sim <1.docx> <2.docx>              -----   calculate similarities between <1.docx> and <2.docx>
    clean                                   -----   delete all contents in /testdocs
