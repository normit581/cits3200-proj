from flask import render_template, flash
from app import app
from app.forms import MatchDocumentForm

@app.context_processor
def inject_global_variable():
    return dict(project_name="DocuMatcher")

@app.route('/', methods=['GET'])
@app.route('/home', methods= ['GET', 'POST'])
def home():
    form = MatchDocumentForm()
    if form.validate_on_submit():
        print(form.files.data)
        flash('Docx is sent to backend.', 'success')
    return render_template('home.html', form=form)

@app.route('/team', methods=['GET'])
def team():
    return render_template('team.html')

@app.route('/error')
def error(error = None):
    return render_template('/layout/page_not_found.html'), 404