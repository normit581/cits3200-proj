import zipfile
import xml.etree.ElementTree as ET
import sys
import os

# Function to extract RSID from a .docx file
def rsid_extract(docx_path) :
    rsid_dict = {}
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
                    if (elem.attrib[attrib]) in rsid_dict : 
                        rsid_dict[elem.attrib[attrib]] += 1
                    else :
                        rsid_dict[elem.attrib[attrib]] = 1
                    rsid_count += 1
    
    return rsid_dict, rsid_count

def rsid_match2(rsid1, rsid2) :
    common_rsid_count = 0
    
    for rsid in rsid1 :
        if rsid in rsid2 :
            common_rsid_count += min(rsid1[rsid], rsid2[rsid])

    rsid_match = 100 * common_rsid_count / sum(rsid1.values())
    
    return rsid_match

