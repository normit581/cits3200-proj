import os
import zipfile
from bs4 import BeautifulSoup
from docx import Document
from app.utilities.metadata import PROPERTY

class FileHelper:
    @staticmethod
    def remove_extension(filename: str) -> str:
        """Removes the extension from the provided filename."""
        return os.path.splitext(filename)[0]


class XMLHelper:
    # .docx XML tags for respective elements
    BODY_TAG = "w:body"
    PARAGRAPH_TAG = "p"
    PARAGRAPH_PROPERTY_TAG = "pPr"
    RUN_TAG = "r"
    RUN_PROPERTY_TAG = "rPr"
    HYPERLINK_TAG = "hyperlink"
    TEXT_TAG = "t"
    RSIDR_PROPERTY = "w:rsidR"
    PARAGRAPH_ID_PROPERTY = "w14:paraId"

    MISSING_RSID_REPLACEMENT = "None"
    MISSING_PARAGRAPH_ID_REPLACEMENT = "None"

    """Initializes and prepares the file for extraction."""
    def __init__(self, file):
        """Get the contents of relevant XML files."""
        def get_xml(f, type_):
            with zipfile.ZipFile(f) as z:
                return z.read(f'docProps/{type_}.xml') if type_ == "app" else z.read(f'word/{type_}.xml')

        self.document_content = get_xml(file, "document")
        self.settings_content = get_xml(file, "settings")
        self.app_content = get_xml(file, "app")
        self.sourcefile = file

    def extract_to_docx(self, docx):
        """Extract data from XML to the docx object."""
        self.parse_xml(docx, self.document_content)
        self.extract_metadata(docx, self.sourcefile)

    def parse_xml(self, docx, document_content):
        """Parse document XML content and update the docx object."""
        soup = BeautifulSoup(document_content, 'xml')
        body = soup.find(XMLHelper.BODY_TAG)

        for child in body.children:
            if child.name != XMLHelper.PARAGRAPH_TAG:
                print("Skipping", child.name)
                continue

            default_rsid = child.get(XMLHelper.RSIDR_PROPERTY, XMLHelper.MISSING_RSID_REPLACEMENT)
            paragraph_id = child.get(XMLHelper.PARAGRAPH_ID_PROPERTY, XMLHelper.MISSING_PARAGRAPH_ID_REPLACEMENT)
            
            paragraph_property = child.find(XMLHelper.PARAGRAPH_PROPERTY_TAG)
            default_properties = self.parse_tag_pr(paragraph_property) if paragraph_property else []

            for gchild in child.children:
                if gchild.name in [XMLHelper.RUN_TAG, XMLHelper.HYPERLINK_TAG]:
                    run_tag = gchild.find(XMLHelper.RUN_TAG) if gchild.name == XMLHelper.HYPERLINK_TAG else gchild
                    self.parse_run_tag(docx, run_tag, paragraph_id, default_rsid, default_properties)
                else:
                    print(paragraph_id, "Skipping", gchild.name)

    def parse_tag_pr(self, tag_pr):
        """Extract properties from a BeautifulSoup tag."""
        properties = []
        for child in tag_pr.children:
            name = child.name
            value_dict = child.attrs
            properties.append(PROPERTY(child, name, value_dict, PROPERTY.PARENT))
        return properties

    def parse_run_tag(self, docx, tag_r, paragraph_id, default_rsid, default_properties):
        """Process a <w:r> tag and append text to the docx object."""
        tag_r_t = tag_r.find(XMLHelper.TEXT_TAG)
        if not tag_r_t:
            return

        txt = tag_r_t.string
        rsid = tag_r.get(XMLHelper.RSIDR_PROPERTY, default_rsid)

        property_tag = tag_r.find(XMLHelper.RUN_PROPERTY_TAG)
        tag_r_properties = self.parse_tag_pr(property_tag) if property_tag else default_properties

        docx.append_txt(paragraph_id, rsid, tag_r_properties, txt)

    def extract_metadata(self, docx, sourcefile):
        """Extract and process document metadata."""
        doc = Document(sourcefile)
        properties = {
            docx.CREATED_BY: doc.core_properties.author,
            docx.DATE_CREATED: doc.core_properties.created,
            docx.DATE_LAST_MODIFIED: doc.core_properties.modified,
            docx.TITLE: doc.core_properties.title,
            docx.VERSION: doc.core_properties.version
        }
        for key, value in properties.items():
            docx.append_metadata(key, value)
