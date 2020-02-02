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


def item_make(item_id, name, ingredients=None, item_weight=None,
              ship_weight=None):
    """
    create item with specified params. otherwise modifies existing item
    adds to db
    :return:
    """
    new_item = {}
    new_item['id'] = item_id
    new_item['name'] = name
    if ingredients:
        new_item['ingredients'] = ingredients
    if item_weight:
        new_item['item_weight'] = item_weight
    if ship_weight:
        new_item['ship_weight'] = ship_weight

    items.document(item_id).set(new_item)
    return jsonify({"success": True}), 200


@firebase_db.route('/test')
def test():
    item_make('IDHERE', 'test item', ingredients=['abc', 'wqer'],
              item_weight=42.01,
              ship_weight=45)
    return jsonify({"success": True}), 200


# user routes
@firebase_db.route('/user/<user_id>', methods=['GET'])
def get_user(user_id):
    try:
        usr = users.document(user_id).get()
        return jsonify(usr.to_dict()), 200

    except Exception as e:
        return f"An Error Occured: {e}"
