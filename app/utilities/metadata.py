from docx import Document
import random
def extract_metadata(docx):
    doc = Document(docx)
    # metadata for display
    metadata = {
        'title': doc.core_properties.title,
        'created': doc.core_properties.created,
        'paragraphs': [para.text for para in doc.paragraphs if para.text.strip()]
    }

    metadata["colours"] = [['red', 'blue', 'green', 'yellow', 'cyan', 'grey'][random.randint(0,5)] for i in range(-1, len(metadata["paragraphs"]))]
    return metadata


def rsid_with_metadata(metadata, matching_rsid):
    # comparison dict with title and paragraphs[{rsid:, text:}]
    comparison_meta = {
        'title': metadata.get('title'),
        'paragraphs': []
    }
    # for each rsid, and dict of matching rsid
    for rsid, info in matching_rsid.items():
        # for each text in the matching rsid append to paragraphs with rsid and text
        for text in info['text1']:
            comparison_meta['paragraphs'].append({
                'rsid': rsid,
                'text': text
            })

    return comparison_meta

