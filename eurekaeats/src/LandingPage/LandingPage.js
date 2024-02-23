import React from 'react';
import { useState } from 'react';

import { Link } from 'react-router-dom';
import { Outlet } from 'react-router-dom';

import SearchComponent from '../SearchComponent/SearchComponent';

import logo from '../assets/EurekaEatsWText.png';
import search from '../assets/searchIcon.png';
import longlogo from '../assets/EurekaEatsLongLogo.png'


import '../index.css';
import './LandingPage.css';
import './LandingPageDrawer.css';


/* Constants */

const EE_SEARCH_COUNT_MIN = 1;
const EE_SEARCH_COUNT_MAX = 25;

// TODO: add <SearchComponent/> to replace demo result tiles after fixing event handlers of searchbar.
function LandingPage() {
  /* Useful state for search factors: */
  const [searchWords, setSearchWords] = useState('');
  const [searchType, setSearchType] = useState('');
  const [searchPrice, setSearchPrice] = useState('$');
  const [searchCount, setSearchCount] = useState(EE_SEARCH_COUNT_MIN);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTips, setSearchTips] = useState([]);
  const [throttleSearch, setThrottleSearch] = useState(false);
  const [drawerVisibility, setDrawerVisibility] = useState(false);

  /**
   * @description Helper for requesting by user given search details to get suggestions or results.
   * @param {number} actionCode
   * @param {{keyword: string, type: string, price: string, count: number} | {fragment: string}} searchArgs
   * @note Check `eureka/restaurants.py` for API details.
   * @note A bad request or a non HTTP-OK response will result in `null` data.
   * @returns {Promise<{payload: number, data: *} | null>} Async task result for API.
   */
  const doRestaurantAPICall = async (actionCode, searchArgs) => {
    if (!searchArgs) {
      return null;
    }

    // Do an asynchronous request to the backend to avoid stalling the page.
    const res = await fetch('http://127.0.0.1:5000/api/restaurants/action', {
      'mode': 'cors',
      'method': 'POST',
      'headers': {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      'body': JSON.stringify({ action: actionCode, args: searchArgs })
    })
    .catch((err) => {
      console.error(`eurekaeats [API Error]: ${err}`);
      return null;
    }); // Default to null in case of a void value.

    if (res.status === 200) {
      return res.json();
    }

    return null;
  }

  /**
   * @description Event handler for search button clicks. Should trigger dynamic load of restaurant data based on the given search arguments.
   */
  const doSearch = async () => {
    if (throttleSearch) {
      return;
    } else {
      setThrottleSearch(true);
      setTimeout(() => setThrottleSearch(false), 500);
    }

    const apiReply = await doRestaurantAPICall(0, { 
      keyword: searchWords,
      type: searchType,
      price: searchPrice,
      count: searchCount
    });

    // Do not restate empty or invalid results from search call to avoid errors.
    if (!apiReply) {
      setSearchResults(null);
    } else if (apiReply.payload !== 2 || !apiReply.data) {
      setSearchResults(null);
    } else {
      setSearchResults(apiReply.data.results);
    }
  }

  /**
   * @description Toggles flag to show drawer of search qualities... The flag is passed into a helper SearchDrawer component.
   * @note The drawer is actually going to be a simple left-side modal menu for simplicity.
   */
  const openDrawer = () => {
    setDrawerVisibility(true);
  };

  const closeDrawer = () => {
    setDrawerVisibility(false);
  }

  /**
   * @description Makes an API call on user typing of a location type keyword... some location type names are suggested.
   * @param {string} keyword 
   */
  const handleDrawerTips = async (keyword) => {
    const apiReply = await doRestaurantAPICall(2, {fragment: keyword});

    if (!apiReply) {
      setSearchTips([]);
    } else if (apiReply.payload !== 2 || !apiReply.data) {
      setSearchTips([]);
    } else {
      setSearchTips(apiReply.data.suggestions);
    }
  }

  const handleDrawerSearch = (event) => {
    // 1. Do not submit normally wih reload... bad for React UI!
    event.preventDefault();

    // 2. Do searching call to backend!
    doSearch();

    // 3. close search drawer when done!
    closeDrawer();
  };

  return (
    <>
      {/* Popup search drawer */}
      <div className='landing-page-drawer-modal' style={{display: ((drawerVisibility) ? 'block' : 'none')}}>
        <article className='landing-page-drawer'>
          <div className='landing-page-drawer-top'>
            <h4 className='landing-page-drawer-title'>Search Form</h4>
          </div>
          <div className='landing-page-drawer-main'>
            <form className='landing-page-drawer-form' onSubmit={(event) => handleDrawerSearch(event)}>
              <div>
                {/* Input for title keyword */}
                <label htmlFor='landing-page-drawer-keyword'>Keyword:</label>
                <input type='text' id='landing-page-drawer-keyword' className='landing-page-drawer-input' onChange={(e) => setSearchWords(e.target.value)} />
              </div>
              <div>
                {/* Input for location type */}
                <label htmlFor='landing-page-drawer-type'>Type: </label>
                <input type='text' id='landing-page-drawer-type' className='landing-page-drawer-input' onChange={(e) => {
                  setSearchType(e.target.value);
                  handleDrawerTips(searchType);
                }} />
              </div>
              <div>
                {/* Radio buttons to choose price tiers 1 to 3 */}
                <p className = 'price-limit'>Price Limit: </p>
                <label htmlFor='landing-page-drawer-price1'>$</label>
                <input type='radio' id='landing-page-drawer-price1' name='loctype' value='$' onChange={(e) => setSearchPrice(e.target.value)} checked={searchPrice === '$'} />
                <label htmlFor='landing-page-drawer-price2'>$$</label>
                <input type='radio' id='landing-page-drawer-price2' name='loctype' value='$$' onChange={(e) => setSearchPrice(e.target.value)} checked={searchPrice === '$$'} />
                <label htmlFor='landing-page-drawer-price3'>$$$</label>
                <input type='radio' id='landing-page-drawer-price3' name='loctype' value='$$$' onChange={(e) => setSearchPrice(e.target.value)} checked={searchPrice === '$$$'} />
              </div>
              <div>
                {/* Input for search result limit */}
                <label htmlFor='landing-page-drawer-srchlimit'>Search Results Limit:</label>
                <input type='text' id='landing-page-drawer-srchlimit' className='landing-page-drawer-input' onChange={(e) => setSearchCount((isNaN(e.target.value) || e.target.value > '25')
                  ? EE_SEARCH_COUNT_MIN
                  : parseInt(e.target.value))}
                placeholder='1-25' />
              </div>
              <div>
                <button type='submit' className='landing-page-drawer-button'>Search</button>
                <button type='button' className='landing-page-drawer-button' onClick={(event) => closeDrawer()}>Cancel</button>
              </div>
            </form>
            <span className='landing-page-drawer-tips'>Suggestions: {`${searchTips.join(',') || 'None'}`}</span>
          </div>
        </article>
      </div>
      {/* Main Content */}
      <header className='landing-page-header'>
        <div className="landing-page-logo">
          <img src={longlogo} alt="EurekaEats Logo" />
        </div>

        <div className="landing-page-search-bar">
        
          <button className="landing-page-search-button" onClick={(event) => openDrawer()}>
          <img src={search} alt="searchLogo" className="landing-page-search-icon" />
          <span className="search-title"> Start Your Search  </span>
          </button>
        </div>
        <div className="landing-page-header-buttons">
          <Link to="/login" className="landing-page-login-button">Log In</Link>
       
          <Link to="/signin" className="landing-page-signup-button">Sign Up</Link>          
        </div>
      </header>
      <main className='landing-page-main'>
        <h1 className='landing-page-h2'>
          Welcome to EurekaEats! We know people just want to eat <em>good</em>.
        </h1>
        <h2 className='landing-page-h1'>To begin, simply start searching using the button above!</h2>
        <p className='landing-page-p'>Only available for the Greater Los Angeles Area.</p>
        {/* Reuse search result list here! */}
        <SearchComponent searchResultList={searchResults} />
      </main>
      <Outlet />
    </>
  );
}

export default LandingPage;
