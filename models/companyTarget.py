import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from db import db

class CompanyTarget(db.Model):
    __tablename__ = 'company_target'
    id = db.Column(db.Integer, primary_key=True)
    channel = db.Column(db.String(20), unique=True, nullable=False)
    total_sales = db.Column(db.Double, nullable=False)
    proportion = db.Column(db.Float, nullable=False)

