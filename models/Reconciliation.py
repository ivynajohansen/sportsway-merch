import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from db import get_db

db = get_db()

class Reconciliation(db.Model):
    __tablename__ = 'consolidated_plan_2023'
    ID = db.Column(db.Integer, primary_key=True)
    CHANNEL = db.Column(db.String(20), unique=True, nullable=False)
    PERIOD = db.Column(db.TIMESTAMP, nullable=False)
    PROPORTION = db.Column(db.Float, nullable=False)
    MONTHLY_TARGET = db.Column(db.Double, nullable=False)

