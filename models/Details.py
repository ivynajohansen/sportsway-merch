import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from db import get_db

db = get_db()

class Details(db.Model):
    __tablename__ = 'details'
    ID = db.Column(db.Integer, primary_key=True)
    INFLATION = db.Column(db.Float, nullable=False)
    TARGET_GROWTH_PERCENTAGE = db.Column(db.Float, nullable=False)
    TARGET_GROWTH_VALUE = db.Column(db.Double, nullable=False)
    FINAL_TARGET_GROWTH = db.Column(db.Double, nullable=False)
    PREV_YEAR = db.Column(db.Double, nullable=False)
    

