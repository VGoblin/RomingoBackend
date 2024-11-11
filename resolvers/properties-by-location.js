'use strict';

const pg = require('../db/postgres/postgres.js');

function parseData(matchedProperties, city) {
  const formattedData = []
  for (let i = 0; i < matchedProperties.length; i++) {
    const localData = matchedProperties[i]

    let format = {
      ...localData,
      city: city,
      featuredImageURL: `${global.config.imageBaseURL}${encodeURIComponent(localData.imageDirectoryName)}/${encodeURIComponent(localData.featuredImageFilename)}`,
      imageURLs: localData.imageFilenames.map(fileName => `${global.config.imageBaseURL}${encodeURIComponent(localData.imageDirectoryName)}/${encodeURIComponent(fileName)}`),
      petFeePolicy: {
        ...localData.petFeesData,
      },
    }

    formattedData.push(format)
  }

  return formattedData;
}

async function propertiesByLocation(parent, args) {
  let city = await pg.cityById(args.input.cityId);

  if (!city) {
    return [];
  }

  try {
    const propertiesWithout = await pg.propertiesByCityIdAndCorporateDiscount(
      args.input.cityId,
      false,
      0
    );

    const propertiesWith = await pg.propertiesByCityIdAndCorporateDiscount(
      args.input.cityId,
      true,
      0
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

    const withoutDiscount = parseData(propertiesWithout, city)
    const withDiscount =  parseData(propertiesWith, city)
    return [...withoutDiscount, ...withDiscount]  
    
  } catch  (err) {
    console.log(err)
    return []
  }

}

module.exports = {
  propertiesByLocation,
};
