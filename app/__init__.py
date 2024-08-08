from flask import Flask, render_template
from app.config import Config

import signal
import sys

from app.utilities.temp import TEMP

def page_not_found(e):
    return render_template('/layout/page_not_found.html', project_name="DocuMatcher"), 404

def create_app(config: Config):
    app = Flask(__name__)
    app.config.from_object(config)
    app.register_error_handler(404, page_not_found)
    return app

app = create_app(Config)

# signal handler to clean up temporary files
def signal_handler(sig, frame):
    print("cleaning up temporary files")
    cleaner = TEMP()
    cleaner.set_log_path('app/temp', 'similarity_result.log')
    cleaner.clean('similarity_result.log')
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)  # Handle Ctrl+C
signal.signal(signal.SIGTERM, signal_handler)  # Handle termination signal


if __name__ == "__main__":
    app.run()

from app import routes