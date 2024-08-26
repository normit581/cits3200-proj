import zipfile
import xml.etree.ElementTree as ET
import re

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
                    rsid = elem.attrib[attrib]
                    
                    if rsid in rsid_dict : 
                        rsid_dict[rsid]['count'] += 1
                        rsid_dict[rsid]['location'].append(elem)
                    else :
                        rsid_dict[rsid] = {'count': 1, 'location': [elem]}
                    rsid_count += 1
        # print(rsid_dict[rsid]['location'])
    return rsid_dict, rsid_count

def rsid_match2(rsid1, rsid2) :
    dict1, total1 = rsid1
    dict2, total2 = rsid2
    common_rsid_count = 0
    matching_rsid = {}
   
    for rsid in dict1 :
        print('a')
        if rsid in dict2 :
            
            common_rsid_count += min(dict1[rsid]['count'], dict2[rsid]['count'])
            
            matching_rsid = {
                'count': min(dict1[rsid]['count'], dict2[rsid]['count']),
                'location1': dict1[rsid]['location'],
                'location2': dict2[rsid]['location']
            
            }
    print(matching_rsid['location1'][:50])
    print("|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||")
    print(matching_rsid['location2'][:50])
    rsid_match = 100 * common_rsid_count / total1
    
    return rsid_match, matching_rsid

