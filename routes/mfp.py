from flask import Blueprint, render_template

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
    return render_template('layout.html')

@mfp_blueprint.route('/detailed-retail-planning')
def drp():
    return render_template('layout.html')


@mfp_blueprint.route('/reconciliation')
def reconciliation():
    return render_template('layout.html')


@mfp_blueprint.route('/adjust-mc-3')
def adjust_mc3():
    return render_template('layout.html')

@mfp_blueprint.route('/details-breakdown')
def dsp():
    return render_template('layout.html')

# BACKEND

@mfp_blueprint.route('/get-target', methods=['GET'])
def get_target():
    from controllers.TargetController import get_data
    return get_data()