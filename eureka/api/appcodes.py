"""
    appcodes.py\n
    Contains constants for in-application API calls. Specifically, there are named constants for action codes and payload types based on SDD Section 5.6.
"""

## ACTION CODES ##

# Restaurant Actions

EE_UNKNOWN = -1
EE_SEARCH_RESTAURANT = 0
EE_LOOKUP_RESTAURANT = 1
EE_SUGGEST_TYPES = 2

# Review Actions

EE_GET_REVIEWS = 16
EE_CREATE_REVIEW = 17
EE_UPDATE_REVIEW = 18
EE_DELETE_REVIEW = 19

# User Actions

EE_GET_USER_INFO = 32
EE_UPDATE_USER_PROFILE = 33
EE_CREATE_USER = 34
EE_DELETE_USER = 35
EE_LOGIN_USER = 36
EE_LOGOUT_USER = 37

# Extra Actions (Admin actions will be future enhancements.)

EE_TEST_DUMMY_CALL = 47  # dummy API placeholder

## PAYLOAD CODES ##

EE_PAYLOAD_NUMBER = 0
EE_PAYLOAD_STRING = 1
EE_PAYLOAD_OBJECT = 2
EE_PAYLOAD_BOOLEAN = 3
EE_PAYLOAD_NULL = 4
