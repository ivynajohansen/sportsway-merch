import sys
from pathlib import Path

from flask import Flask
from flask_migrate import Migrate
from dotenv import load_dotenv

sys.path.append(str(Path(__file__).resolve().parents[1]))
load_dotenv(Path(__file__).resolve().parents[1] / '.env')

# from app import app
from db import app, db
migrate = Migrate(app, db)

from models.user import User

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
