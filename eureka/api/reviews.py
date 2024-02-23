"""
    @file reviews.py\n
    @summary Contains API call handlers that provide functionality for CRUD operations on user reviews. This does not include admin actions by EurekaEats owners or developers (see `admin.py`).\n
    @author Derek Tan\n
"""

from flask import Blueprint, make_response, request

from eureka.api.appcodes import *
from eureka.utils.service import DB_SERVICE

#### HELPER FUNCTIONS ####

def reviews_api_get(args: dict = None):
    if not args:
        return (EE_PAYLOAD_NULL, None)
    
    rsid_arg = args.get('rsid')

    if not rsid_arg:
        return (EE_PAYLOAD_NULL, None)

    reviews_ref = DB_SERVICE.get_collection('reviews')
    review_results = []

    result_cursor = reviews_ref.find(
        {'rsid': f'{rsid_arg}'},
        {'_id': False}
    )

    for review in result_cursor:
        review_results.append(review)

    return (EE_PAYLOAD_OBJECT, {'reviews': review_results})

def reviews_api_create(args: dict = None):
    if not args:
        return (EE_PAYLOAD_BOOLEAN, False)
    
    # 1. Get arguments
    rsid_arg = args.get('rsid')
    token_arg = args.get('token')
    rating_arg = args.get('rating')
    comment_arg = args.get('comment')

    if not token_arg or not rating_arg or not comment_arg or token_arg == 'guest':
        return (EE_PAYLOAD_BOOLEAN, False)

    # 2. check session user before allowing review post
    users_ref = DB_SERVICE.get_collection('users')

    checked_username = users_ref.find_one(
        {'ssn': token_arg},
        {'username': 1}
    )

    if not checked_username:
        return (EE_PAYLOAD_BOOLEAN, False)

    # Attempt to add review by valid user
    reviews_ref = DB_SERVICE.get_collection('reviews')

    checked_insert = reviews_ref.insert_one({
        'rsid': f'{rsid_arg}',
        'author': f'{checked_username.get('username')}',
        'rating': rating_arg,
        'comment': f'{comment_arg}'
    })

    return (EE_PAYLOAD_BOOLEAN, checked_insert.acknowledged)

def reviews_api_update(args: dict = None):
    # NOTE this would be a future enhancement for review functionality.
    return (EE_PAYLOAD_BOOLEAN, False)

def reviews_api_delete(args: dict = None):
    if not args:
        return (EE_PAYLOAD_BOOLEAN, False)

    # 1. Get arguments
    token_arg = args.get('token')
    rsid_arg = args.get('rsid')

    if not token_arg or not rsid_arg or token_arg == 'guest':
        return (EE_PAYLOAD_BOOLEAN, False)

    users_ref = DB_SERVICE.get_collection('users')
    reviews_ref = DB_SERVICE.get_collection('reviews')

    # 2. Check if session user is valid and exists before delete action
    checked_username = users_ref.find_one(
        {'ssn': token_arg},
        {'username': True}
    )

    if not checked_username:
        return (EE_PAYLOAD_BOOLEAN, False)

    # 3. Attempt review deletion on user's behalf
    checked_delete = reviews_ref.delete_one({
        'rsid': f'{rsid_arg}',
        'author': f"{checked_username.get('username')}"

    })

    return (EE_PAYLOAD_BOOLEAN, checked_delete.acknowledged)

def reviews_api_do(appcode: int = EE_TEST_DUMMY_CALL, args: dict = None):
    """
        This function will do dispatching to helper functions for the review actions. See Section 5.6 of SDD for details.\n
        Takes an int action code and a container of arguments if needed.
    """

    pre_result = None

    if appcode == EE_GET_REVIEWS:
        pre_result = reviews_api_get(args)
    elif appcode == EE_CREATE_REVIEW:
        pre_result = reviews_api_create(args)
    elif appcode == EE_UPDATE_REVIEW:
        pre_result = reviews_api_update(args)
    elif appcode == EE_DELETE_REVIEW:
        pre_result = reviews_api_delete(args)

    pre_payload_code, pre_data = pre_result

    return {'payload': pre_payload_code, 'data': pre_data}

review_api_router = Blueprint('review_api', __name__)

@review_api_router.route('/api/reviews/action', methods=['OPTIONS', 'GET', 'POST'])
def handle_review_action():
    """
        This is a function to return JSON results from a defined action call for EurekaEats reviews. This dispatches the action call by its action code before forwarding the arguments to a helper.
    """
    json_request = None
    json_reply = None
    api_call_method = request.method
    
    if request.is_json:
        json_request = request.get_json()

    if api_call_method == 'GET' or api_call_method == 'POST':
        json_reply = make_response(reviews_api_do(json_request.get('action'), json_request.get('args')), 200)
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
