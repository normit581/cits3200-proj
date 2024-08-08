from flask import current_app
from flask_wtf import FlaskForm
from flask_wtf.file import MultipleFileField, FileAllowed, FileSize
from wtforms import SubmitField
from wtforms.validators import ValidationError

class WordFilesField(MultipleFileField):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        exts = current_app.config['UPLOAD_EXTENSIONS']
        max_size = current_app.config['MAX_CONTENT_LENGTH']
        self.validators = [
            FileAllowed(
                [ext.replace('.','') for ext in exts], 
                message = f'Invalid File Type. Must be {", ".join(exts)}' 
            ),
            FileSize(max_size=max_size, message=f'File exceeds the maximum size of {max_size // (1024 * 1024)}MB.')
        ]

class MatchDocumentForm(FlaskForm):
    files = WordFilesField('File')
    submit = SubmitField('Match')

    def validate_files(self, files):
        if not files.data:
            raise ValidationError('Please add at least 1 docx file.')
        
        if len(files.data) > 2:
            raise ValidationError('Maximum of 2 files allowed.')
        
        total_size = sum(file.content_length for file in files.data)
        max_size = current_app.config['MAX_CONTENT_LENGTH']
        if total_size > max_size:
            raise ValidationError(f'Total file size exceeds the maximum of {max_size // (1024 * 1024)}MB.')