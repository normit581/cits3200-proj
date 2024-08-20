from docx import Document

def extract_metadata(docx):
    doc = Document(docx)
    
    metadata = {
        'title': doc.core_properties.title,
        'created': doc.core_properties.created,
        'paragraphs': [para.text for para in doc.paragraphs if para.text.strip()]
    }

    return metadata