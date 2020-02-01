from flask import Blueprint, request, jsonify
import csv
import googlemaps
import globals

carbon_price = Blueprint('carbon_price', __name__)

MILE_EQUIV = 2.48 # equiv of 1kg CO2 in avg miles driven
FUEL_EFFIC = 22.3 # miles per gallon for typical car
GAS_PRICE = 3.0 # $ per gallon of gas
METERS_TO_MILES = 1609 # conversion rate from meters to miles

co2s = {} # dictionary of co2 emission in production of food items
co2s_in_miles = {} # converted to equivalent miles

gmaps = googlemaps.Client(globals.API_KEY)
# load_co2s()

def load_co2s():
    with open("../data/co2_equivs.csv", "r") as f:
        f = csv.reader(f, delimiter=',')
        next(f) # skip header
        for row in f:
            co2s[row[0]] = float(row[1])
            co2s_in_miles[row[0]] = co2s[row[0]] * MILE_EQUIV

def calc_shipping_distance(home_address):
    shopList = gmaps.places_nearby(location=home_address,
                                   keyword="whole foods",
                                   rank_by="distance")
    shopCoords = shopList["results"][0]["geometry"]["location"]
    matrix = gmaps.distance_matrix([home_address], [shopCoords], units="imperial")
    distance = matrix["rows"][0]["elements"][0]["distance"]["value"]/METERS_TO_MILES
    return distance

def calc_carbon_cost(item,home_address):
    production_miles = co2s_in_miles[item]
    transport_dist = calc_shipping_distance(home_address)
    cost = (production_miles + transport_dist)  / FUEL_EFFIC * GAS_PRICE
    # cost /= weight
    return cost

@carbon_price.route('/get-footprint', methods=['POST'])
def get_footprint():
    json_req = request.get_json()
    if 'address' in json_req:
        return jsonify(calc_carbon_cost("Beef",json_req['address']))
    else:
        return 'error exception here'

load_co2s()
