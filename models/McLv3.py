import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from db import get_db

db = get_db()

class RsMonthly(db.Model):
    __tablename__ = 'mc_lv3_planning'
    ID = db.Column(db.Integer, primary_key=True)
    MGH_3 = db.Column(db.String(20), unique=True, nullable=False)
    PERIOD = db.Column(db.TIMESTAMP, nullable=False)
    PROPORTION = db.Column(db.Float, nullable=False)
    TOTAL_SALES_2023 = db.Column(db.Double, nullable=False)
    FORECASTED_SALES_2023 = db.Column(db.Double, nullable=False)
    
