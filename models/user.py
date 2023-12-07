import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from db import get_db

db = get_db()

class User(db.Model):
    __tablename__ = 'users'
    ID = db.Column(db.Integer, primary_key=True)
    USERNAME = db.Column(db.String(20), unique=True, nullable=False)
    PASSWORD = db.Column(db.String(500), nullable=False)
    ROLE = db.Column(db.String(20) , nullable=False)
    CREATED_AT = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp())
    UPDATED_AT = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp(), server_onupdate=db.func.current_timestamp())

