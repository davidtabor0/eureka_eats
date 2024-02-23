
import pymongo

# function to drop a collection 
def drop_collection(conn_str):
   

    # test to see if connection been made for mongoDB and vscode
    try:
        client = pymongo.MongoClient(conn_str)
    except Exception:
        print('Error:' + Exception)
        
    # creating new database
    my_Db = client['EurekaEats']

    # creating new collection
    my_Collection = my_Db['restaurants']  
    
    # delete collection if existed
    my_Collection.drop()
    
# function to store information from the parsed Yelp Fusion API JSON file to your current local MongoDB database
def store_in_restaurant_db (conn_str, id, name, image_url, is_closed, review_count, price, type, rating, longitude, latitude, street, apt, city, zip_code, country, state, phone_number):

    # test to see if connection been made for mongoDB and vscode
    try:
        client = pymongo.MongoClient(conn_str)
    except Exception:
        print('Error:' + Exception)
        
    # creating new database
    my_Db = client['EurekaEats']

    # creating new collection
    my_Collection = my_Db['restaurants']  
    
    # insert data into collection 
    my_Collection.insert_one({'id': id, 'name' : name, 'image_url' : image_url , 'is_closed' : is_closed, 'review_count' : 0,
                            'rating' : rating, 'price' : price, 'location' : {'longitude' : longitude, 'laditude' : latitude}, 'review_count' : review_count,
                            'address1' : street, 'address2' : apt, 'city' : city, 'zip_code' : zip_code, 'country' : country, 'state' : state, 'phone' : phone_number, 'type' : type})
    

    
    
            