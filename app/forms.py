from flask import current_app
from flask_wtf import FlaskForm
from flask_wtf.file import MultipleFileField, FileAllowed
from wtforms import SubmitField
from wtforms.validators import ValidationError

class WordFilesField(MultipleFileField):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        exts = current_app.config['UPLOAD_EXTENSIONS']
        self.validators=[
            FileAllowed(
                [ext.replace('.','') for ext in exts], 
                message = f'Invalid File Type. Must be {", ".join(exts)}' 
            )]

class MatchDocumentForm(FlaskForm):
    files = WordFilesField('File')
    submit = SubmitField('Match')

    def validate_files(self, files):
        if files.data == None or len(files.data) < 1:
            raise ValidationError('Please add at least 1 docx file.')