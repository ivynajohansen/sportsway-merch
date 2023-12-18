import sys
from pathlib import Path

from sqlalchemy.exc import IntegrityError

from flask import jsonify

sys.path.append(str(Path(__file__).resolve().parents[1]))
from models.Details import Details

from db import get_db
db = get_db()

# get all data of Inflation Details
def get_data():
    try:
        data = Details.query.filter_by(ID=1).first() # details table only has 1 row
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
            return jsonify({'error': 'Not Found', 'message': 'No data found'})

    except IntegrityError as e:
        return jsonify({'error': 'IntegrityError', 'message': str(e)})

    except Exception as e:
        return jsonify({'error': 'Error', 'message': str(e)})

# update data of Inflation details based on json
def update_data(json_data):
    try:
        existing_data = Details.query.filter_by(ID=1).first() # details table only has 1 row
        if existing_data:
            existing_data.INFLATION = json_data['INFLATION']
            existing_data.TARGET_GROWTH_PERCENTAGE = json_data['TARGET_GROWTH_PERCENTAGE']
            existing_data.TARGET_GROWTH_VALUE = json_data['TARGET_GROWTH_VALUE']
            existing_data.FINAL_TARGET_GROWTH = json_data['FINAL_TARGET_GROWTH']
            
            db.session.commit()
            update_company_target()
            return jsonify({'message': 'Data updated successfully'})
        else:
            return jsonify({'error': 'Not Found', 'message': 'No data found'})
    except IntegrityError as e:
        return jsonify({'error': 'IntegrityError', 'message': str(e)})
    except Exception as e:
        return jsonify({'error': 'Error', 'message': str(e)})
    

# update company target based on Inflation details
def update_company_target():
    from models.CompanyTarget import CompanyTarget

    try:
        # Retrieve data from the CompanyTarget table
        company_targets = CompanyTarget.query.all()
        
        if not company_targets:
            return jsonify({'error': 'Not Found', 'message': 'No company targets found'})

        # Calculate new TOTAL_SALES based on proportion towards FINAL_TARGET_GROWTH
        details = Details.query.filter_by(ID=1).first()
        if not details:
            return jsonify({'error': 'Not Found', 'message': 'Details not found'})

        final_target_growth = details.FINAL_TARGET_GROWTH
        for target in company_targets:
            target_proportion = target.PROPORTION
            new_total_sales = (target_proportion / 100) * final_target_growth 
            target.TOTAL_SALES = new_total_sales

        # Update TOTAL_SALES in the CompanyTarget table
        db.session.commit()

        return jsonify({'message': 'Company target updated successfully'})
    
    except IntegrityError as e:
        return jsonify({'error': 'IntegrityError', 'message': str(e)})
    except Exception as e:
        return jsonify({'error': 'Error', 'message': str(e)})