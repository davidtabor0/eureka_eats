/**
 * @file misc.js
 * @summary Contains extra utility functions or constants.
 */

/**
 * @description Gives a lookup dictionary for the possible price words using `'$'`.
 */
function getEEPriceWords() {
    return {
        placeholder: 'Unknown',
        '$': 'Cheap',
        '$$': 'Mid-price',
        '$$$': 'Pricey',
        /**
         * @description Anonymous lookup function for price words.
         * @param {string} key 
         * @returns {string}
         */
        lookup: function (key) {
            return this[key] || this.placeholder
        }
    }
}

export default getEEPriceWords;
