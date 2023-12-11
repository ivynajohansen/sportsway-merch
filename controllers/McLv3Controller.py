import sys
from pathlib import Path

from sqlalchemy.exc import IntegrityError

from flask import jsonify
from flask import render_template

sys.path.append(str(Path(__file__).resolve().parents[1]))

# display all data of Company Target
def display_page():
    from models.McLv3 import McLv3
    from itertools import groupby
    from datetime import datetime

    try:
        data = McLv3.query.all()

        # Sort the data by 'PERIOD' and 'MGH_3' to ensure proper grouping
        sorted_data = sorted(data, key=lambda x: (x.PERIOD, x.MGH_3))

        # Group the data by 'PERIOD'
        grouped_data = {key: list(group) for key, group in groupby(sorted_data, key=lambda x: x.PERIOD)}

        # Extract unique MGH_3 values
        mgh_3_values = sorted(set(item.MGH_3 for item in data))

        # Organize the data into a dictionary with the desired structure
        organized_data = {}
        totals = {}
        for period, period_data in grouped_data.items():
            formatted_month = datetime.strftime(period, "%B")

            organized_data[formatted_month] = {}
            totals[formatted_month] = {'%': 0, 'Value': 0, 'Forecast': 0}
            for mgh_3_value in mgh_3_values:
                mgh_3_data = [item for item in period_data if item.MGH_3 == mgh_3_value]

                organized_data[formatted_month][mgh_3_value] = {
                    'Value': mgh_3_data[0].TOTAL_SALES_2023,
                    '%': mgh_3_data[0].PROPORTION,
                    'Forecast': mgh_3_data[0].FORECASTED_SALES_2023
                }

                totals[formatted_month]['%'] += mgh_3_data[0].PROPORTION
                totals[formatted_month]['Value'] += mgh_3_data[0].TOTAL_SALES_2023
                totals[formatted_month]['Forecast'] += mgh_3_data[0].FORECASTED_SALES_2023

        return render_template('mfp/mc-lv3-planning.html', organized_data=organized_data, mgh_3_values=mgh_3_values, totals=totals)

    except IntegrityError as e:
        return jsonify({'error': 'IntegrityError', 'message': str(e)})

    except Exception as e:
        return jsonify({'error': 'Error', 'message': str(e)})