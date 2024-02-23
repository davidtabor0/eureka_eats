"""
    constants.py\n
    Contains loaded .env file values stored in global constants.
"""

import os

from dotenv import load_dotenv

# 1. Load .env values to runtime environment.
load_dotenv('./.env')

# 2. Load constants.
MONGODB_CONN_STR = os.getenv('CONN_STR')
