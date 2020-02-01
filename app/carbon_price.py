from flask import Blueprint, request
import csv

MILE_EQUIV = 2.48 # equiv of 1kg CO2 in avg miles driven
FUEL_EFFIC = 22.3 # miles per gallon for typical car
GAS_PRICE = 3.0 # $ per gallon of gas

co2s = {} # dictionary of co2 emission in production of food items
co2s_in_miles = {} # converted to equivalent miles

def load_co2s():
with open("./data/co2_equivs.csv", "r") as f:
  f = csv.reader(f, delimiter=',')
  next(f) # skip header
  for row in f:
    co2s[row[0]] = float(row[1])
    co2s_in_miles[row[0]] = co2s[row[0]] * MILE_EQUIV

def calc_carbon_cost(item):
  production_miles = co2s_in_miles[item]
  transport_dist = 10.0;
  cost = (production_miles + transport_dist)  / FUEL_EFFIC * GAS_PRICE
  # cost /= weight
  return cost

def get_footprint():
  json_req = request.get_json()
  if 'address' in json_req:
    pass
  else:
    return 'error exception here'

@carbon_price.route('/get-footprint', methods=['POST'])
  load_co2s()
  print(calc_carbon_cost("Beef"))