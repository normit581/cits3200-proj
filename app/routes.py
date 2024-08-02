from flask import render_template
from app import app

@app.context_processor
def inject_global_variable():
    return dict(project_name="DocuMatcher")

@app.route('/', methods=['GET'])
@app.route('/home')
def home():
    return render_template('home.html')

@app.route('/team', methods=['GET'])
def team():
    return render_template('team.html')

@app.route('/error')
def error(error = None):
    return render_template('/layout/page_not_found.html'), 404