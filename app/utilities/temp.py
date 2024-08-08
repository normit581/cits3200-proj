import logging
import os

class TEMP:
    def __init__(self):
        self.log_dir = None
        self.log_file = None
        self.logger = logging.getLogger(__name__)

        logging.basicConfig(level=logging.INFO,
                            format='%(asctime)s - %(levelname)s - %(message)s')

        self.formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s',
                                    datefmt='%Y-%m-%d %H:%M:%S')

    # set path for output
    def set_log_path(self, log_dir, log_file):
        self.log_dir = log_dir
        self.log_file = log_file
        
        os.makedirs(self.log_dir, exist_ok=True)
        file_handler = logging.FileHandler(f'{self.log_dir}/{self.log_file}')
        file_handler.setLevel(logging.INFO)
        file_handler.setFormatter(self.formatter)
        self.logger.addHandler(file_handler)

    # log messages
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
        
# if __name__ == "__main__" :
#     temp = TEMP()
#     temp.set_log_path('../temp', 'temp.log')
#     temp.log('This is a test message', 'info')