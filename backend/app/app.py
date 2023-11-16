from flask import Flask, jsonify, request
from flask_cors import cross_origin
import os
import requests
import time

app = Flask(__name__)

@app.route('/search_nearby_places', methods=['POST'])
@cross_origin()
def search_nearby_places():
    # Get location info using Google Maps API
    data = request.get_json()
    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        'location': data['location'],
        'radius'  : int(data['radius']),
        'keyword' : data['keywords'],
        'language': 'ja',
        'key': os.environ.get('GOOGLE_API_KEY')
    }
    results = []

    # Get all pages of search results'
    while True:
        response = requests.get(url, params=params)
        response.encoding = 'utf-8'
        data = response.json()
        results.extend(data['results'])
        if 'next_page_token' not in data:
            break
        params['pagetoken'] = data['next_page_token']
        # sleep enough time
        time.sleep(2)
    results.sort(key=lambda x: (x.get('user_ratings_total', 0), x.get('rating', 0)), reverse=True)
    return jsonify(results)


if __name__ == '__main__':
    app.run(debug=True)