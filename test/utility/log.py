import logging
import os

class Log:
    def __init__(self, log_dir, log_file):
        self.log_dir = log_dir
        self.log_file = log_file
        
        # Ensure the logs directory exists
        os.makedirs(self.log_dir, exist_ok=True)

        # Configure the logging
        logging.basicConfig(level=logging.INFO,
                            format='%(asctime)s - %(levelname)s - %(message)s')

        # Create a logger
        self.logger = logging.getLogger(__name__)

        # Create a file handler to save logs to a file in the logs directory
        file_handler = logging.FileHandler(f'{self.log_dir}/{self.log_file}')
        file_handler.setLevel(logging.INFO)

        # Create a formatter and set it for the file handler
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s',
                                    datefmt='%Y-%m-%d %H:%M:%S')
        file_handler.setFormatter(formatter)

        # Add the file handler to the logger
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

# if __name__ == '__main__':
#     logger = Log('test.txt')
    
#     message = "This is a test message"
#     logger.log(message, 'info')
#     logger.clean('test.txt')
    
