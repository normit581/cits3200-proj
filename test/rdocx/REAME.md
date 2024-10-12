# Random .docx generator (rdocx)
## rdocx is a random .docx files generateor only for DocMatch testing purpose
## rdocx.py use pywin32 python module to manipulate .docx file
## pywin32 is required to generate .docx files with rsid
## pywin32 module calls MS word to perform operations (eg: edit, create) on a .docx file
## ms word installed locally is required to run pywin32
## process is slow because it is calling MS word

## rdocx use seperate virtual envrionment than test environment to avoid dependencies since pywin32 module only available on Windows CMD
### set up python virtual environment for randomdocx :
        open /randomdocx in cmd (not power shell):
        ```
        python -m venv genenv
        ```

### run virtual environment and install required modules
    ```
    .\genenv\Scripts\activate
    pip install -r rdocx_requirements.txt
    ```

## usage: $ python rdocx.py <option>

        options:
        g <number of .docx> <number of edit>                     -----   generate <number of .docx> new .docx file in /testdocs the new .docx file will be edited <number of edit> times
        e <input .docx> <number of copy>          -----   randomly edit <input .docx> and save the result to newly created <output .docx> in /testdocs
        rsid <document.docx>                    -----   extract and print rsid of <document.docx> in /testdocs
        rsid_all                                -----   extract and print rsid details of  .docx in /testdocs, only works went filename is document_<int>.docx
        rsid_sim <1.docx> <2.docx>              -----   calculate similarities between <1.docx> and <2.docx>
        clean                                   -----   delete all contents in /testdocs