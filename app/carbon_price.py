from flask import Blueprint, request

carbon_price = Blueprint('carbon_price', __name__)

@carbon_price.route('/get-footprint', methods=['POST'])
def get_footprint():
    json_req = request.get_json()
    if 'address' in json_req:
        pass
    else:
        return 'error exception here'
