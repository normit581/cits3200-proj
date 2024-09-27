import zipfile
import xml.etree.ElementTree as ET
from app.utilities.metadata import RSID

def clean_text(elem):

    # Clean the text from XML
    ns = {'ns0': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    texts = []

    # find all with ns0 tag
    for t in elem.findall('.//ns0:t', ns):
        # if content not empty then append to list, make sure to clean text, strip
        if t.text:
            texts.append(t.text.strip())
    # return all text in single string
    return ' '.join(texts)

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
                    # clean text and add to location
                    cleaned_text = clean_text(elem)
                    if rsid in rsid_dict :
                        # add count and add cleaned text to location of dict
                        rsid_dict[rsid]['count'] += 1
                        rsid_dict[rsid]['location'].append(cleaned_text)
                    else :
                        rsid_dict[rsid] = {'count': 1, 'location': [cleaned_text]}
                    rsid_count += 1
        # print(rsid_dict[rsid]['location'])
    return rsid_dict, rsid_count

def rsid_match2(rsid1, rsid2) :
    dict1, total1 = rsid1
    dict2, total2 = rsid2
    common_rsid_count = 0
    matching_rsid = {}

    for rsid in dict1:
        if rsid in dict2:
            common_rsid_count += min(dict1[rsid]['count'], dict2[rsid]['count'])
            # for each rsid, add count, and location of both doc rsid to dict
            matching_rsid[rsid] = {
                'count': min(dict1[rsid]['count'], dict2[rsid]['count']),
                'text1': dict1[rsid]['location'],
                'text2': dict2[rsid]['location']
            
            }

    rsid_match = RSID.calculate_similarity(common_rsid_count, total1)
    # print("common rsid:", common_rsid_count)
    return rsid_match, matching_rsid, common_rsid_count

