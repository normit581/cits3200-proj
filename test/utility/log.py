import logging
import os

class Log:
    def __init__(self):
        self.log_dir = None
        self.log_file = None
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.DEBUG)

        self.formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s',
                                           datefmt='%Y-%m-%d %H:%M:%S')

        if self.logger.hasHandlers():
            self.logger.handlers.clear()

    def set_log_path(self, log_dir, log_file):
        self.log_dir = log_dir
        self.log_file = log_file

        os.makedirs(self.log_dir, exist_ok=True)
        log_file_path = os.path.join(self.log_dir, self.log_file)
        
        file_handler = logging.FileHandler(log_file_path)
        file_handler.setLevel(logging.INFO)
        file_handler.setFormatter(self.formatter)
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

    def clean(self):
        if self.log_dir and self.log_file:
            log_file_path = os.path.join(self.log_dir, self.log_file)
            if os.path.exists(log_file_path):
                os.remove(log_file_path)
                print(f"Log file {log_file_path} removed")
            else:
                print(f"Log file {log_file_path} does not exist")

        
# if __name__ == "__main__" :
#     temp = Log()
#     temp.set_log_path('../temp', 'temp.log')
#     temp.log('This is a test message', 'info')
