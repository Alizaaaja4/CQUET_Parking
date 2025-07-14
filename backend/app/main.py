from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from app.config import Config
from app.db.models import db
from app.api.endpoints import payment, slot, user
from prometheus_flask_exporter import PrometheusMetrics
from prometheus_client import make_wsgi_app, Counter, Gauge, Histogram

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize extensions
    CORS(app)
    db.init_app(app)
    migrate = Migrate(app, db)
    jwt = JWTManager(app)

    metrics = PrometheusMetrics(app)
    metrics.info('parking_app_info', 'Parking Application Info', version='1.0.0')

    # Counter: metrik yang hanya bisa bertambah (misalnya, jumlah request)
    REQUESTS_TOTAL = Counter(
        'http_requests_total', 'Total HTTP Requests',
        ['method', 'endpoint']
    )

    # Gauge: metrik yang bisa naik turun (misalnya, jumlah pengguna aktif, suhu)
    IN_PROGRESS_REQUESTS = Gauge(
        'http_requests_in_progress', 'Number of in progress HTTP requests'
    )

    # Histogram: metrik untuk melacak distribusi durasi (misalnya, waktu respons)
    REQUEST_LATENCY_SECONDS = Histogram(
        'http_request_duration_seconds', 'HTTP Request Latency',
        ['method', 'endpoint']
    )

    # Register blueprints
    app.register_blueprint(payment.bp, url_prefix='/api/payments')
    app.register_blueprint(slot.bp, url_prefix='/api/slots')
    app.register_blueprint(user.bp, url_prefix='/api/users')
    
    @app.route("/health")
    def health():
        return {"status": "ok"}
    
    @app.route("/api/health")
    def api_health():
        return {"status": "ok", "service": "parking-api"}
    
    
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=8000, debug=True)