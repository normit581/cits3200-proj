from flask_wtf import FlaskForm
from wtforms import SubmitField, IntegerField
from wtforms.validators import ValidationError
from app.fields import WordFileField, WordFilesField

class MatchDocumentForm(FlaskForm):
    files = WordFilesField('File')
    submit = SubmitField('Match')

    def validate_files(self, files):
        if not files.data:
            raise ValidationError('Please add at least 1 docx file.')

        if len(files.data) > 20:
            raise ValidationError('Maximum of 2 files allowed.')

class VisualiseDocumentForm(FlaskForm):
    base_file = WordFileField('File')
    compare_file = WordFileField('File')
    base_count = IntegerField('Base Count')
    compare_count = IntegerField('Compare Count')
    common_count = IntegerField('Common Count')