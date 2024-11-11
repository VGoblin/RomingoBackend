// om namah shivaya.

'use strict';

// require scripts
const { DateTime } = require('luxon');

const pg = require('../db/postgres/postgres.js');
const sabre = require('../sabre/sabre.js');
const common = require('./common.js');
var _ = require('lodash');

async function propertiesByCorporateDiscount(parent, args) {

  let allows_big_dogs = args?.input?.allows_big_dogs || 0;
  let city = await pg.cityById(args.input.cityId);

  if (!city) {
    return [];
  }

  const properties = await pg.propertiesByCityIdAndCorporateDiscount(
    args.input.cityId,
    true,
    allows_big_dogs
  );

  if (properties.length === 0) {
    return [];
  }

  // preparing params for sabre
  const sabreIds = [];
  for (let i = 0; i < properties.length; i++) {
    sabreIds.push(properties[i].sabreId);
  }

  // sending request to sabre
  const res = await sabre.properties(
    sabreIds,
    DateTime.fromJSDate(args.input.checkIn).toUTC().toISODate(),
    DateTime.fromJSDate(args.input.checkOut).toUTC().toISODate(),
    args.input.adults,
    args.input.children,
    true
  );

  // we'll return this
  const newProperties = [];

  // reshaping city to match graphql schema
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


  const data = res.GetHotelAvailRS.HotelAvailInfos.HotelAvailInfo;
  const matchedProperties = properties.filter(property => data.some(obj => obj.HotelInfo.HotelCode === property.sabreId))
  console.log('matches')
  console.log(matchedProperties.length)

  
  const formattedData = []
  for (let i = 0; i < matchedProperties.length; i++) {
    const localData = matchedProperties[i]
    const sabreData = data.find(obj => obj.HotelInfo.HotelCode == localData.sabreId)

    const amenities = sabreData.HotelInfo.Amenities.Amenity.map(amenity => {
      return {
        code: amenity.Code,
        desc: amenity.Description,
        value: amenity.value,
        free: amenity.ComplimentaryInd,
      }
    })
 
    //TODO: get the actual lowest converted rate from this object
    const cri = sabreData.HotelRateInfo.RateInfos.ConvertedRateInfo[0];

    let format = {
      ...localData,
      city: city,
      amenities: amenities,
      featuredImageURL: `${global.config.imageBaseURL}${encodeURIComponent(localData.imageDirectoryName)}/${encodeURIComponent(localData.featuredImageFilename)}`,
      imageURLs: localData.imageFilenames.map(fileName => `${global.config.imageBaseURL}${encodeURIComponent(localData.imageDirectoryName)}/${encodeURIComponent(fileName)}`),
      name: sabreData.HotelInfo.HotelName,
      addressLine1: sabreData.HotelInfo.LocationInfo.Address.AddressLine1,
      zipCode: sabreData.HotelInfo.LocationInfo.Address.PostalCode,
      location: {
        latitude: sabreData.HotelInfo.LocationInfo.Latitude,
        longitude: sabreData.HotelInfo.LocationInfo.Longitude
      },
      lowestAveragePrice: cri.AverageNightlyRateBeforeTax,
      lowestTotalPrice: cri.AmountBeforeTax,
      lowestAveragePriceAfterTax: cri.AverageNightlyRate,
      lowestTotalPriceAfterTax: cri.AmountAfterTax,
      rooms: [{availableQuantity : 1}],
      petFeePolicy: {
        ...localData.petFeesData,
        totalFees: common.computePetFeePolicyTotalFees(
          args.input.checkIn,
          args.input.checkOut,
          args.input.dogs,
          localData.petFeesData
        )
      },
      starRating: sabreData.HotelInfo.SabreRating
    }

    if (format.dogAmenities[0] === null) {
      format.dogAmenities = []
    }

    formattedData.push(format)
  }

  return formattedData;
}

module.exports = {
  propertiesByCorporateDiscount,
};
