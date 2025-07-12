from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)

    @app.route("/health")
    def health():
        return {"status": "ok"}

    return app

if __name__ == "__main__":
    create_app().run(host="0.0.0.0", port=8000)
