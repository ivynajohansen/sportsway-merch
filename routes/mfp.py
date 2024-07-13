from flask import Blueprint, render_template, request, jsonify

mfp_blueprint = Blueprint('mfp', __name__)

# pages of mfp

@mfp_blueprint.route('/layout', methods=['GET'])
def layout():
    return render_template('layout.html')

@mfp_blueprint.route('/company-target', methods=['GET'])
def company_target():
    return render_template('mfp/company-target.html')

@mfp_blueprint.route('/rs-monthly-breakdown')
def rs_monthly():
    return render_template('mfp/rs-monthly.html')

@mfp_blueprint.route('/detailed-retail-planning')
def drp():
    return render_template('mfp/detailed-retail-planning.html')


@mfp_blueprint.route('/reconciliation')
def reconciliation():
    return render_template('mfp/reconciliation.html')


@mfp_blueprint.route('/adjust-mc-3')
def adjust_mc3():
    from controllers.McLv3Controller import display_page
    return display_page()
    # return render_template('mfp/mc-lv3-planning.html')

@mfp_blueprint.route('/detailed-sales-plan')
def detailed_sales_plan():
    return render_template('mfp/details-breakdown.html')

# BACKEND

@mfp_blueprint.route('/get-company-target', methods=['GET'])
def get_target():
    from controllers.TargetController import get_data
    return get_data()
@mfp_blueprint.route('/update-company-target', methods=['PUT'])
def handle_update_company_target():
    try:
        from controllers.TargetController import update_data
        json_data = request.get_json()
        return update_data(json_data)

    except Exception as e:
        return jsonify({'error': 'Error', 'message': str(e)})

@mfp_blueprint.route('/get-details', methods=['GET'])
def get_details():
    from controllers.DetailsController import get_data
    return get_data()
@mfp_blueprint.route('/update-details', methods=['PUT'])
def handle_update_details():
    try:
        from controllers.DetailsController import update_data
        json_data = request.get_json()
        return update_data(json_data)

    except Exception as e:
        return jsonify({'error': 'Error', 'message': str(e)})


@mfp_blueprint.route('/get-rs-monthly', methods=['GET'])
def get_rs_monthly():
    from controllers.RsMonthlyController import get_data
    return get_data()
@mfp_blueprint.route('/update-rs-monthly', methods=['PUT'])
def handle_update_rs_monthly():
    try:
        from controllers.RsMonthlyController import update_data
        json_data = request.get_json()
        return update_data(json_data)

    except Exception as e:
        return jsonify({'error': 'Error', 'message': str(e)})


@mfp_blueprint.route('/get-retail-planning', methods=['GET'])
def get_retail_planning():
    from controllers.DetailedRetailPlanningController import get_data
    return get_data()
@mfp_blueprint.route('/update-retail-planning', methods=['PUT'])
def handle_update_retail_planning():
    try:
        from controllers.DetailedRetailPlanningController import update_data
        json_data = request.get_json()
        return update_data(json_data)

    except Exception as e:
        return jsonify({'error': 'Error', 'message': str(e)})

@mfp_blueprint.route('/get-reconciliation', methods=['GET'])
def get_reconciliation():
    from controllers.ReconciliationController import get_data
    return get_data()
@mfp_blueprint.route('/update-reconciliation', methods=['PUT'])
def handle_update_reconciliation():
    try:
        from controllers.ReconciliationController import update_data
        json_data = request.get_json()
        return update_data(json_data)

    except Exception as e:
        return jsonify({'error': 'Error', 'message': str(e)})


# @mfp_blueprint.route('/get-details-breakdown', methods=['GET'])
# def get_details_breakdown():
#     from controllers.DetailsBreakdownController import get_data
#     return get_data()


