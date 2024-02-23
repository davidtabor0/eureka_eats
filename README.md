# README

## Project:
 - Course: CS 3337 Fall 2023
 - Title: "EurekaEats"
 - Slogan: "Sometimes, fast food won't cut it- People gotta eat _good_."
 - Developers: Devin Chang, Iqra Irfan, Dana Mendoza, David Tabor, Derek Tan

## 1. Brief
This is Group 6's project for the CS 3337 Fall 2023 course. In a nutshell, this project is an enhanced application based on Yelp. It offers better features to help its users choose best-fitting dining options and other quality of life features.

## 2. Further Info

### 2.1 Issue Posting
Please check the _Projects_ tab for an overview of development. If a new work item is needed, please add an "issue" to _Issues_ before we accept it into _Projects_.

### 2.2 Development Usage

#### 2.2.1 Running Steps: (Assumes all dependencies are present.)
 1. See https://flask.palletsprojects.com/en/3.0.x/tutorial/fact for a quick overview.
 2. $ flask --app eureka run
 3. Enter `cd eurekaeats` for frontend.
 4. Enter `npm start` to run the React development server. The page should open up automatically.
 5. SIGINT with `CTRL+C` to stop the testrun.

#### 2.2.2 Testing Tips:
 - Command: `python -m pytest .` runs _all_ unit tests.
    - Unit tests are _very_ incomplete for now, as they only test some dummy user API functions.
 - App API test example:
    ```bash
    curl -X POST -v "http://127.0.0.1:5000/api/users/action" -H "Accept: application/json" -H "Content-Type: application/json" -H "Connection: close" --data "{\"action\": 47, \"args\": null}"
    ```

#### 2.2.3 Misc. Tips:
 - The `config.py` file has been added to the repo for easy access, but it is still unsafe to put custom secret strings in the settings. Please use a `.env` file on your computer instead for database login info.

### 2.3.0 How to set up YELP FUSION API to database
1. YELP FUSION API setup
   - get an API KEY from https://www.yelp.com/developers/v3/manage_app
   - create a .env file and store the key as `YELP_API_KEY = 'the api key'`
2. Setup MongoDB to connect to VSCODE
   - Download VScode with MongoDb extension
   - Add MongoDb connection from your local host
   - Add connection string to your `.env` file
- Database name will be `EurekaEats`
- Collection will be `restaurants`
  


