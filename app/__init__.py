from flask import Flask, render_template
from app.config import Config, TestingConfig

import signal
import sys

from app.utilities.temp import TEMP


def page_not_found(e):
    return render_template('/layout/page_not_found.html', project_name="DocuMatcher"), 404


def create_app(config: Config = None):
    if not config:
        config = Config

    app = Flask(__name__)
    app.config.from_object(config)
    app.register_error_handler(404, page_not_found)
    

    return app


# app = create_app(TestingConfig)
app = create_app(Config)
def list_routes():
    for rule in app.url_map.iter_rules():
        print(f"Endpoint: {rule.endpoint} - URL: {rule}")
list_routes()


def signal_handler(sig, frame):
    sys.exit(0)


signal.signal(signal.SIGINT, signal_handler)  # Handle Ctrl+C
signal.signal(signal.SIGTERM, signal_handler)  # Handle termination signal


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)

from app import routes
