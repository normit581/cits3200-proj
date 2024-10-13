from flask_wtf import FlaskForm
from wtforms import SubmitField, IntegerField
from wtforms.validators import ValidationError
from app.fields import WordFileField, WordFilesField
from app.helper import ConfigHelper

class MatchDocumentForm(FlaskForm):
    files = WordFilesField('File')
    submit = SubmitField('Match')

    def validate_files(self, files):
        if not files.data:
            raise ValidationError('Please add at least 2 docx file.')

        max_files_upload = ConfigHelper().max_files_upload_value
        if len(files.data) > max_files_upload:
            raise ValidationError(f'Maximum of {max_files_upload} files allowed.')

        if len(files.data) < 2:
            raise ValidationError('Minimum of 2 files allowed.')


class VisualiseDocumentForm(FlaskForm):
    base_file = WordFileField('File')
    compare_file = WordFileField('File')
    base_count = IntegerField('Base Count')
    compare_count = IntegerField('Compare Count')
    common_count = IntegerField('Common Count')