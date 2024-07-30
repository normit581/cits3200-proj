import zipfile
import xml.etree.ElementTree as ET
import sys

# Function to extract RSID from a .docx file
def extract_rsid(docx_path):
    rsid_numbers = {}
    rsid_count = 0
    
    # Open .docx file as a zip archive
    with zipfile.ZipFile(docx_path, 'r') as docx:
        # Read the document.xml file
        document_xml = docx.read('word/document.xml')
        
        # Parse the XML content
        root = ET.fromstring(document_xml)
    
        # Find all elements with RSID attributes
        for elem in root.iter():
            for attrib in elem.attrib:
                if attrib.startswith('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}rsid'):
                    if (elem.attrib[attrib]) in rsid_numbers : 
                        rsid_numbers[elem.attrib[attrib]] += 1
                    else :
                        rsid_numbers[elem.attrib[attrib]] = 1
                    rsid_count += 1
    
    return rsid_numbers, rsid_count

if __name__ == "__main__" : 
    if len(sys.argv) < 2 :
        print("usage: python3 rsid_extract.py <number of docx>")
        exit()

    number_of_docs = int(sys.argv[1])

    for i in range(number_of_docs) :
        docx_directory = f"testdocs/"
        docx_name = f"document_{i}.docx"
        docx_path = docx_directory + docx_name
        rsid_numbers, rsid_count = extract_rsid(docx_path)
        print(docx_name, "\trsid count: ", rsid_count, " ", rsid_numbers)
