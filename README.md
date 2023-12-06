# RUN THIS
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# For MIGRATING TABLES
python database/migrate.py db init
python database/migrate.py db migrate
python database/migrate.py db upgrade

# FOR SEEDING TABLES
# SEEDING: PASSWORD = USERNAME
python database/seeder.py