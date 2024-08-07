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
    app.temp = TEMP('app/temp', 'rsid_similarity.log')
    return app

app = create_app(Config)

# signal handler to clean up temporary files
def signal_handler(sig, frame):
    print("cleaning up temporary files")
    app.temp.clean('rsid_similarity.log')
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)  # Handle Ctrl+C
signal.signal(signal.SIGTERM, signal_handler)  # Handle termination signal

if __name__ == "__main__":
    app.run()

from app import routes