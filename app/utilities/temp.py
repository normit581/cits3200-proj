import logging
import os

class TEMP:
    def __init__(self, log_dir, log_file):
        self.log_dir = log_dir
        self.log_file = log_file

        os.makedirs(self.log_dir, exist_ok=True)

        logging.basicConfig(level=logging.INFO,
                            format='%(asctime)s - %(levelname)s - %(message)s')

        self.logger = logging.getLogger(__name__)

        file_handler = logging.FileHandler(f'{self.log_dir}/{self.log_file}')
        file_handler.setLevel(logging.INFO)

        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s',
                                    datefmt='%Y-%m-%d %H:%M:%S')
        file_handler.setFormatter(formatter)
        
        self.logger.addHandler(file_handler)

    def log(self, message, level):
        if level == 'debug':
            self.logger.debug(message)
        elif level == 'info':
            self.logger.info(message)
        elif level == 'warning':
            self.logger.warning(message)
        elif level == 'error':
            self.logger.error(message)
        elif level == 'critical':
            self.logger.critical(message)
        else:
            self.logger.error(f"Invalid log level: {level}")
            
    def clean(self, log_file):
        os.remove(f'{self.log_dir}/{log_file}')
