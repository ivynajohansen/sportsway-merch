import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from db import get_db

db = get_db()

class CompanyTarget(db.Model):
    __tablename__ = 'company_target'
    ID = db.Column(db.Integer, primary_key=True)
    CHANNEL = db.Column(db.String(20), unique=True, nullable=False)
    TOTAL_SALES = db.Column(db.Double, nullable=False)
    PROPORTION = db.Column(db.Float, nullable=False)

