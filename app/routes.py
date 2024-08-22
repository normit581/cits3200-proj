from flask import render_template, flash, request, jsonify, redirect
from app import app
from app.forms import MatchDocumentForm, VisualiseDocumentForm
from werkzeug.utils import secure_filename
from werkzeug.exceptions import RequestEntityTooLarge

from app.utilities.rsid import *
from app.utilities.temp import TEMP


import docx, datetime
from itertools import combinations


@app.context_processor
def inject_global_variable():
    return dict(project_name="DocuMatcher")

dummy_json_result = {
    "doc1Student": [
        {"filename": "doc2Student", "value": 35.32, "count":3200}, 
    ]*30,
    "doc2Student": [
        {"filename": "doc1Student", "value": 20.55, "count":2000},
    ],
    "doc3Student": [
        {"filename": "doc1Student", "value": 0.1, "count":20},
    ],
    "doc4Student": [
        {"filename": "doc3Student", "value": 0.5, "count":98}, 
        {"filename": "doc4Student", "value": 0.000, "count":3}
    ]
}

dummy_visualise_result = [
    {
        'file_name': 'doc1Student', 
        'metadata': {
            'title': 'doc1',
            'created': datetime.datetime.now(), 
            'paragraphs': ['This is text from doc1Student', 'I got another text']*30
        }
    }, 
    {
        'file_name': 'doc2Student', 
        'metadata': {
            'title': 'doc2',
            'created': datetime.datetime.now(), 
            'paragraphs': ['This is text from doc2Student', 'I now presented out']*50
        }
    }
]

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
                for file in form.files.data:
                    filename = secure_filename(file.filename)
                    print(f"Processing file: {filename}")

                # extract rsid and calculate similarity

                
                return jsonify({'message': 'Files processed successfully.', 'data' : dummy_json_result, 'success': True})
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
        print("posted")
        if form.validate_on_submit():
            files = [form.base_file.data, form.compare_file.data]

            # Create loop that will iterate for the number of files in files
            
            # error check
            if len(files) < 2:
                flash('At least two files required for comparison.' ,'error')
                return redirect('home')

            if len(files) == 2:
                file1 = files[0]
                file2 = files[1]
                
                # doc1 = docx.Document(file1)
                # doc2 = docx.Document(file2)

                # similarity = rsid_match2(doc1, doc2)

                return render_template('visualise.html', results=dummy_visualise_result)
            
            ## make loop for combinations to main file
            else:
                file1 = files[0]
                main_doc = docx.Document(file1)
                similarity_results = []

                for file in files[1:]:
                    compare_doc = docx.Document(file)
                    similarity = rsid_match2(main_doc, compare_doc)
                    similarity_results.append({"file": file.filename, "similarity": similarity})
                return render_template('visualise.html', form=form, similarity=similarity_results)
    return render_template('visualise.html', form=form)