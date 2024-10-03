import os, zipfile, random
from bs4 import BeautifulSoup
from docx import Document
from app.utilities.metadata import PROPERTY, DOCX

class FileHelper:
    @staticmethod
    def remove_extension(filename: str) -> str:
        """Removes the extension from the provided filename."""
        return os.path.splitext(filename)[0]
    

class FormHelper:
    @staticmethod
    def errors_to_str(form):
        error_messages = []
        seen_messages = set()  # track unique error messages
        for field, errors in form.errors.items():
            for error in errors:
                formatted_error = f"<br>{field}: {error}"
                if formatted_error not in seen_messages:
                    error_messages.append(formatted_error)
                    seen_messages.add(formatted_error)
        return "".join(error_messages)


class ColourHelper:
    @staticmethod    
    def random_standard_rgb_str():
        colours = [
            [255, 0, 0], [255, 255, 0], [139, 0, 0], [139, 139, 0], 
            [128, 0, 0], [128, 128, 0], [100, 0, 0], [100, 100, 0],
            [255, 165, 0], [255, 140, 0], [255, 192, 203], [165, 42, 42]]
        colour = random.choice(colours)
        random.shuffle(colour)
        return f"rgb({colour[0]},{colour[1]},{colour[2]})"
    
    @staticmethod    
    def random_light_rgb_str():
        return f"rgb({random.randint(200, 255)}, {random.randint(200, 255)}, {random.randint(200, 255)})" 
    
    @staticmethod    
    def random_rgb_str():
        return f"rgb({random.randint(50, 250)}, {random.randint(50, 250)}, {random.randint(50, 250)})"
    
    @staticmethod    
    def remove_duplicates(colour_dict, max_retries=5):
        used_colours = set(colour_dict.values())
        for rsid, colour in colour_dict.items():
            retries = 0
            while colour in used_colours and retries < max_retries:
                colour = ColourHelper.random_standard_rgb_str()
                retries += 1
            used_colours.add(colour)
            colour_dict[rsid] = colour
        return colour_dict


class XMLHelper:
    # .docx XML tags for respective elements
    BODY_TAG                = "w:body"
    PARAGRAPH_TAG           = "p"
    PARAGRAPH_PROPERTY_TAG  = "pPr"
    RUN_TAG                 = "r"
    RUN_PROPERTY_TAG        = "rPr"
    HYPERLINK_TAG           = "hyperlink"
    TEXT_TAG                = "t"
    RSIDR_PROPERTY          = "w:rsidR"
    PARAGRAPH_ID_PROPERTY   = "w14:paraId"

    MISSING_RSID_REPLACEMENT            = "None"
    MISSING_PARAGRAPH_ID_REPLACEMENT    = "None"

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
        self.extract_app_xml(docx, self.app_content)
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

    def extract_app_xml(self, docx:DOCX, app_content):
        
        def extract_tag_value(tag: BeautifulSoup, property_string, default='-'):
            if tag:
                value = tag.string or default
            else:
                value = default
            docx.append_metadata(property_string, value)

        soup = BeautifulSoup(app_content, 'xml')
        extract_tag_value(soup.find('TotalTime'), DOCX.TOTAL_TIME)
        extract_tag_value(soup.find('Words'), DOCX.NUMBER_WORDS)

    def extract_metadata(self, docx:DOCX, sourcefile):
        """Extract and process document metadata."""
        doc = Document(sourcefile)
        doc_prop = doc.core_properties
        properties = {
            DOCX.CREATED_BY         : doc_prop.author,
            DOCX.DATE_CREATED       : doc_prop.created,
            DOCX.CREATED_BY         : doc_prop.author,
            DOCX.LAST_MODIFIED_BY   : doc_prop.last_modified_by,
            DOCX.DATE_LAST_MODIFIED : doc_prop.modified,
            DOCX.REVISIONS          : doc_prop.revision,
            DOCX.TITLE              : doc_prop.title,
            DOCX.VERSION            : doc_prop.version
        }
        for key, value in properties.items():
            docx.append_metadata(key, value)