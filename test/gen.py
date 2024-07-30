import win32com.client as win32
import random
import string
import os
import sys

# generate random text
def generate_random_text(length):
    return ''.join(random.choices(string.ascii_letters + string.digits + ' ', k=length))

# directory to save the generated documents
output_dir = 'testdocs'
os.makedirs(output_dir, exist_ok=True)

# generate .docx files
num_files = int(sys.argv[1])
for i in range(num_files):
    filename = os.path.join(output_dir, f'document_{i}.docx')

    # start ms word
    word = win32.gencache.EnsureDispatch('Word.Application')
    word.Visible = False  # Keep Word hidden during the process

    # create new document
    doc = word.Documents.Add()
    doc.Content.Text = 'Random Document\n\n'

    # generate random paragraph
    for _ in range(random.randint(5, 15)):
        doc.Content.InsertAfter(generate_random_text(random.randint(50, 200)) + '\n\n')

    # save
    doc.SaveAs(os.path.abspath(filename), FileFormat=win32.constants.wdFormatXMLDocument)
    doc.Close()

    print(f'Generated {filename}')

word.Quit()
