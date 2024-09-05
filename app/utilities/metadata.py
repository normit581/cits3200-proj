from docx import Document
import random
def extract_metadata(docx):
    doc = Document(docx)
    
    metadata = {
        'title': doc.core_properties.title,
        'created': doc.core_properties.created,
        'paragraphs': [para.text for para in doc.paragraphs if para.text.strip()]
    }
    metadata["colours"] = [['red', 'blue', 'green', 'yellow', 'cyan', 'grey'][random.randint(0,5)] for i in range(-1, len(metadata["paragraphs"]))]
    return metadata