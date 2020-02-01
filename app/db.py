from flask import Blueprint, abort

firebase_db = Blueprint('firebase_db', __name__)


@firebase_db.route('/')
def test_db():
    return 'TESTING TESTNG'
