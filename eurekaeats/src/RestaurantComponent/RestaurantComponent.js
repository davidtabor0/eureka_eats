import React, {useState, useEffect } from 'react';
import { Link, Outlet, useParams } from 'react-router-dom';

import getEEPriceWords from '../utils/misc';
import useJToken from '../utils/useJToken';

import './RestaurantComponent.css';
import './ReviewMenu.css';
import logo from '../assets/EurekaEatsWText.png';

const EE_PRICE_WORDS = getEEPriceWords();

// TODO 2: Implement location to MapBox functionality?

/**
 * @description Modular component for showing full restaurant data. The reviews are kept separately in `RestaurantReviews`.
 * @param {{restaurantData: {id: string, name: string, address1: string, city: string, state: string, is_closed: boolean, price: string, rating: number, type: string[], image_url: string}}} param0
 */
function RestaurantBoard({restaurantData}) {
  if (!restaurantData) {
    return (<p className='restaurant-page-txt'>Oops, the loading went wrong!</p>);
  }

  return (
    <>
      <section className='restaurant-page-board'>
        <div className='restaurant-page-board-top'>
          <div className='restaurant-page-board-top-left'>
            <ul className='restaurant-page-board-briefs'>
              {/* todo: put name, addressing, type */}
              <li className='restaurant-page-board-brief'>
                <h2 className='restaurant-page-h2'>
                  {`${restaurantData.name}`}
                </h2>
              </li>
              <li className='restaurant-page-board-brief'>
                <p className='restaurant-page-txt'>
                  {`Address: ${restaurantData.address1} at ${restaurantData.city}, ${restaurantData.state}`}
                </p>
              </li>
              <li className='restaurant-page-board-brief'>
                <p className='restaurant-page-txt'>
                  {`Types: ${restaurantData.type.join(', ')}`}
                </p>
              </li>
              <li className='restaurant-page-board-brief'>
                <p className='restaurant-page-txt'>All data originates from <a className='restaurant-page-extern-link' href='https://www.yelp.com/'>Yelp</a></p>
              </li>
            </ul>
          </div>
          <div className='restaurant-page-board-top-right'>
            <img src={`${restaurantData.image_url}`} alt="restaurant" />
          </div>
        </div>
        <div className='restaurant-page-board-main'>
          <ul className='restaurant-page-board-stats'>
            <li className='restaurant-page-board-stat'>
              <p className='restaurant-page-txt'>
                {`Price: ${EE_PRICE_WORDS.lookup(restaurantData.price)}`}
              </p>
            </li>
            <li className='restaurant-page-board-stat'>
              <p className='restaurant-page-txt'>
                {`Rating: ${restaurantData.rating} / 5`}
              </p>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}

/**
 * @description Modular component to contain content per review.
 * @param {{reviewData: {author: string, rating: number, comment: string}} }param0
 */
function RestaurantReviewCard({reviewData}) {
  return (
    <div className='restaurant-page-review-card'>
      <div className='restaurant-page-review-header'>
        <h4 className='restaurant-page-review-author'>{reviewData.author || 'Unknown'}</h4>
        <span className='restaurant-page-review-rating'>
          {`${reviewData.rating} / 5`}
        </span>
      </div>
      <div className='restaurant-page-review-body'>
        <p className='restaurant-page-txt'>
          {`${reviewData.comment || '(No comment)'}`}
        </p>
      </div>
    </div>
  );
}

/**
 * @description Modular component for showing user reviews per restaurant. Each review is rendered by `RestaurantReviewCard`.
 * @param {{reviews: {author: string, rating: number, comment: string}[]}} param0
 */
function RestaurantReviews({reviews}) {
  if (!reviews) {
    return (
      <p className='restaurant-page-txt'>No reviews here, would you be the first?</p>
    );
  }

  if (reviews.length < 1) {
    return (
      <p className='restaurant-page-txt'>No reviews here, would you be the first?</p>
    );
  }

  return (
    <>
      <section className='restaurant-page-reviews'>
        {/* TODO: add .map call to render any number of reviews! */}
        <ul className='restaurant-page-review-list'>
          {reviews.map((reviewItem) => (
            <li className='restaurant-page-review-item'>
              <RestaurantReviewCard reviewData={reviewItem}/>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

/**
 * @description Modular component for a review menu. Needs the user token, current restaurant ID, visibility flag, and other callbacks to close or trigger data refresh.
 * @param {{userToken: string, restaurantID: string, externSetLoadOK: (flag: boolean) => void, externCloseCallback: () => void, showFlag: boolean}} param0 
 */
function RestaurantReviewMenu({userToken, restaurantID, externSetLoadOK, externCloseCallback, showFlag}) {
  const rsID = restaurantID;
  const ssnToken = userToken;
  const [actionVerb, setActionVerb] = useState(-1)
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('No comment');

  /**
   * @description Helper function to do a review API call.
   * @param {number} actionCode 
   * @param {*} actionArgs 
   * @returns {Promise<object | null>}
   */
  const doExtraAPICall = async (actionCode, actionArgs) => {
    const res = await fetch('http://127.0.0.1:5000/api/reviews/action', {
      'mode': 'cors',
      'method': 'POST',
      'headers': {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      'body': JSON.stringify({action: actionCode, args: actionArgs})
    }).catch((err) => console.error(`eurekaeats: ${err}`)) || null; // Default to null in case of a void value.

    if (res) {
      return res.json();
    }

    return null;
  };

  const addReview = async () => {
    const response = await doExtraAPICall(17, {rsid: rsID, token: ssnToken, rating: rating, comment: comment});

    if (!response) {
      console.error('eurekaeats [API Error]: Fetch failed.');
    } else if (response.payload === 3 && response.data === true) {
      console.log('eurekaeats [API Error]: Review add OK!');
    } else {
      console.error('eurekaeats [API Error]: Invalid payload.')
    }
  };

  const deleteReview = async () => {
    const response = await doExtraAPICall(19, {token: ssnToken, rsid: rsID})
    
    if (!response) {
      console.error('eurekaeats [API Error]: Fetch failed.');
    } else if (response.payload === 3 && response.data === true) {
      console.log('eurekaeats [API Error]: Review delete OK!');
    } else {
      console.error('eurekaeats [API Error]: Invalid payload.');
    }
  }

  const handleMenuSubmit = async (event) => {
    event.preventDefault();

    if (actionVerb === 'add') {
      await addReview();
    } else {
      await deleteReview();
    }

    externCloseCallback();
    externSetLoadOK(false);
  }

  return (
    <>
      <div className='review-menu-modal' style={{display: (showFlag) ? 'block' : 'none'}}>
        <article className='review-menu-wrapper'>
          <div className='review-menu-top'>
            <h4 className='review-menu-title'>Your Review</h4>
          </div>
          <div className='review-menu-main'>
            <form className='review-menu-form' onSubmit={(event) => handleMenuSubmit(event)}>
              <div>
                <label htmlFor='review-menu-verb1'>Add Review</label>
                <input type='radio' id='review-menu-verb1' name='actverb' value='add' onChange={(e) => setActionVerb(e.target.value)} checked={actionVerb === 'add'} />
                <label htmlFor='review-menu-verb2'>Delete Review</label>
                <input type='radio' id='review-menu-verb2' name='actverb' value='delete' onChange={(e) => setActionVerb(e.target.value)} checked={actionVerb === 'delete'} />
              </div>
              <div>
                <label htmlFor='review-menu-rating'>Rating:</label>
                <input type='number' id='review-menu-rating' className='review-menu-input' min={1} max={5} step={0.5} onChange={(e) => setRating(e.target.value)} />
              </div>
              <div>
                {/* Input for location type */}
                <label htmlFor='review-menu-comment'>Comment: </label>
                <textarea id='review-menu-comment' className='review-menu-textarea' rows={4} cols={50} minLength={10} maxLength={200} onChange={(e) => setComment(e.target.value)} />
              </div>
              <div>
                <button type='submit' className='review-menu-button'>Submit</button>
                <button type='button' className='review-menu-button' onClick={() => externCloseCallback()}>Cancel</button>
              </div>
            </form>
          </div>
        </article>
      </div>
    </>  
  );
}

/**
 * @description Restaurant page component.
 * @param {{usedJTokenHook: useJToken}} param0 
 */
function RestaurantComponent({usedJTokenHook}) {
  /* Useful State */
  const [loadOK, setLoadOK] = useState(false); // flag to block extra, unneeded fetches
  const [menuVisibility, setMenuVisiblility] = useState(false); // flag to show comment menu or not
  const {setToken, token} = usedJTokenHook(); // session token
  const [userName, setUserName] = useState('Guest'); // session's user name
  const {id} = useParams(); // restaurant entry id from search link
  const [restaurantInfo, setRestaurantInfo] = useState();
  const [restaurantReviews, setRestaurantReviews] = useState([]);

  /**
   * @description Sends an action request to the backend to mutate/load dynamic data. Takes a JSON message following SDD 5.6 formatting.
   * @note Check `eureka/restaurants.py` for API details.
   * @param {string} apiRoute API call route: `<backend>/api/<subject>/action`
   * @param {number} actionCode API call code. Idenfities the call by SDD 5.6.
   * @param {object} callArgs JS object with name-value arguments.
   * @returns {Promise<object | null>} Async task result for API.
   */
  const doEurekaAPICall = async (apiRoute, actionCode, callArgs) => {
    const res = await fetch(apiRoute, {
      'mode': 'cors',
      'method': 'POST',
      'headers': {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      'body': JSON.stringify({action: actionCode, args: callArgs})
    }).catch((err) => console.error(`eurekaeats: ${err}`)) || null; // Default to null in case of a void value.

    if (res) {
      return res.json();
    }

    return null;
  }

  /**
   * @description Helper function that dispatches API calls to load user info and restaurant info.
   * @param {string} tokenString
   */
  const loadUserIdentity = async (tokenString) => {
    const response = await doEurekaAPICall('http://127.0.0.1:5000/api/users/action', 32, {token: tokenString || 'guest'});

    if (!response) {
      console.error('eurekaeats [API Error]: Fetch failed.');
    } else if (response.payload === 4) {
      console.error(`eurekaeats [API Error]: No valid data found.`);
      setToken(null);
      setUserName('Guest');
    } else if (response.payload === 2) {
      console.log('eurekaeats [API Log]: Fetched username!');
      setUserName(response.data.username);
    } else {
      console.error('eurekaeats [API Error]: Invalid payload.');
      setToken(null);
      setUserName('Guest');
    }
  }

  /**
   * @description Helper function to load restaurant info.
   * @param {string} restaurantId 
   */
  const loadRestaurantInfo = async (restaurantId) => {
    const response = await doEurekaAPICall('http://127.0.0.1:5000/api/restaurants/action', 1, {id: restaurantId});

    if (!response) {
      console.error('eurekaeats [API Error]: Fetch failed.');
    } else if (response.payload === 4) {
      console.error(`eurekaeats [API Error]: No valid data found.`);
    } else if (response.payload === 2) {
      console.log('eurekaeats [API Log]: Fetched restaurant info!');
      setRestaurantInfo(response.data.result);
    } else {
      console.error('eurekaeats [API Error]: Invalid payload.');
    }
  };

  /**
   * @description Helper function to load reviews for a specific restaurant by ID.
   * @param {string} restaurantId The unique identifier string by the last path parameter e.g `/restaurant/abc123xyz`
   */
  const loadReviews = async (restaurantId) => {
    const response = await doEurekaAPICall('http://127.0.0.1:5000/api/reviews/action', 16, {rsid: restaurantId})
    
    if (!response) {
      console.error('eurekaeats [API Error]: Fetch failed.');
    } else if (response.payload === 4) {
      console.error('eurekaeats [API Error]: No valid data found.');
    } else if (response.payload === 2) {
      console.log('eurekaeats [API Log]: Fetched reviews!');
      setRestaurantReviews(response.data.reviews)
    } else {
      console.error('eurekaeats [API Log]: Invalid payload.');
    }
  };

  useEffect(() => {
    const loadDynamicData = async () => {
      if (loadOK) {
        return;
      }

      await loadRestaurantInfo(id);
      await loadUserIdentity(token);
      await loadReviews(id);
      setLoadOK(true);
    };

    loadDynamicData();
  });

  return (
    <>
      <RestaurantReviewMenu userToken={token} restaurantID={id} externSetLoadOK={(flag) => setLoadOK(flag)} externCloseCallback={() => setMenuVisiblility(false)} showFlag={menuVisibility}/>
      <header className='restaurant-page-header'>
        <div className="restaurant-page-logo">
          <Link to="/home" className="restaurant-page-logo-link">
            <img src={logo} alt="My Logo" />
          </Link>
        </div>
        <div className="restaurant-page-header-buttons">
          <Link to={`${(userName === 'Guest') ? '/' : '/home'}`}
            className="restaurant-page-button">
              {`${(userName === 'Guest') ? 'Home' : userName}`}
          </Link>
          {/* TODO: implement review handler for add/delete review menu. */}
          <button className='restaurant-page-button' onClick={() => setMenuVisiblility(true)}>Leave a Review</button>
        </div>
      </header>
      <main className='restaurant-page-wrapper'>
        <RestaurantBoard restaurantData={restaurantInfo}/>
        <RestaurantReviews reviews={restaurantReviews}/>
      </main>
      <Outlet/>
    </>
  )
}

export default RestaurantComponent;
