from flask_wtf.file import MultipleFileField, FileAllowed, FileSize, FileField
from app.helper import ConfigHelper

class BaseWordFileValidator:
    def __init__(self):
        exts = ConfigHelper.get_config_value(ConfigHelper.UPLOAD_EXTENSIONS)
        max_size = ConfigHelper.get_config_value(ConfigHelper.MAX_CONTENT_LENGTH)
        
        self.validators = [
            FileAllowed(
                [ext.replace('.', '') for ext in exts], 
                message=f'Invalid File Type. Must be {", ".join(exts)}'
            ),
            FileSize(max_size=max_size, message=f'File exceeds the maximum size of {max_size // (1024 * 1024)}MB.')
        ]


class WordFileField(FileField, BaseWordFileValidator):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if 'validators' in kwargs:
            kwargs['validators'].extend(self.validators)
        else:
            kwargs['validators'] = self.validators

# multiple files
class WordFilesField(MultipleFileField, BaseWordFileValidator):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if 'validators' in kwargs:
            kwargs['validators'].extend(self.validators)
        else:
            kwargs['validators'] = self.validators