from flask import render_template, flash, request, jsonify
from app import app
from app.forms import MatchDocumentForm, VisualiseDocumentForm
from app.helper import FormHelper, ConfigHelper
from app.processor import *

@app.context_processor
def inject_global_variable():
    return dict(project_name=ConfigHelper.get_config_value(ConfigHelper.PROJECT_NAME))

@app.route('/', methods=['GET'])
@app.route('/home', methods=['GET', 'POST'])
def home():
    form = MatchDocumentForm()
    visualise_form = VisualiseDocumentForm()
    if request.method == 'POST':
        max_content_length = ConfigHelper.get_config_value(ConfigHelper.MAX_CONTENT_LENGTH)
        if request.content_length and request.content_length > max_content_length:
            return jsonify({'error': f'File size exceeds the maximum limit of {ConfigHelper().max_content_length_display_text}.'}), 413
        if form.validate_on_submit():
            processor = MatchProcessor(form)
            try:
                file_data = processor.process_files()
                result = processor.compare_files(file_data)
                return jsonify({'message': 'Files processed successfully.', 'data': result, 'success': True})
            except Exception as e:
                app.logger.error(f"Error processing files: {str(e)}")
                return jsonify({'error': 'An error occurred while processing the files.'}), 500
        else:
            return jsonify({'message': FormHelper.errors_to_str(form), 'success':False}), 400
    return render_template('home.html', form=form, visualise_form=visualise_form, 
                           config = ConfigHelper.get_all_config())

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
    flash(f'The uploaded file is too large. Maximum allowed size is {ConfigHelper().max_content_length_display_text}.', 'error')
    return render_template('/layout/page_not_found.html'), 413

@app.errorhandler(500)
def internal_server_error(error):
    flash(f'Internal Server Error: {error}', 'error')
    app.logger.error('Server Error: %s', (error))
    return render_template('/layout/page_not_found.html'), 500

@app.errorhandler(Exception)
def unhandled_exception(e):
    flash(f'Unhandled Error: {e}', 'error')
    app.logger.error('Unhandled Exception: %s', (e))
    return render_template('/layout/page_not_found.html'), 500

@app.route('/visualise', methods=['POST'])
def visualise():
    form = VisualiseDocumentForm()
    if form.validate_on_submit():
        processor = VisualiseProcessor(form)
        docx_objects, all_rsids = processor.extract_rsids_from_files()
        common_rsids, shared_colours = processor.process_common_rsids_and_colours(all_rsids)
        results = processor.process_documents(docx_objects, common_rsids, shared_colours)
        return render_template('visualise.html', metadata_list=results)
    return render_template('visualise.html', form=form)