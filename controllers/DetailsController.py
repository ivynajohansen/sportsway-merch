import sys
from pathlib import Path

from sqlalchemy.exc import IntegrityError

from flask import jsonify

sys.path.append(str(Path(__file__).resolve().parents[1]))

# get all data of Inflation Details
def get_data():
    from models.Details import Details
    try:
        data = Details.query.filter_by(ID=1).first()
        if data:
            serialized_data = {
                'INFLATION': data.INFLATION,
                'TARGET_GROWTH_PERCENTAGE': data.TARGET_GROWTH_PERCENTAGE,
                'TARGET_GROWTH_VALUE': data.TARGET_GROWTH_VALUE,
                'FINAL_TARGET_GROWTH': data.FINAL_TARGET_GROWTH,
                'PREV_YEAR': data.PREV_YEAR,
            }
            return jsonify(serialized_data)
        else:
            return jsonify({'error': 'Not Found', 'message': 'No data found for ID=1'})

    except IntegrityError as e:
        return jsonify({'error': 'IntegrityError', 'message': str(e)})

    except Exception as e:
        return jsonify({'error': 'Error', 'message': str(e)})