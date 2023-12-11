import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

def get_detailed_sales_plan_classes():
    from db import get_db
    db = get_db()

    class DetailedSalesPlanWholesale(db.Model):
        __tablename__ = 'final_detailed_wholesale_sales_plan'
        ID = db.Column(db.Integer, primary_key=True)
        CHANNEL = db.Column(db.String(20), nullable=False)
        SITE = db.Column(db.String(20), nullable=False)
        PERIOD = db.Column(db.TIMESTAMP, nullable=False)
        MONTHLY_TARGET = db.Column(db.Double, nullable=False)
        MGH_3 = db.Column(db.String(20), nullable=False)
        MGH_CH_PROP = db.Column(db.Float, nullable=False)
        SLS_PER_MC = db.Column(db.Double, nullable=False)
        

    class DetailedSalesPlanRetail(db.Model):
        __tablename__ = 'final_detailed_retail_sales_plan'
        ID = db.Column(db.Integer, primary_key=True)
        GROUP = db.Column(db.String(20), nullable=False)
        SITE = db.Column(db.String(20), nullable=False)
        PERIOD = db.Column(db.TIMESTAMP, nullable=False)
        MONTHLY_TARGET = db.Column(db.Double, nullable=False)
        MGH_3 = db.Column(db.String(20), nullable=False)
        MGH_CH_PROP = db.Column(db.Float, nullable=False)
        SLS_PER_MC = db.Column(db.Double, nullable=False)


    class DetailedSalesPlanEcommerce(db.Model):
        __tablename__ = 'final_detailed_ecommerce_sales_plan'
        ID = db.Column(db.Integer, primary_key=True)
        CHANNEL = db.Column(db.String(20), nullable=False)
        SITE = db.Column(db.String(20), nullable=False)
        PERIOD = db.Column(db.TIMESTAMP, nullable=False)
        MONTHLY_TARGET = db.Column(db.Double, nullable=False)
        MGH_3 = db.Column(db.String(20), nullable=False)
        MGH_CH_PROP = db.Column(db.Float, nullable=False)
        SLS_PER_MC = db.Column(db.Double, nullable=False)

    return DetailedSalesPlanWholesale, DetailedSalesPlanRetail, DetailedSalesPlanEcommerce
