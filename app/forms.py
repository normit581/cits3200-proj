from flask_wtf import FlaskForm
from wtforms import SubmitField
from wtforms.validators import ValidationError
from app.fields import WordFileField, WordFilesField

class MatchDocumentForm(FlaskForm):
    files = WordFilesField('File')
    submit = SubmitField('Match')

    def validate_files(self, files):
        if not files.data:
            raise ValidationError('Please add at least 1 docx file.')
        
        if len(files.data) > 2:
            raise ValidationError('Maximum of 2 files allowed.')

class VisualiseDocumentForm(FlaskForm):
    base_file = WordFileField('File')
    compare_file = WordFilesField('File')