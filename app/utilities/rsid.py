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

# calculate similarity from python dict of rsid
def rsid_simof2(rsid1, rsid2) :
    common_rsid_count = 0
    
    for rsid in rsid1 :
        if rsid in rsid2 :
            common_rsid_count += min(rsid1[rsid], rsid2[rsid])

    # number of total rsid
    total_rsid = sum(rsid1.values()) + sum(rsid2.values()) - common_rsid_count
    
    # calculate similarity
    similarity = 100 * common_rsid_count / total_rsid
    
    return similarity

from app.utilities.temp import TEMP

def rsid_sim(files) :
    file_rsid_dict = {}
    file_count = 0
    similarity_result = {}
    
    temp = TEMP()
    temp.set_log_path('app/temp', 'similarity_result.log')
    
    for file in files.data :
        rsid_numbers, rsid_count = rsid_extract(file)
        file_rsid_dict[file.filename] = (rsid_count, rsid_numbers)
        file_count += 1
        
    for file_1 in file_rsid_dict :
        for file_2 in file_rsid_dict :
            if file_1 == file_2 :
                continue
            
            if (file_1, file_2) not in similarity_result and (file_2, file_1) not in similarity_result :
                similarity = rsid_simof2(file_rsid_dict[file_1][1], file_rsid_dict[file_2][1])
                similarity_result[(file_1, file_2)] = similarity
                msg = f"{file_1} ~ {file_2}: {similarity:.3f}%"

                temp.log(msg, 'info')   # need to move outside the loop, sort ->

    return similarity_result
                