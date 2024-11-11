// om namah shivaya

'use strict';

// require scripts
const { DateTime } = require('luxon');
var _ = require('lodash');

const pg = require('../db/postgres/postgres.js');
const sabre = require('../sabre/sabre.js');
const common = require('./common.js');

function parseData(matchedProperties, data, checkIn, checkOut, dogs, city) {
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
          checkIn,
          checkOut,
          dogs,
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

async function properties(parent, args) {
  let city = await pg.cityById(args.input.cityId);
  let allows_big_dogs = args?.input?.allows_big_dogs || 0;

  if (!city) {
    return [];
  }

  try {
    const propertiesWithout = await pg.propertiesByCityIdAndCorporateDiscount(
      args.input.cityId,
      false,
      allows_big_dogs
    );

    const propertiesWith = await pg.propertiesByCityIdAndCorporateDiscount(
      args.input.cityId,
      true,
      allows_big_dogs
    );

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

    let withoutDiscount = []
    if (propertiesWithout.length > 0) {
      const res = await sabre.properties(
        propertiesWithout.map(property => property.sabreId),
        DateTime.fromJSDate(args.input.checkIn).toUTC().toISODate(),
        DateTime.fromJSDate(args.input.checkOut).toUTC().toISODate(),
        args.input.adults,
        args.input.children,
        false
      );

      const data = res.GetHotelAvailRS.HotelAvailInfos.HotelAvailInfo;
      const matchedProperties = propertiesWithout.filter(property => data.some(obj => obj.HotelInfo.HotelCode === property.sabreId))
      withoutDiscount = parseData(matchedProperties, data, args.input.checkIn, args.input.checkOut, args.input.dogs, city)
    }
  
    let withDiscount = []
    if (propertiesWith.length > 0) {
      const res2 = await sabre.properties(
        propertiesWith.map(property => property.sabreId),
        DateTime.fromJSDate(args.input.checkIn).toUTC().toISODate(),
        DateTime.fromJSDate(args.input.checkOut).toUTC().toISODate(),
        args.input.adults,
        args.input.children,
        true
      );

      const data2 = res2.GetHotelAvailRS.HotelAvailInfos.HotelAvailInfo;
      const matchedProperties2 = propertiesWith.filter(property => data2.some(obj => obj.HotelInfo.HotelCode === property.sabreId))
      withDiscount =  parseData(matchedProperties2, data2, args.input.checkIn, args.input.checkOut, args.input.dogs, city)
    }

    console.log(withDiscount.length)
    console.log(withoutDiscount.length)
  
    return [...withoutDiscount, ...withDiscount]  
    
  } catch  (err) {
    console.log(err)
    return []
  }

}

module.exports = {
  properties,
};
