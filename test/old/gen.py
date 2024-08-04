import win32com.client as win32
import random
import string
import os
import sys

# Generate random text
def generate_random_text(length):
    return ''.join(random.choices(string.ascii_letters + string.digits + ' ', k=length))

# Directory to save the generated documents
output_dir = 'testdocs'
os.makedirs(output_dir, exist_ok=True)

# Number of documents to generate
num_files = int(sys.argv[1])

# Generate .docx files and edit them multiple times
for i in range(num_files):
    filename = os.path.join(output_dir, f'document_{i}.docx')

    # Start MS Word
    word = win32.gencache.EnsureDispatch('Word.Application')
    word.Visible = False  # Keep Word hidden during the process

    # Create new document
    doc = word.Documents.Add()
    doc.Content.Text = f'Random Document {i}\n\n'

    # Generate initial random paragraphs
    for _ in range(random.randint(5, 15)):
        doc.Content.InsertAfter(generate_random_text(random.randint(50, 200)) + '\n\n')

    # Save the initial document
    doc.SaveAs(os.path.abspath(filename), FileFormat=win32.constants.wdFormatXMLDocument)
    print(f'Created {filename}')

    # Perform several random edits
    num_edits = random.randint(1, 3)
    for edit in range(num_edits):
        # Get a random paragraph in the document
        para_count = doc.Paragraphs.Count
        para_index = random.randint(1, para_count)
        paragraph = doc.Paragraphs(para_index)

        # Insert random text before or after the paragraph
        if random.choice([True, False]):
            paragraph.Range.InsertBefore(generate_random_text(random.randint(20, 100)) + '\n\n')
        else:
            paragraph.Range.InsertAfter(generate_random_text(random.randint(20, 100)) + '\n\n')

        # Save the document, overwriting the original file
        doc.SaveAs(os.path.abspath(filename), FileFormat=win32.constants.wdFormatXMLDocument)
        print(f'Edited {filename} - Edit {edit + 1}')

    # Close the document
    doc.Close()

# Quit Word
word.Quit()
