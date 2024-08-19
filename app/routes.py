from flask import render_template, flash, request, jsonify
from app import app
from app.forms import MatchDocumentForm
from werkzeug.utils import secure_filename
from werkzeug.exceptions import RequestEntityTooLarge

from app.utilities.rsid import *
from app.utilities.temp import TEMP


import docx
from itertools import combinations


@app.context_processor
def inject_global_variable():
    return dict(project_name="DocuMatcher")

@app.route('/', methods=['GET'])
@app.route('/home', methods=['GET', 'POST'])
def home():
    form = MatchDocumentForm()
    if request.method == 'POST':
        if request.content_length and request.content_length > app.config['MAX_CONTENT_LENGTH']:
            return jsonify({'error': f'File size exceeds the maximum limit of {app.config["MAX_CONTENT_LENGTH"] // (1024 * 1024)}MB.'}), 413
        
        if form.validate_on_submit():
            try:
                for file in form.files.data:
                    filename = secure_filename(file.filename)
                    print(f"Processing file: {filename}")

                # extract rsid and calculate similarity

                
                return jsonify({'message': 'Files processed successfully.'})
            except Exception as e:
                app.logger.error(f"Error processing files: {str(e)}")
                return jsonify({'error': 'An error occurred while processing the files.'}), 500
        else:
            return jsonify({'error': form.errors}), 400
    return render_template('home.html', form=form)

@app.route('/team', methods=['GET'])
def team():
    return render_template('team.html')

@app.route('/error')
def error(error = None):
    return render_template('/layout/page_not_found.html'), 404

@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({'error': f'The uploaded file is too large. Maximum allowed size is {app.config["MAX_CONTENT_LENGTH"] // (1024 * 1024)}MB.'}), 413

@app.errorhandler(500)
def internal_server_error(error):
    app.logger.error('Server Error: %s', (error))
    return jsonify({'error': 'Internal Server Error'}), 500

@app.errorhandler(Exception)
def unhandled_exception(e):
    app.logger.error('Unhandled Exception: %s', (e))
    return jsonify({'error': 'An unexpected error has occurred'}), 500

@app.route('/visualise', methods=['GET', 'POST'])
def visualise():
    form = MatchDocumentForm()
    if request.method == "POST":
        # Get the data from the form
        print("posted")
        if form.validate_on_submit():
            files = form.files.data
            # Create loop that will iterate for the number of files in files
            
            # error check
            if len(files) < 2:
                return jsonify({'error': 'At least two files required for comparison.'}), 400

            if len(files) == 2:
                file1 = files[0]
                file2 = files[1]
                
                doc1 = docx.Document(file1)
                doc2 = docx.Document(file2)

                similarity = rsid_simof2(doc1, doc2)

                return render_template('visualise.html', file1_name=file1.filename, file2_name=file2.filename, similarity=similarity)
            
            ## make loop for combinations to main file
            else:
                file1 = files[0]
                main_doc = docx.Document(file1)
                similarity_results = []

                for file in files[1:]:
                    compare_doc = docx.Document(file)
                    similarity = rsid_simof2(main_doc, compare_doc)
                    similarity_results.append({"file": file.filename, "similarity": similarity})
                return render_template('visualise.html', form=form, similarity=similarity_results)
                
    return render_template('visualise.html', form=form)