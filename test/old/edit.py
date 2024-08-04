import win32com.client as win32
import os
import random
import string

# Function to generate random text
def generate_random_text(length):
    return ''.join(random.choices(string.ascii_letters + string.digits + ' ', k=length))

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

# File paths
folder_path = "testdocs"
input_filename = 'document_0.docx'
output_filename = 'document_5.docx'

input_path = folder_path +'/' + input_filename
output_path = folder_path + '/' + output_filename

# Start MS Word and open the document
word = win32.gencache.EnsureDispatch('Word.Application')
word.Visible = False  # Keep Word hidden during the process
doc = word.Documents.Open(os.path.abspath(input_path))

# Perform operations
rearrange_paragraphs(doc)  # Rearrange paragraphs
edit_paragraph(doc, 2, "This is the new text for the second paragraph.")  # Edit second paragraph
delete_paragraph(doc, 3)  # Delete the third paragraph
add_paragraph(doc, generate_random_text(random.randint(50, 100)))  # Add a new paragraph

# Save the modified document
doc.SaveAs(os.path.abspath(output_path), FileFormat=win32.constants.wdFormatXMLDocument)
doc.Close()

# Quit Word
word.Quit()
print(f'Successfully saved the modified document as {output_path}')
