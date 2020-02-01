from flask import Blueprint, abort, request, jsonify
from firebase_admin import credentials, firestore, initialize_app

firebase_db = Blueprint('firebase_db', __name__)

# init Firestore DB
cred = credentials.Certificate('./creds/cpt-key.json')
default_app = initialize_app(cred)
db = firestore.client()

items = db.collection('items')
users = db.collection('users')


@firebase_db.route('/')
def test_db():
    return 'TESTING TESTNG'


# item routes
@firebase_db.route('/item/<item_id>', methods=['GET'])
def get_item(item_id):
    try:
        itm = items.document(item_id).get()
        return jsonify(itm.to_dict()), 200

    except Exception as e:
        return f"An Error Occured: {e}"


@firebase_db.route('/item', methods=['POST'])
def add_item():
    try:
        json_req = request.json
        item_data = {}
        if 'id' in json_req:
            item_id = json_req['id']
            item_data['id'] = item_id
            if 'price' in json_req:
                item_data['price'] = json_req['price']
            else:
                raise Exception('no price given')
            items.document(item_id).set(item_data)
            return jsonify({"success": True}), 200
        else:
            raise Exception('no item id given')

    except Exception as e:
        return f"An Error Occured: {e}"

# user routes
@firebase_db.route('/user/<user_id>', methods=['GET'])
def get_user(user_id):
    try:
        usr = users.document(user_id).get()
        return jsonify(usr.to_dict()), 200

    except Exception as e:
        return f"An Error Occured: {e}"
