import sys
from pathlib import Path

from sqlalchemy.exc import IntegrityError

from flask import jsonify

sys.path.append(str(Path(__file__).resolve().parents[1]))
from models.RsMonthly import RsMonthly

# display all data of Company Target
def get_data():
    try:
        data = RsMonthly.query.all()
        sorted_data = sorted(data, key=lambda x: x.PERIOD)

        serialized_data = []
        for item in sorted_data:
            serialized_data.append({
                'ID': item.ID,
                'CHANNEL': item.CHANNEL,
                'PERIOD': item.PERIOD,
                'TOTAL_SALES': item.TOTAL_SALES,
                'PROPORTION': item.PROPORTION,
            })
        return jsonify(serialized_data)

    except IntegrityError as e:
        return jsonify({'error': 'IntegrityError', 'message': str(e)})

    except Exception as e:
        return jsonify({'error': 'Error', 'message': str(e)})
    

def update_data(json_data):
    from datetime import datetime
    from db import get_db
    db = get_db()
    try:
        for entry in json_data:
            channel = entry.get('CHANNEL')
            period_str = entry.get('PERIOD')
            proportion = entry.get('PROPORTION')
            total_sales = entry.get('TOTAL_SALES')

            period = datetime.strptime(period_str, "%a, %d %b %Y %H:%M:%S %Z")

            # Use the update method to update specific columns
            db.session.query(RsMonthly).filter_by(CHANNEL=channel, PERIOD=period).\
                update({'PROPORTION': proportion, 'TOTAL_SALES': total_sales})

        # Commit the changes to the database
        db.session.commit()

        return jsonify({'message': 'Data updated successfully'})

    except IntegrityError as e:
        return jsonify({'error': 'IntegrityError', 'message': str(e)})

    except Exception as e:
        return jsonify({'error': 'Error', 'message': str(e)})