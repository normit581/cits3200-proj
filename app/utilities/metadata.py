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


def rsid_with_metadata(metadata, rsid1, rsid2, matching_rsid):
    # comparison dict with title and paragraphs[{rsid:, text:}]
    comparison_meta = {
        'title': metadata.get('title'),
        'paragraphs': []
    }
    # all rsid is combine 1 and 2
    dict1, _ = rsid1
    dict2, _ = rsid2

    all_rsid = {**dict1, **dict2}
    # print(all_rsid)
    # colour for each rsid
    rsid_colors = {rsid: 'red' if rsid in matching_rsid else 
                   ['blue', 'green', 'yellow', 'cyan', 'grey'][random.randint(0, 4)] 
                   for rsid in all_rsid}
    
    # tracking texts to avoid duplication
    added_text = set()

    # iterate through rsids
    for rsid, info in all_rsid.items():
        # get colour of current rsid
        color = rsid_colors[rsid]
        # for each rsid append text with corresponding color
        for text in info['location']:
            # skip empty or duplicates
            if text.strip() and (rsid,text) not in added_text:
                comparison_meta['paragraphs'].append({
                    'rsid': rsid,
                    'color': color,
                    'text': text
                })
                # add to set
                added_text.add((rsid,text))
    print(comparison_meta)
    return comparison_meta

# def rsid_single_doc(metadata, rsid_dict):
#     # single rsid in a document with title and paras
#     single_meta = {
#         'title': metadata.get('title'),
#         'paragraphs': []
#     }

#     # gen colour for each rsid
#     rsid_colors = {rsid: ['red', 'blue', 'green', 'yellow', 'cyan', 'grey'][random.randint(0, 5)] 
#                    for rsid in rsid_dict}

#     # for each rsid append text with corresponding color
#     for rsid, info in rsid_dict.items():
#         color = rsid_colors[rsid]
#         for text in info['text']:
#             single_meta['paragraphs'].append({
#                 'rsid': rsid,
#                 'color': color,
#                 'text': text
#             })
#     return single_meta