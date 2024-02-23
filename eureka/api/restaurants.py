"""
    @file restaurants.py\n
    Contains a Flask blueprint to handle EurekaEats API calls from the React frontend.
    @note See SDD 5.6 for the EurekaEats message format.
    @author Derek Tan
"""

from re import compile, IGNORECASE
from bson import regex
from flask import Blueprint, make_response, request

from eureka.api.appcodes import *
from eureka.utils.types import *
from eureka.utils.service import DB_SERVICE

EE_RESTAURANT_SEARCH_LIMIT = 25

#### HELPER FUNCTIONS ####

def restaurant_api_search(args: dict = None):
    # Validate args as {'keyword': '...', 'price': '...', 'count': '...'}
    if not args:
        return (EE_PAYLOAD_NULL, None)
    
    keyword_arg = args.get('keyword')
    type_arg = args.get('type')
    price_arg = args.get('price')
    count_arg = args.get('count')
    db_aggregation = []
    search_results = []

    # Do not do a search with no criteria instead of loading all database entries... this would likely lag the client UI rendering!
    if not keyword_arg and not type_arg and not price_arg and not count_arg:
        return (EE_PAYLOAD_NULL, None)
    
    # Prepare aggregation based on present keyword and/or price level
    if keyword_arg:
        db_aggregation.append({
            '$match': {
                'name': {'$regex': regex.Regex.from_native(compile(keyword_arg, IGNORECASE))}
            }
        })

    if type_arg:
        db_aggregation.append({
            '$match': {'type': type_arg}
        })

    if price_arg:
        db_aggregation.append({'$match': {'price': price_arg}});

    # Do not fetch too many restaurant entries, as getting very large queries can slow the site.
    if count_arg:
        if count_arg > EE_RESTAURANT_SEARCH_LIMIT:
            count_arg = EE_RESTAURANT_SEARCH_LIMIT

        db_aggregation.append({'$limit': count_arg})

    db_aggregation.append({
        '$project': {
            '_id': 0,
            'id': '$id',
            'name': '$name',
            'address1': '$address1',
            'city': '$city',
            'state': '$state',
            'is_closed': '$is_closed',
            'price': '$price',
            'image_url': '$image_url'
        }
    })

    # Run aggregate command for multi-stage search...
    restaurants_ref = DB_SERVICE.get_collection('restaurants')

    results_cursor = restaurants_ref.aggregate(db_aggregation, session=None)

    for result in results_cursor:
        search_results.append(result)

    return (EE_PAYLOAD_OBJECT, {'results': search_results})

def restaurant_api_lookup(args = None):
    # Validate args as {'id': '...'}
    if not args:
        return (EE_PAYLOAD_NULL, None)
    
    restaurant_id_arg = args.get('id')
    result_data = None

    if not restaurant_id_arg:
        return (EE_PAYLOAD_NULL, None)

    restaurants_ref = DB_SERVICE.get_collection('restaurants')

    # NOTE since all restaurants have pre-generated unique IDs, fetchOne is the best PyMongo method for this purpose.
    result_cursor = restaurants_ref.aggregate([
        {
            '$match': {'id': restaurant_id_arg}
        },
        {
            '$project': {
                '_id': 0,
                'id': '$id',
                'name': '$name',
                'address1': '$address1',
                'city': '$city',
                'state': '$state',
                'location': '$location',
                'is_closed': '$is_closed',
                'price': '$price',
                'rating': '$rating',
                'type': '$type',
                'image_url': '$image_url'
            }
        }
    ], session=None)

    for result in result_cursor:
        result_data = result
        break

    return (EE_PAYLOAD_OBJECT, {'result': result_data})

def restaurant_api_suggest_types(args = None):
    # NOTE Validate `args` to have a small fragment string... This will be checked against location types in `eureka.utils.types.EE_TYPES`.
    if not args:
        return (EE_PAYLOAD_NULL, None)

    fragment_arg = args.get('fragment')

    if not fragment_arg:
        return (EE_PAYLOAD_NULL, None)

    suggestions = []

    for type_word in EE_TYPES:
        # NOTE the user's word must match to the location type, and not vice versa. The user's word may be a different size than the location type...
        if type_word.find(fragment_arg) != -1:
            suggestions.append(type_word)

    return (EE_PAYLOAD_OBJECT, {'suggestions': suggestions})

def restaurant_api_do(appcode: int = EE_TEST_DUMMY_CALL, args: dict = None):
    """
        This helper function will do dispatching to restaurant action helper functions. See Section 5.6 of SDD for details.\n
        Takes an int action code and a container of arguments if needed.
    """

    pre_result = None

    if appcode == EE_SEARCH_RESTAURANT:
        pre_result = restaurant_api_search(args)
    elif appcode == EE_LOOKUP_RESTAURANT:
        pre_result = restaurant_api_lookup(args)
    elif appcode == EE_SUGGEST_TYPES:
        pre_result = restaurant_api_suggest_types(args)
    else:
        pre_result = (EE_PAYLOAD_BOOLEAN, False)

    pre_payload_code, pre_data = pre_result

    return {'payload': pre_payload_code, 'data': pre_data}

restaurant_api_router = Blueprint('restaurant_api', __name__)

@restaurant_api_router.route('/api/restaurants/action', methods=['OPTIONS', 'GET', 'POST'])
def handle_restaurant_action():
    """
        This is a function to return JSON results from a defined restaurant action call for EurekaEats. This dispatches the action call by its action code before forwarding the arguments to a helper.
    """
    json_request = None
    json_reply = None
    api_call_method = request.method
    
    if request.is_json:
        json_request = request.get_json()

    if api_call_method == 'GET' or api_call_method == 'POST':
        json_reply = make_response(restaurant_api_do(json_request.get('action'), json_request.get('args')), 200)
        json_reply.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000') # NOTE: Permits the frontend app at this spot to request the API for development only. Should fix CORS errors?
        json_reply.headers.add('Access-Control-Allow-Methods', 'GET, POST') # NOTE: Allows GET requests from React AJAX for now.
        json_reply.headers.add('Access-Control-Allow-Headers', 'Accept, Content-Type') # NOTE: Allows these headers from React frontend to satisfy CORS checks.
        json_reply.content_type = 'application/json' # Tell the client we're sending JSON.
    else:
        json_reply = make_response('Looks good!', 200)
        json_reply.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        json_reply.headers.add('Access-Control-Allow-Methods', 'POST')
        json_reply.headers.add('Access-Control-Allow-Headers', 'Accept, Content-Type')
        json_reply.content_type = 'text/plain'

    return json_reply
