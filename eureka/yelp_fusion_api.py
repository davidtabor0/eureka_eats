import requests
import json
import os
from mongoDB_restaurant import store_in_restaurant_db
from mongoDB_restaurant import drop_collection
from dotenv import load_dotenv, dotenv_values

def create_database_with_yelp_api():
    
    load_dotenv()
    conn_str = os.getenv('CONN_STR')
    # API_KEY - Use as a key reference to gain access to the YELP FUSION API services
    # ENDPOINT - where YELP FUSION API will collect calls from users
    # HEADER - send additional information to the user
    # getting API key from a .env file. !!!git.ignore will ignore this file!!!
    API_KEY = os.getenv('YELP_API_KEY')
    ENDPOINT = 'https://api.yelp.com/v3/businesses/search'
    HEADERS = {'Authorization': 'bearer %s' % API_KEY}

    # delete existing collection of the same name before adding in the new database
    drop_collection(conn_str)

    # YELP FUSION API has a limit of 50 searches per call so use keyword OFFSET to get additional non duplicate searches 
    # iterate through 
    for offset_val in range(0,950,50):    
        # define the parameters
        PAREMETERS = {
                    'term' : 'restaurant',
                    'limit' : 50,
                    'offset': offset_val, 
                    'radius': 10000,
                    'location': 'Los Angeles'
                    }

        # make a request to the yelp api
        response = requests.get(url = ENDPOINT,
                                params = PAREMETERS,
                                headers = HEADERS)

        # anything other than Response[200] is an error
        print(response)
        # store the JSON file of the request
        restaurant_data = response.json()['businesses']

        # used to store type of cuisine/type
        type = []
        
        # iterate over JSON file containing a set of restaurant data
        for i in range (len(restaurant_data)):
            id = restaurant_data[i]['id']
            name = restaurant_data[i]['name']
            image_url = restaurant_data[i]['image_url']
            is_closed = restaurant_data[i]['is_closed']
            ## review_count = restaurant_data[0]['review_count']  // review count should be zero but can pull outside reviews
            review_count = 0
            # not all restaurants have a price information
            try:
                price = restaurant_data[i]['price']
            except:
                price = ''
            rating = restaurant_data[i]['rating']
            longitude = restaurant_data[i]['coordinates']['longitude']
            latitude = restaurant_data[i]['coordinates']['latitude']
            street = restaurant_data[i]['location']['address1']
            apt = restaurant_data[i]['location']['address2']
            city = restaurant_data[i]['location']['city']
            zip_code = restaurant_data[i]['location']['zip_code']
            country = restaurant_data[i]['location']['country']
            state = restaurant_data[i]['location']['state']
            phone_number = restaurant_data[i]['display_phone']
            # store cuisine/type to list-type  
            if len(restaurant_data[i]['categories']) > 1:
                for j in range(len(restaurant_data[i]['categories']) ):
                    type.append(restaurant_data[i]['categories'][j]['title'])
            else:
                type.append(restaurant_data[i]['categories'][0]['title'])
            
            store_in_restaurant_db(conn_str, id, name, image_url, is_closed, review_count, price, type, rating, longitude, latitude, street, apt, city, zip_code, country, state, phone_number)
            type = []








