"""
    @file users.py\n
    Contains API helper functions with call handlers for user actions. Does not include admin action handlers, as they are instead in `admin.py`.\n
    @note The helper functions return 2-tuples as `(payload_code, payload_data)` according to SDD section 5.6. Cookies are also called tokens interchangeably.
    @author Derek Tan
"""

from uuid import uuid4
from flask import Blueprint, make_response, request

from eureka.api.appcodes import *
from eureka.utils.service import DB_SERVICE

#### HELPER FUNCTIONS ####

def user_api_get_user(args: dict = None):
    if args is None:
        return (EE_PAYLOAD_NULL, None)

    # Unpack args from JSON... Omitting token results in a lighter payload returned (SDD 5.6)
    session_token_arg = args.get('token')
    users_reference = DB_SERVICE.get_collection('users')
    user_data_batch = None
    user_data = None

    # Validate args!
    if not session_token_arg or session_token_arg == 'guest':
        return (EE_PAYLOAD_NULL, user_data)

    user_data_batch = users_reference.aggregate([
        {
            '$match': {'ssn': f'{session_token_arg}'}
        },
        {
            '$project': {'_id': 0, 'email': 0, 'password': 0, 'ssn': 0} # NOTE Omit ObjectId or else a JSON write error happens!
        }
    ], session=None)

    for item in user_data_batch:
        user_data = item
        break

    return (EE_PAYLOAD_OBJECT, user_data)

def user_api_create_user(args: dict = None):
    if args is None:
        return (EE_PAYLOAD_NULL, None)
    
    # Unpack args from JSON
    first_name_arg = args.get('firstName')
    last_name_arg = args.get('lastName')
    username_arg = args.get('username')
    email_arg = args.get('email')
    password_arg = args.get('password')

    # Use DB_SERVICE to get users collection reference
    users_reference = DB_SERVICE.get_collection('users')

    if users_reference is None:
        return (EE_PAYLOAD_NULL, None)

    # Check if username or email already exist
    pre_user_title = users_reference.aggregate([
        {
            '$match': {
                '$or': [
                    {'username': {'$eq': f'{username_arg}'}},
                    {'email': {'$eq': f'{email_arg}'}}
                ]
            }
        },
        {
            '$project': {
                'username': '$username',
                'email': '$email'
            }
        }
    ], session=None)

    # If checks are OK, create the account and send back a JSON session token.
    if pre_user_title.try_next() is not None:
       return (EE_PAYLOAD_NULL, None) 

    signin_ok = users_reference.insert_one({
        'username': f'{username_arg}',
        'email': f'{email_arg}',
        'password': f'{password_arg}',
        'first_name': f'{first_name_arg}',
        'last_name': f'{last_name_arg}',
        'location': [],
        'ssn': 'guest'
    }).acknowledged

    if signin_ok:
        return (EE_PAYLOAD_OBJECT, {'token': str(uuid4().bytes)})

    return (EE_PAYLOAD_OBJECT, None)

def user_api_delete_user(args: dict = None):
    return (EE_PAYLOAD_NULL, None)

def user_api_login_user(args: dict = None):
    if args is None:
        return (EE_PAYLOAD_NULL, None)

    username_arg = args.get('username')
    password_arg = args.get('password')
    auth_ok = False
    ssn_uuid = None
    is_ssn_created = False

    if not username_arg or not password_arg:
        return (EE_PAYLOAD_NULL, None) 
    
    users_reference = DB_SERVICE.get_collection('users')

    if users_reference is None:
        return (EE_PAYLOAD_NULL, None)
    
    # Check if the creds match.
    auth_ok = users_reference.find_one({
        '$and': [
            {'username': {'$eq': f'{username_arg}'}},
            {'password': {'$eq': f'{password_arg}'}}
        ]
    }) is not None

    # If the creds match, set their session UUID.
    if auth_ok:
        ssn_uuid = str(uuid4().bytes)
        is_ssn_created = users_reference.update_one(
            {
                'username': f'{username_arg}',
                'password': f'{password_arg}'
            },
            {'$set': {'ssn': ssn_uuid}}
        ).acknowledged
        print(f'is_ssn_created = {is_ssn_created}') # DEBUG
    
    if is_ssn_created:
        return (EE_PAYLOAD_OBJECT, {'token': ssn_uuid})
    
    return (EE_PAYLOAD_NULL, None)

def user_api_logout_user(args: dict = None):
    if not args:
        return (EE_PAYLOAD_BOOLEAN, False)
    
    username_arg = args.get('username')
    password_arg = args.get('password')
    has_ended_ssn = False

    if not username_arg or not password_arg:
        return (EE_PAYLOAD_BOOLEAN, has_ended_ssn)

    users_reference = DB_SERVICE.get_collection('users')

    if users_reference is None:
        return (EE_PAYLOAD_BOOLEAN, has_ended_ssn)
    
    # If users can be accessed, unset the ssn field for the target user to end their session.
    has_ended_ssn = users_reference.update_one(
        {
            '$and': [
                {'username': {'$eq': f'{username_arg}'}},
                {'password': {'$eq': f'{password_arg}'}}
            ]
        },
        {'$set': {'ssn': 'guest'}}
    ).acknowledged

    return (EE_PAYLOAD_BOOLEAN, has_ended_ssn)

def user_api_do(appcode: int = EE_TEST_DUMMY_CALL, args = None):
    """
        This helper function will later contain all logic to interact with the application database for CRUD operations on user data. See SDD Section 5.6 for more details.\n
        Takes an int action code and a list or dict of arguments if needed.
    """

    pre_result = None

    # TODO Pass a PyMongo instance into the API helper functions. The object should be global scope so it does not get deleted automatically.
    if appcode == EE_GET_USER_INFO:
        pre_result = user_api_get_user(args)
    elif appcode == EE_CREATE_USER:
        pre_result = user_api_create_user(args)
    elif appcode == EE_DELETE_USER:
        pre_result = user_api_delete_user(args)
    elif appcode == EE_LOGIN_USER:
        pre_result = user_api_login_user(args)
    elif appcode == EE_LOGOUT_USER:
        pre_result = user_api_logout_user(args)
    else:
        # Default data on invalid code or other errors.
        pre_result = (EE_PAYLOAD_BOOLEAN, False)

    pre_payload_code, pre_data = pre_result

    return {'payload': pre_payload_code, 'data': pre_data}

#### USER API BLUEPRINT ####
user_api_router = Blueprint('user_router', __name__)

@user_api_router.route('/api/users/action', methods=['GET', 'POST', 'OPTIONS'])
def handle_user_action():
    json_request = None
    json_reply = None
    api_call_method = request.method

    # 1. Get request JSON if present.
    if request.is_json:
        json_request = request.get_json()

    # 2. Handle request by method: handle general requests by method, especially OPTIONS!
    if api_call_method == 'GET' or api_call_method == 'POST':
        json_reply = make_response(user_api_do(json_request.get('action'), json_request.get('args')), 200)
        json_reply.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        json_reply.headers.add('Access-Control-Allow-Methods', 'GET, POST')
        json_reply.headers.add('Access-Control-Allow-Headers', 'Accept, Content-Type')
        json_reply.content_type = 'application/json'
    else:
        json_reply = make_response('foo', 204)
        json_reply.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        json_reply.headers.add('Access-Control-Allow-Methods', 'GET, POST')
        json_reply.headers.add('Access-Control-Allow-Headers', 'Accept, Content-Type')
        json_reply.content_type = 'text/plain'

    return json_reply
