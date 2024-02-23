import { useState } from "react";

/**
 * @description Hook function for managing a JSON token in sessionStorage.
 */
function useJToken() {
    /**
     * @description Helper function to retrieve the stored JSON token.
     * @returns {string}
     */
    const getJSONToken = () => {
        const rawJTokenData = sessionStorage.getItem('E_EATS_TOKEN');
        const userJToken = JSON.parse(rawJTokenData);

        // Default undefined tokens to a null token!
        return userJToken || 'guest';
    };

    // Pack a state object of user token data for other components.
    const [token, setToken] = useState(getJSONToken());

    /**
     * @description Stores token data in some state and the sessionStorage.
     * @param {*} userJToken Likely a string. 
     */
    const storeToken = (userJToken) => {
        let optionalJToken = userJToken || 'guest'; // Assignment of an optional value.

        sessionStorage.setItem('E_EATS_TOKEN', JSON.stringify(optionalJToken));
        setToken(optionalJToken);
    };

    return {
        setToken: storeToken,
        token
    };
}

export default useJToken;
