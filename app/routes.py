from flask import render_template, flash, request, jsonify
from app import app
from app.forms import MatchDocumentForm
from werkzeug.utils import secure_filename
from werkzeug.exceptions import RequestEntityTooLarge

from app.utilities.rsid import *
from app.utilities.temp import TEMP

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
                similarity_result_map, similarity_result_lst = rsid_sim(form.files)
                
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