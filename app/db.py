from flask import Blueprint, abort, request, jsonify
from firebase_admin import credentials, firestore, initialize_app
from carbon_price import calc_carbon_cost, co2s

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
        print(itm.to_dict())
        return jsonify(itm.to_dict()), 200

    except Exception as e:
        return "An Error Occured: {e}"

def get_item_by_id(item_id):
    try:
        itm = items.document(item_id).get()
        return itm.to_dict()
    except Exception as e:
        return "An Error Occured: {e}"


@firebase_db.route('/item', methods=['POST'])
def add_item():
    try:
        json_req = request.json
        item_data = {}
        if 'id' in json_req:
            if 'name' not in json_req:
                raise Exception('no name given')
            item_data['id'] = json_req['id']
            item_data['name'] = json_req['name']
            if 'ingredients' in json_req:
                item_data['ingredients'] = json_req['ingredients']
            else:
                item_data['ingredients'] = None
            if 'weight' in json_req:
                item_data['weight'] = json_req['weight']
            else:
                item_data['weight'] = None
            item_make(json_req['id'], json_req['name'], json_req['ingredients'], json_req['weight'])
            return jsonify({"success": True}), 200
        else:
            raise Exception('no item id given')

    except Exception as e:
        return "An Error Occured: {e}"


def item_make(item_id, name, ingredients=None, weight=None):
    """
    create item with specified params. otherwise modifies existing item
    adds to db
    :return:
    """
    new_item = {}
    new_item['id'] = item_id
    new_item['name'] = name
    new_item['ingredients'] = []
    new_item['weight'] = 0
    if ingredients:
        new_item['ingredients'] = ingredients
    if weight:
        new_item['weight'] = weight

    items.document(item_id).set(new_item)
    print(new_item)
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
        return "An Error Occured: {e}"

def get_user_by_id(user_id):
    try:
        usr = users.document(user_id).get()
        return usr.to_dict()
    except Exception as e:
        return "An Error Occured: {e}"


# @firebase_db.route('/user/<user_id>/update')
# def update_user(user_id):
#     try:
#         json_req = request.json
#         item_data = {}
#     except Exception as e:
#         return f"An Error Occured: {e}"


@firebase_db.route('/cart', methods=['POST'])
def cart_checkout():
    try:
        json_req = request.json
        if 'user_id' not in json_req:
            raise Exception('no user id given')
        if 'item_map' not in json_req:
            raise Exception('there is no item map')
        if update_user_footprint(json_req['user_id'], json_req['item_map']):
            amount = get_user_by_id(json_req['user_id'])['total_spending']
            return jsonify({"new_footprint": amount}), 200
        else:
            raise Exception('user footprint updating failed')
    except Exception as e:
        return "An Error Occured: {e}"


def update_user_footprint(user_id, item_map):
    # map of item ids corresponding to total weight of each
    # iterate thru list of ids, calculate for each one
    #
    try:
        user_info = get_user_by_id(user_id)

        new_footprint = user_info['total_spending']
        print (item_map)
        for item_key in item_map:
            # Every key in the key map
            item_info = get_item_by_id(item_key)

            # Grabs the first val (not sure if it should be second or not)
            footprint = calc_carbon_cost(item_info["name"], user_info['location'], item_info['weight'], item_info['ingredients'])[0]

            # total footprint is that footprint times the quantity of the item that was ordered
            total_footprint = footprint * item_map[item_key]
            new_footprint += total_footprint

        # update user footprint
        user_info['total_spending'] = new_footprint
        users.document(user_id).update(user_info)

        print(new_footprint)

        # idk what to return here.... we succeeded!
        return True
    except Exception as e:
        return "An error occurred: {e}"
