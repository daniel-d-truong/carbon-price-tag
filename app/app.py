from flask import Flask
from db import firebase_db
from scrape import scrape


app = Flask(__name__)
app.register_blueprint(firebase_db, url_prefix='/db')
app.register_blueprint(scrape, url_prefix='/scrape')

@app.route('/')
def hello_world():
    return 'Hello World!'


if __name__ == '__main__':
    app.run()
