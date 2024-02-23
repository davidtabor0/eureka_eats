"""
    @file test_user_helpers.py\n
    @summary Contains unit tests of helper functions in `eureka/api/users.py`.
"""

from eureka.api.appcodes import *
from eureka.api.users import *

def test_null_get_user():
    result_payload_code, result_data = user_api_get_user()

    assert result_payload_code == EE_PAYLOAD_BOOLEAN
    assert not result_data

def test_positive_get_user():
    result_payload_code, result_data = user_api_get_user({'username': 'DoeEats'})

    assert result_payload_code == EE_PAYLOAD_OBJECT  # Should indicate the object type. 
    assert result_data == MOCK_USER_1  # Should contain the mock user object.

def test_negative_get_user():
    result_payload_code, result_data = user_api_get_user({'username': 'NotAUser'})

    assert result_payload_code == EE_PAYLOAD_BOOLEAN  # Should be a bool.
    assert not result_data  # Should be False for failure.

# NOTE There are no tests for create or delete user helpers since they are unimplemented.

def test_null_login_user():
    result_payload_code, result_data = user_api_login_user()

    assert result_payload_code == EE_PAYLOAD_BOOLEAN
    assert not result_data

def test_positive_login_user():
    result_payload_code, result_data = user_api_login_user({'username': 'DoeEats', 'email': 'jdoe22@example.com', 'password': 'DEMO123'})

    assert result_payload_code == EE_PAYLOAD_BOOLEAN
    assert result_data == True

def test_negative_login_user():
    result_payload_code, result_data = user_api_login_user({'username': 'NotAUser', 'email': 'badbob@blackhat.xyz', 'password': 'T35t1ng_123'})

    assert result_payload_code == EE_PAYLOAD_BOOLEAN
    assert not result_data
