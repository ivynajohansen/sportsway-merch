import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from db import get_db

db = get_db()

class RsMonthly(db.Model):
    __tablename__ = 'r_s_monthly_2023'
    ID = db.Column(db.Integer, primary_key=True)
    CHANNEL = db.Column(db.String(20), unique=True, nullable=False)
    PERIOD = db.Column(db.TIMESTAMP, nullable=False)
    TOTAL_SALES = db.Column(db.Double, nullable=False)
    PROPORTION = db.Column(db.Float, nullable=False)

