"""
    service.py\n
    Defines a class as a generic interface to use MongoDB through PyMongo. This is a database service wrapper.
"""

from eureka.utils.constants import MONGODB_CONN_STR

from pymongo import MongoClient

class MongoService:
    """
        Constructs a MongoService instance that wraps a PyMongo client. The internal client supports multi-access on one according to its documentation. Returned collection objects interface with the MongoDB DB.
    """
    def __init__(self, db_url: str = MONGODB_CONN_STR):
        try:
            self.mdb_client = MongoClient(db_url)
        except Exception as db_exception:
            print(f'{__name__}: {db_exception}')
            self.mdb_client = None
        finally:
            if self.mdb_client is not None:
                self.ee_db = self.mdb_client.get_database('EurekaEats')
            else:
                self.ee_db = None

    def close_service(self):
        """
            Cleanup method for closing all database connections. Only call this on application shutdown e.g atexit handlers.
        """
        if self.mdb_client is None:
            return
        
        self.mdb_client.close()
    
    def is_ready(self):
        return self.ee_db is not None

    def get_collection(self, collection_name: str = ''):
        """
            Attempts to get a collection if the MongoService instance had its database object set up properly and if the argument not empty.
        """
        if not collection_name or self.ee_db is None:
            return None

        return self.ee_db.get_collection(collection_name)

DB_SERVICE = MongoService()
