from flask import Flask, render_template
from app.config import Config

def page_not_found(e):
    return render_template('/layout/page_not_found.html', project_name="DocuMatcher"), 404

def create_app(config: Config):
    app = Flask(__name__)
    app.config.from_object(config)
    app.register_error_handler(404, page_not_found)
    return app

app = create_app(Config)

if __name__ == "__main__":
    app.run()

from app import routes