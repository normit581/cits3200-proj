from flask import render_template, flash, request, jsonify
from app import app
from app.forms import MatchDocumentForm, VisualiseDocumentForm
from app.helper import FileHelper, FormHelper, XMLHelper, ColourHelper
from app.utilities.rsid import *
from app.utilities.metadata import *

@app.context_processor
def inject_global_variable():
    return dict(project_name="DocuMatcher")

@app.route('/', methods=['GET'])
@app.route('/home', methods=['GET', 'POST'])
def home():
    form = MatchDocumentForm()
    visualise_form = VisualiseDocumentForm()
    if request.method == 'POST':
        if request.content_length and request.content_length > app.config['MAX_CONTENT_LENGTH']:
            return jsonify({'error': f'File size exceeds the maximum limit of {app.config["MAX_CONTENT_LENGTH"] // (1024 * 1024)}MB.'}), 413
        if form.validate_on_submit():
            try:
                file_data = []
                # process file by extracting filename and rsid, count
                for file in form.files.data:
                    filename = file.filename
                    rsid = rsid_extract(file)
                    file_data.append({'filename': filename, 'rsid': rsid, 'count': rsid[-1]})
                # result dict for comparison loop
                result = {}

                # print("meta", metadata_list)
                # print("rsid:", rsid_extracts)
                # loop through files, if file isnt current one then add filename, similarity and rsid count.
                for i, file1 in enumerate(file_data):
                    comparisons = []
                    print(f"Comparing file: {file1['filename']}")
                    for j, file2 in enumerate(file_data):
                        if i != j:
                            similarity, matching_rsid, common_rsid_count = rsid_match2(file1['rsid'], file2['rsid'])
                            file_without_est = FileHelper.remove_extension(file2['filename'])
                            comparisons.append({'filename': file_without_est, 'value': similarity, 'count': file2['rsid'][-1], 'common_count':common_rsid_count})
                    file_without_est = FileHelper.remove_extension(file1['filename'])
                    result[file_without_est] = comparisons

                print(f"Processed results: {result}")
                
                return jsonify({'message': 'Files processed successfully.', 'data' : result, 'success': True})
            except Exception as e:
                app.logger.error(f"Error processing files: {str(e)}")
                return jsonify({'error': 'An error occurred while processing the files.'}), 500
        else:
            return jsonify({'message': FormHelper.errors_to_str(form), 'success':False}), 400
    return render_template('home.html', form=form, visualise_form=visualise_form)

@app.route('/team', methods=['GET'])
def team():
    return render_template('team.html')

@app.route('/error')
def error(error):
    return render_template('/layout/page_not_found.html'), 404

@app.errorhandler(405)
def method_not_allowed(error):
    flash("Method Not Allowed: The method is not allowed for the requested URL.", "error")
    return render_template('/layout/page_not_found.html'), 405

@app.errorhandler(413)
def request_entity_too_large(error):
    flash(f'The uploaded file is too large. Maximum allowed size is {app.config["MAX_CONTENT_LENGTH"] // (1024 * 1024)}MB.')
    return render_template('/layout/page_not_found.html'), 413

@app.errorhandler(500)
def internal_server_error(error):
    flash(f'Internal Server Error: {error}')
    app.logger.error('Server Error: %s', (error))
    return render_template('/layout/page_not_found.html'), 500

@app.errorhandler(Exception)
def unhandled_exception(e):
    flash(f'Unhandled Error: {e}')
    app.logger.error('Unhandled Exception: %s', (e))
    return render_template('/layout/page_not_found.html'), 500

@app.route('/visualise', methods=['POST'])
def visualise():
    form = VisualiseDocumentForm()

    if form.validate_on_submit():
        files = [form.base_file.data, form.compare_file.data]
        counts = [form.base_count.data, form.compare_count.data]
        results = []
        all_rsids = [set(), set()]

        # Extract content and gather RSIDs
        docx_objects = []
        for i, file in enumerate(files):
            filename = file.filename
            docx = DOCX(filename)
            XMLHelper(file).extract_to_docx(docx)
            docx_objects.append(docx)
            all_rsids[i] = set(docx.unique_rsid.keys())

        # Determine common RSIDs
        common_rsids = all_rsids[0].intersection(all_rsids[1])
        shared_colours = {rsid: ColourHelper.random_standard_rgb_str() for rsid in common_rsids}
        # when RSID too much, this can prevent multiple RSIDs with same colours
        shared_colours = ColourHelper.remove_duplicates(shared_colours)

        # Process each document
        for i, docx in enumerate(docx_objects):
            filename = files[i].filename
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
            result = {
                "file_name": docx.docx_name,
                "metadata": {
                    "similarity": RSID.calculate_similarity(form.common_count.data, counts[i], 2),
                    "count": counts[i],
                    "title": docx.get_metadata(DOCX.TITLE),
                    "created": docx.get_metadata(DOCX.DATE_CREATED),
                    "paragraphs": paragraphs
                }
            }
            results.append(result)
        return render_template('visualise.html', metadata_list=results)
    return render_template('visualise.html', form=form)