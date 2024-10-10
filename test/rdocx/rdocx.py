import os
import sys
from utilities.rsid import *
from utilities.gen import *

def usage() :
    print("\nusage: $ python rdocx.py <option>\n")
    print("options: ")
    print("\tg <number of .docx> <depth of complexity>\t\t-----\tgenerate <number of .docx> new .docx file in /testdocs")
    print("\te <input .docx> <number of copy>\t-----\trandomly edit <input .docx> and save the result to newly created <output .docx> in /testdocs")
    print("\trsid <document.docx>\t-----\textract and print rsid of <document.docx> in /testdocs")
    print("\trsid_all <number of .docx>\t-----\textract and print rsid details of <number of .docx> .docx in /testdocs, only works went filename is document_n.docx")
    print("\trsid_sim <document1.docx> <document2.docx>\t-----\tcalculate rsid matching between <document1.docx> and <document2.docx> in /testdocs")
    print("\tclean\t\t\t\t-----\tdelete all contents in /testdocs")
    exit()

if __name__ == "__main__" :
    if len(sys.argv) == 1 :
        usage()
  
    option = sys.argv[1]

    if option == 'g' :
        if len(sys.argv) < 3 or sys.argv[2].isdigit() == False:
            usage()
        
        num_file = int(sys.argv[2])
        num_para = int(sys.argv[3])
        generate_docx(num_file, num_para)
        exit()
        
    if option == 'e' :
        if len(sys.argv) < 4 :
            usage()
            
        input_file = sys.argv[2]
        # output_file = sys.argv[3]
        num_copy = sys.argv[3]
        edit_docx(input_file, num_copy)
        exit()
        
    if option == 'rsid' :
        if len(sys.argv) < 3 :
            usage()
            
        docx_name = sys.argv[2]
        docx_path = os.path.join(testdocx_dir, docx_name)
        rsid_numbers, rsid_count = rsid_extract(docx_path)
        print(docx_name, "\trsid count: ", rsid_count, " ", rsid_numbers)
        exit()
        
    if option == 'rsid_all' :
        files = os.listdir(testdocx_dir)
        docx_files = [file for file in files if file.endswith('.docx')]
        
        for file in docx_files :
            docx_name = file
            docx_path = os.path.join(testdocx_dir, file)
            rsid_numbers, rsid_count = rsid_extract(docx_path)
            print(docx_name, "\trsid count: ", rsid_count , " ", rsid_numbers)
            
    if option == "rsid_sim":
        if len(sys.argv) < 4 :
            usage()
            
        docx1 = sys.argv[2]
        docx2 = sys.argv[3]
        docx1_path = os.path.join(testdocx_dir, docx1)
        docx2_path = os.path.join(testdocx_dir, docx2)
        similarity = rsid_match2(docx1_path, docx2_path)
        print(f"{docx1} ~ {docx2}\t-----\t{similarity:.03f}%")
        exit()
        
    if option == 'clean' :
        clean()
        exit()

    

