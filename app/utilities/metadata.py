from docx import Document
import random

def extract_metadata(docx, rsid1, rsid2, matching_rsid):
    doc = Document(docx)
    
    # metadata for display
    metadata1 = {
        'title': doc.core_properties.title,
        'created': doc.core_properties.created,
        'paragraphs': []
    }
    metadata2 = {
        'title': doc.core_properties.title,
        'created': doc.core_properties.created,
        'paragraphs': []
    }
    
    dict1, _ = rsid1  # Get only the dictionary part
    dict2, _ = rsid2

    # To track added text for avoiding duplicates
    added_text1 = set()

    # Process dict1 for metadata1
    for rsid, info in dict1.items():
        for text in info['location']:
            if text.strip() and (rsid, text) not in added_text1:
                colour = 'red' if rsid in matching_rsid else random.choice(['blue', 'green', 'yellow', 'cyan', 'grey', 'magenta'])
                metadata1['paragraphs'].append({
                    'rsid': rsid,
                    'colour': colour,
                    'text': text
                })
                added_text1.add((rsid, text))
    
    added_text2 = set()
    # Process dict2 for metadata2
    for rsid, info in dict2.items():
        for text in info['location']:
            if text.strip() and (rsid, text) not in added_text2:
                colour = 'red' if rsid in matching_rsid else random.choice(['blue', 'green', 'yellow', 'cyan', 'grey', 'magenta'])
                metadata2['paragraphs'].append({
                    'rsid': rsid,
                    'colour': colour,
                    'text': text
                })
                added_text2.add((rsid, text))

    return metadata1, metadata2
