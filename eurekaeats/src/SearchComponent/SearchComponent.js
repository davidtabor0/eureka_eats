import React from 'react';
import {Link} from 'react-router-dom';

import getEEPriceWords from '../utils/misc';

import '../index.css';
import './SearchComponent.css';

/**
 * @description Contains a lookup dictionary for the possible price words using `'$'`.
 */
const EE_RESTAURANT_PRICE_WORDS = getEEPriceWords();

/**
 * @description Sub-Component to display a search result "card" with dynamic info of a relevant restaurant.
 * @param {{entryData: {id: string, name: string, address1: string, city: string, state: string, is_closed: boolean, price: string, image_url: string}}} param0 The inputted JS object with the basic restaurant info.
 */
function RestaurantCard({entryData}) {
    return (
        <>
            <div className='result-tile-container'>
                <div className="result-tile-header">
                    {/* Dynamic restaurant link */}
                    <Link to={`/restaurant/${entryData.id}`} className="result-tile-header-link">
                        {`${entryData.name}`}
                    </Link>
                </div>
                <div className="result-tile-blue-rectangle">
                    <div className="result-tile-content-container">
                        <ul className='result-tile-stats'>
                            <li className='result-tile-stat-entry'>
                                {`Address: ${entryData.address1} at ${entryData.city}, ${entryData.state}`}
                            </li>
                            <li className='result-tile-stat-entry'>
                                {`${(!entryData.is_closed) ? 'Currently: Open' : 'Currently: Closed'}`}
                            </li>
                            <li className='result-tile-stat-entry'>
                                {`Price: ${EE_RESTAURANT_PRICE_WORDS.lookup(entryData.price)}`}
                            </li>
                        </ul>
                    </div>
                    {/* TODO: test images later! */}
                    <div className='result-tile-img-box'>
                        <img src={`${entryData.image_url}`} alt="restaurant" />
                    </div>
                </div>
            </div>
        </>
    );
}

/**
 * @description Contains a modular component to render a list of search results for searched restaurants. This should be reused as a component for HomePage, LandingPage, and ProfilePage.
 * @param {{searchResultList: {id: string, name: string, address1: string, city: string, state: string, is_closed: boolean, price: string, image_url: string} []}} param0 An array of fetched data per restaurant.
*/
function SearchComponent({searchResultList}) {
    if (!searchResultList) {
        // For blank searches or before search: render placeholder as needed.
        return (<p>No results!</p>);
    }

    return (
        <>
            <ul className='search-result-list'>
                {
                    // Render each card for a found result. All data is passed from `searchResults` prop!
                    searchResultList.map((data) => (
                        <li className='search-result-item'>
                            <RestaurantCard entryData={data}/>
                        </li>
                    ))
                }
            </ul>
        </>
    );
}

export default SearchComponent;
