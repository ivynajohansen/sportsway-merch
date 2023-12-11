import sys
from pathlib import Path
import random

from faker import Faker
from sqlalchemy.exc import IntegrityError
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash
import pandas as pd
from datetime import datetime

sys.path.append(str(Path(__file__).resolve().parents[1]))
load_dotenv(Path(__file__).resolve().parents[1] / '.env')

from db import get_db, app
from sqlalchemy.exc import IntegrityError

fake = Faker()
db = get_db()

# seed users with random USERNAME
# PASSWORD follows USERNAME
# role is random: admin, superadmin, or staff
def seed_users(num_users):
    from models.User import User
    ROLES = ['admin', 'superadmin', 'staff']
    for _ in range(num_users):
        name = fake.user_name()
        role = random.choice(ROLES)
        user = User(
            USERNAME=name,
            PASSWORD=generate_password_hash(name),
            ROLE=role,
        )
        db.session.add(user)
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()

# seed inflation details
def seed_details():
    from models.Details import Details
    data = [
        {'INFLATION': 2.0, 'TARGET_GROWTH_PERCENTAGE': 6.0, 'TARGET_GROWTH_VALUE': 80136136740.0, 'FINAL_TARGET_GROWTH':80136136740.0, 'PREV_YEAR': 75600129000.0},
    ]
    for entry in data:
        details = Details(
            INFLATION=entry['INFLATION'],
            TARGET_GROWTH_PERCENTAGE=entry['TARGET_GROWTH_PERCENTAGE'],
            TARGET_GROWTH_VALUE=entry['TARGET_GROWTH_VALUE'],
            FINAL_TARGET_GROWTH=entry['FINAL_TARGET_GROWTH'],
            PREV_YEAR=entry['PREV_YEAR']
        )

        db.session.add(details)

        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()

# seed company target with specified data
def seed_company_target():
    from models.CompanyTarget import CompanyTarget
    data = [
        {'CHANNEL': 'WHOLESALE', 'PROPORTION': 20.03, 'TOTAL_SALES': 16051268189.022001},
        {'CHANNEL': 'RETAIL', 'PROPORTION': 66.08, 'TOTAL_SALES': 52953959157.792},
        {'CHANNEL': 'E-COMMERCE', 'PROPORTION': 13.89, 'TOTAL_SALES': 11130909393.186}
    ]
    for entry in data:
        target = CompanyTarget(
            CHANNEL=entry['CHANNEL'],
            TOTAL_SALES=entry['TOTAL_SALES'],
            PROPORTION=entry['PROPORTION']
        )

        db.session.add(target)

        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()

# Function to seed Mc Lv3 Planning table with local CSV data
def seed_mc_lv3_planning(csv_file_path):
    from models.McLv3 import McLv3
    data = pd.read_csv(csv_file_path)

    column_mapping = {
        'MGH_3': 'MGH_3',
        'PERIOD': 'PERIOD',
        'PROPORTION': 'PROPORTION',
        'TOTAL_SALES_2023': 'TOTAL_SALES_2023',
        'FORECASTED_SALES_2023': 'FORECASTED_SALES_2023',
    }

    data = pd.read_csv(csv_file_path)
    data['PERIOD'] = pd.to_datetime(data['PERIOD'])

    for _, entry in data.iterrows():
        entry['PERIOD'] = entry['PERIOD'].to_pydatetime()
        # Use a dictionary comprehension to include only keys present in column_mapping
        item = McLv3(**{column: entry[key] for key, column in column_mapping.items()})
        db.session.add(item)

        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()

# run this specific file to seed all tables. Comment some lines if not needed.
if __name__ == '__main__':
    with app.app_context():
        seed_users(3)
        seed_company_target()
        seed_details()
        seed_mc_lv3_planning('static/bigquery_data/mc_lv3_planning.csv')
