log.py create logger object

code example :
# logs will write to <logs_directory>/<logs_file>
    logger = Log(<logs_directory>, <logs_file>)

# logging
# format
# 2024-08-05 21:46:48 - INFO - <message>
    message = "message"
    logger.log(message, 'info')
    logger.log(message, 'debug')
    logger.log(message, 'warning')
    logger.log(message, 'error')
    logger.log(message, 'critical')

# clean all logs in a log file
    logger.clean(<logs_file>)