from flask import Blueprint, request
import bs4 as bs


scrape = Blueprint('scrape', __name__)


@scrape.route('/test-post', methods=['POST'])
def test_post():
    json_req = request.get_json()
    if 'url' in json_req:
        return 'bs4 here'
    else:
        return 'error exception here'

