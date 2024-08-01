from flask import Flask, render_template
from config import Config


def create_app(config: Config):
    app = Flask(__name__)
    app.config.from_object(config)

    return app


app = create_app(Config)


@app.route('/', methods=['GET'])
def index():
    return render_template('home.html')


if __name__ == "__main__":
    app.run()
