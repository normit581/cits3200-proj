from app.helper import FileHelper, XMLHelper, ColourHelper
from app.utilities.rsid import *
from app.utilities.metadata import *
from app.forms import *

class MatchProcessor:
    def __init__(self, form: MatchDocumentForm):
        self.files = form.files.data

    def process_files(self):
        file_data = []
        # process file by extracting filename and rsid, count
        for file in self.files:
            filename = file.filename
            rsid = rsid_extract(file)
            file_data.append({'filename': filename, 'rsid': rsid, 'count': rsid[-1]})
        return file_data

    def compare_files(self, file_data):
        result = {}
        # loop through files, if file isnt current one then add filename, similarity and rsid count.
        for i, file1 in enumerate(file_data):
            comparisons = []
            for j, file2 in enumerate(file_data):
                if i != j:
                    similarity, _, common_rsid_count = rsid_match2(file1['rsid'], file2['rsid'])
                    file_without_ext = FileHelper.remove_extension(file2['filename'])
                    comparisons.append({'filename': file_without_ext, 'value': similarity, 'count': file2['rsid'][-1], 'common_count': common_rsid_count})
            file_without_ext = FileHelper.remove_extension(file1['filename'])
            result[file_without_ext] = comparisons
        return result


class VisualiseProcessor:
    def __init__(self, form: VisualiseDocumentForm):
        self.form = form
        self.common_count = form.common_count.data
        self.files = [form.base_file.data, form.compare_file.data]
        self.counts = [form.base_count.data, form.compare_count.data]
    
    def extract_rsids_from_files(self):
        docx_objects = []
        all_rsids = [set(), set()]
        for i, file in enumerate(self.files):
            docx = DOCX(file.filename)
            XMLHelper(file).extract_to_docx(docx)
            docx_objects.append(docx)
            all_rsids[i] = set(docx.unique_rsid.keys())
        return docx_objects, all_rsids
    
    @staticmethod
    def process_common_rsids_and_colours(all_rsids:list[set]):
        # Determine common RSIDs
        common_rsids = all_rsids[0].intersection(all_rsids[1])
        shared_colours = {rsid: ColourHelper.random_standard_rgb_str() for rsid in common_rsids}
        # when RSID too much, this can prevent multiple RSIDs with same colours
        shared_colours = ColourHelper.remove_duplicates(shared_colours)
        return common_rsids, shared_colours
    
    def process_documents(self, docx_objects:list[DOCX], common_rsids, shared_colours):
        def to_json(docx:DOCX, count, paragraphs):
            return {
                "file_name": docx.docx_name,
                "metadata": {
                    "similarity": RSID.calculate_similarity(self.common_count, count, 2),
                    "total_words": docx.get_metadata(DOCX.NUMBER_WORDS),
                    "count": count,
                    "editing_time": docx.get_metadata(DOCX.TOTAL_TIME),
                    "created_by": docx.get_metadata(DOCX.CREATED_BY),
                    "created": docx.get_metadata(DOCX.DATE_CREATED),
                    "modified_by": docx.get_metadata(DOCX.LAST_MODIFIED_BY),
                    "paragraphs": paragraphs
                }
            }
        
        results = []
        for i, docx in enumerate(docx_objects):
            colours = {rsid: ColourHelper.random_light_rgb_str() for rsid in docx.unique_rsid.keys()}
            paragraphs = []
            for para in docx.paragraphs.values():
                current_paragraph = []
                for txt, rsid in zip(para.txt_array, para.rsid_array):
                    if current_paragraph and current_paragraph[-1]['rsid'] == rsid:
                        current_paragraph[-1]['text'] += txt  # Concatenate text if rsid matches the last one
                    else:
                        current_paragraph.append({
                            "rsid": rsid,
                            "colour": shared_colours.get(rsid, colours.get(rsid)),
                            "text": txt,
                            "is_match": rsid in common_rsids
                        })
                paragraphs.append(current_paragraph)
            result = to_json(docx, self.counts[i], paragraphs)
            results.append(result)
        return results
