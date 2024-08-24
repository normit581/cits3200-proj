import win32com.client as win32
import xml.etree.ElementTree as ET
import random
import string
import os

testdocx_dir = 'testdocs'
os.makedirs(testdocx_dir, exist_ok=True)

# Generate random text
def generate_random_text(length):
    return ''.join(random.choices(string.ascii_letters + string.digits + ' ', k=length))

def generate_docx(num_files) :
    # Generate .docx files and edit them multiple times
    for i in range(num_files):
        filename = os.path.join(testdocx_dir, f'document_{i}.docx')
        
        if filename in os.listdir(testdocx_dir) :
            continue

        # Start MS Word
        word = win32.gencache.EnsureDispatch('Word.Application')
        word.Visible = False

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
            # print(f'Edited {filename} - Edit {edit + 1}')

        # Close the document
        doc.Close()

    # Quit Word
    word.Quit()
    
# Function to rearrange paragraphs
def rearrange_paragraphs(doc):
    paragraphs = doc.Paragraphs
    if paragraphs.Count > 1:
        # Swap first and last paragraphs
        first_paragraph = paragraphs(1)
        last_paragraph = paragraphs(paragraphs.Count)
        first_text = first_paragraph.Range.Text
        last_text = last_paragraph.Range.Text
        
        first_paragraph.Range.Text = last_text
        last_paragraph.Range.Text = first_text

# Function to edit a paragraph
def edit_paragraph(doc, index, new_text):
    paragraphs = doc.Paragraphs
    if index <= paragraphs.Count:
        paragraphs(index).Range.Text = new_text

# Function to delete a paragraph
def delete_paragraph(doc, index):
    paragraphs = doc.Paragraphs
    if index <= paragraphs.Count:
        paragraphs(index).Range.Delete()

# Function to add a new paragraph
def add_paragraph(doc, text):
    doc.Content.InsertAfter(text + '\n\n')

def edit_docx(input_file, output_file) :   
    input_path = os.path.join(testdocx_dir, input_file)
    output_path = os.path.join(testdocx_dir, output_file)

    # Start MS Word and open the document
    word = win32.Dispatch('Word.Application')
    word.Visible = False
    doc = word.Documents.Open(os.path.abspath(input_path))

    # Perform operations
    r = random.randint(1, 3)
    rearrange_paragraphs(doc)  # Rearrange paragraphs
    edit_paragraph(doc, r, "This is the new text for the second paragraph.")  # Edit second paragraph
    delete_paragraph(doc, r)  # Delete the third paragraph
    add_paragraph(doc, generate_random_text(random.randint(50, 100)))  # Add a new paragraph

    # Save the modified document
    doc.SaveAs(os.path.abspath(output_path), FileFormat=win32.constants.wdFormatXMLDocument)
    doc.Close()

    # Quit Word
    word.Quit()
    # print(f'Successfully saved the modified document as {output_path}')
    
def clean() :
    for f in os.listdir(testdocx_dir):
        os.remove(os.path.join(testdocx_dir, f))