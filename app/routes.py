from flask import render_template, flash, request, jsonify, redirect
from app import app
from app.forms import MatchDocumentForm, VisualiseDocumentForm
from app.helper import FileHelper
from werkzeug.utils import secure_filename
from werkzeug.exceptions import RequestEntityTooLarge

from app.utilities.rsid import *
from app.utilities.temp import TEMP
from app.utilities.metadata import *


import docx, datetime
from itertools import combinations


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
                    filename = secure_filename(file.filename)
                    rsid = rsid_extract(file)
                    file_data.append({'filename': filename, 'rsid': rsid, 'count': rsid[-1]})
                # result dict for comparison loop
                result = {}
                # loop through files, if file isnt current one then add filename, similarity and rsid count.
                for i, file1 in enumerate(file_data):
                    comparisons = []
                    print(f"Comparing file: {file1['filename']}")
                    for j, file2 in enumerate(file_data):
                        if i != j:
                            similarity, matching_rsid = rsid_match2(file1['rsid'], file2['rsid'])
                            file_without_est = FileHelper.remove_extension(file2['filename'])
                            comparisons.append({'filename': file_without_est, 'value': similarity, 'count': file2['rsid'][-1]})
                    file_without_est = FileHelper.remove_extension(file1['filename'])
                    result[file_without_est] = comparisons

                print(f"Processed results: {result}")
                
                return jsonify({'message': 'Files processed successfully.', 'data' : result, 'success': True})
            except Exception as e:
                app.logger.error(f"Error processing files: {str(e)}")
                return jsonify({'error': 'An error occurred while processing the files.'}), 500
        else:
            return jsonify({'error': form.errors}), 400
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
    if request.method == "POST":
        # Get the data from the form
        if form.validate_on_submit():
            files = [form.base_file.data, form.compare_file.data]

            # Create loop that will iterate for the number of files in files
            # error check
            metadata_list = []
            if len(files) == 2:
                file1 = files[0]
                file2 = files[1]

                rsid1 = rsid_extract(file1)
                rsid2 = rsid_extract(file2)
                print(rsid1)
                print('here')
                similarity, matching_rsid = rsid_match2(rsid1, rsid2)
                # print(f"Similarity: {similarity:.03f}%")
                # print('matching_rsid:', matching_rsid)
        
                # extract data
                metadata1, metadata2 = extract_metadata(file1), extract_metadata(file2)
                print(metadata1)
                # rsid associated with text function call
                rsid_metadata = rsid_with_metadata(metadata1, matching_rsid)
                metadata_list.append({
                    'file_name': file1.filename,
                    'metadata': metadata1
                })

                metadata_list.append({
                    'file_name': file2.filename,
                    'metadata': metadata2
                })
                
                return render_template('visualise.html', matching_rsid=matching_rsid, similarity=similarity, metadata_list=metadata_list, rsid_metadata=rsid_metadata)
    return render_template('visualise.html', form=form)