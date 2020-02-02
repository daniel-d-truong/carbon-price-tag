from flask import Blueprint, request, jsonify
import db
import csv
import googlemaps
import globals

carbon_price = Blueprint('carbon_price', __name__)

MILE_EQUIV = 2.48  # equiv of 1kg CO2 in avg miles driven
FUEL_EFFIC = 22.3  # miles per gallon for typical car
GAS_PRICE = 3.0  # $ per gallon of gas
METERS_TO_MILES = 1609  # conversion rate from meters to miles

co2s = {}  # dictionary of co2 emission in production of food items
co2s_in_miles = {}  # converted to equivalent miles

gmaps = googlemaps.Client(globals.API_KEY)

def load_co2s():
    with open("../data/co2_equivs.csv", "r") as f:
        f = csv.reader(f, delimiter=',')
        next(f)  # skip header
        for row in f:
            co2s[row[0]] = float(row[1])
            co2s_in_miles[row[0]] = co2s[row[0]] * MILE_EQUIV


def calc_shipping_distance(home_address):
    addressCoords = gmaps.geocode(home_address)[0]["geometry"]["location"]
    shopList = gmaps.places_nearby(location=addressCoords,
                                keyword="whole foods",
                                rank_by="distance")
    shopCoords = shopList["results"][0]["geometry"]["location"]
    matrix = gmaps.distance_matrix([addressCoords], [shopCoords], units="imperial")
    distance = matrix["rows"][0]["elements"][0]["distance"]["value"]/METERS_TO_MILES
    return distance


def calc_ingredients_cost(ingredients):
    total = 0
    for item in ingredients:
        if (item in co2s_in_miles):
            total += co2s_in_miles[item]
    return total


def calc_carbon_cost(item, home_address, weight, ingredients):
    production_miles = calc_ingredients_cost(ingredients)
    if item in co2s_in_miles:
        production_miles += co2s_in_miles[item]
    print("miles: " + str(production_miles))
    transport_dist = calc_shipping_distance(home_address)
    cost = (production_miles + transport_dist)  / FUEL_EFFIC * GAS_PRICE
    kgOfCo2 = (production_miles + transport_dist) / MILE_EQUIV
    if weight != 0: cost /= weight
    return cost,kgOfCo2

# Params expected: name, ingredients, weight, address
@carbon_price.route('/get-footprint', methods=['POST'])
def get_footprint():
    json_req = request.json
    if 'name' in json_req and 'ingredients' in json_req and 'weight' in json_req and 'carbon_location' in json_req and 'id' in json_req:
        itemList = json_req['name'].split()
        
        for item in itemList:
            if item not in co2s:
                print("Not here: " + str(item))
                continue
            cost, kgOfCo2 = calc_carbon_cost(item, json_req['carbon_location'], json_req['weight'], json_req['ingredients'])
            db.item_make(json_req['id'], item, ingredients = json_req['ingredients'], weight = json_req['weight'])
            return jsonify({
                "total_carbon_cost": cost,
                'kg_of_co2': kgOfCo2
            })
        
        cost, kgOfCo2 = calc_carbon_cost(item, json_req['carbon_location'], json_req['weight'], json_req['ingredients'])
        if cost != 0:   
            db.item_make(json_req['id'], item, ingredients = json_req['ingredients'], weight = json_req['weight'])
            return jsonify({
                "total_carbon_cost": cost,
                'kg_of_co2': kgOfCo2
            })
    else:
        return 'error exception here'

    return jsonify({
        "log": "This item matched none of the foods in our current data set."
    })


load_co2s()
