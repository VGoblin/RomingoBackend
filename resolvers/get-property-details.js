// om namah shivaya

'use strict';

// require scripts
const { DateTime } = require('luxon');

const pg = require('../db/postgres/postgres.js');
const sabre = require('../sabre/sabre.js');
const common = require('../sabre/requests/common.js');
const common2 = require('../resolvers/common.js');

async function getPropertyDetails(parent, args) {
  
    let data = await pg.getPropertyDetail(args.input.alias);
    
    //city data append in property
    let city = await pg.cityById(data[0].cityId);

     city = {
      id: city.cityId,
      name: city.cityName,
      center: {
        latitude: city.center.y,
        longitude: city.center.x,
      },
      zoom: city.zoom,
      state: {
        id: city.stateId,
        code: city.code,
        name: city.stateName,
        country: {
          id: city.countryId,
          name: city.countryName,
        },
      },
    };

    const property = data[0];

    property.featuredImageURL = `${
      global.config.imageBaseURL
    }${encodeURIComponent(
      property.imageDirectoryName
    )}/${encodeURIComponent(property.featuredImageFilename)}`;

    property.imageURLs = [];

    property.imageURLs.push(
      `${
        global.config.imageBaseURL
      }${encodeURIComponent(
    property.imageDirectoryName
      )}/${encodeURIComponent(property.featuredImageFilename)}`
    )

    for (let k = 0; k < property.imageFilenames.length; k++) {
      property.imageURLs.push(
        `${global.config.imageBaseURL}${encodeURIComponent(
          property.imageDirectoryName
        )}/${encodeURIComponent(property.imageFilenames[k])}`
      );
    }

    var res = { 
                "addressLine1"          : property.addressLine1,
                "alias"                 : property.alias,
                "checkoutPagePromoText" : property.checkoutPagePromoText,
                "city"                  : city,
                "desc"                  : property.desc,
                "detailsPagePromoText"  : property.detailsPagePromoText,
                "dogAmenities"          : property.dogAmenities,
                "featuredImageURL"      : property.featuredImageURL,
                "googlePlaceId"         : property.googlePlaceId,
                "id"                    : property.id,
                "imageURLs"             : property.imageURLs,
                "name"                  : property.name,
                "neighborhood"          : property.neighborhood,
                "romingoScore"          : property.romingoScore,
                "listingsPagePromoText" : property.listingsPagePromoText,
                "page_rank"             : property.page_rank,
                "allows_big_dogs"       : property.allows_big_dogs,
                "hotelEmail"            : property.hotelEmail,
                "hotelAlternativeEmail" : property.hotelAlternativeEmail,
                "sabreId"               : property.sabreId,
                "zipCode"               : property.zipCode,
                "petFeePolicy"          : property.petFeesData,
     };
    return res
}

module.exports = {
  getPropertyDetails,
};
