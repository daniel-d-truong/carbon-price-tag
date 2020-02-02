from flask import Flask
from flask_cors import CORS
from db import firebase_db
from scrape import scrape
from carbon_price import carbon_price

app = Flask(__name__)
app.register_blueprint(firebase_db, url_prefix='/db')
app.register_blueprint(scrape, url_prefix='/scrape')
app.register_blueprint(carbon_price, url_prefix='/carbon-price')

CORS(app)

@app.route('/')
def hello_world():
    return 'Hello World!'


if __name__ == '__main__':
    app.run()
