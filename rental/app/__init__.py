# app/__init__.py

from flask import Flask
from flask_cors import CORS
import logging

from app.extensions import db, migrate, jwt
from app.routes import register_routes

def create_app():
    app = Flask(__name__)

    # Завантаження конфігурації
    app.config.from_object('config.Config')

    # Налаштування логування
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    logger.info("Starting Flask application")

    # Ініціалізація розширень
    CORS(app)
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # Імпорт моделей після ініціалізації db, щоб уникнути циклічних імпортів
    with app.app_context():
        from app import models

    # Реєстрація маршрутів
    register_routes(app)

    # Маршрут для головної сторінки
    @app.route('/', methods=['GET'])
    def home():
        return {"message": "Welcome to RentalSystem API"}, 200

    return app
