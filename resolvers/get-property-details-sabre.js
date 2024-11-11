'use strict';

// require scripts
const { DateTime } = require('luxon');
var _ = require('lodash');

const pg = require('../db/postgres/postgres.js');
const sabre = require('../sabre/sabre.js');
const common = require('../sabre/requests/common.js');
const common2 = require('../resolvers/common.js');

async function getSabrePropertyDetails(parent, args) {
    console.log('get sabre property')

    let id = ""
    let ids = await pg.getPropertyIdByAlias(args.input.alias);
    id = ids[0].id
    let rows = await pg.propertyById(id);
    if (rows.length !== 1) {
        return null;
    }

    const property = rows[0];

    console.log('got property with sabre id ' + property.sabreId)

    try {
        const res = await sabre.propertyDetails(property.sabreId); //'100072570' test sabreId
        const object = res.GetHotelDescriptiveInfoRS.ApplicationResults
        //console.log(object.Error[0].SystemSpecificResults[0].Message)
        const data = res.GetHotelDescriptiveInfoRS.HotelDescriptiveInfos

        const latitude = data.HotelDescriptiveInfo.LocationInfo.Latitude;
        const longitude = data.HotelDescriptiveInfo.LocationInfo.Longitude;
        

        const amenitiesFormatKeys = [];
        const amenities = data.HotelDescriptiveInfo.Amenities.Amenity;
        for (let i = 0; i < amenities.length; i++) {
          const amenity = amenities[i];
          amenitiesFormatKeys.push({
            code: amenity.Code,
            desc: amenity.Description,
            value: amenity.value,
            //free: amenity.ComplimentaryInd,
          });
        }

        let activities = []
        if (latitude && longitude) {
            const rows = await pg.nearbyActivities(
                latitude,
                longitude
            );
            for (let i = 0; i < rows.length; i++) {
              const row = rows[i];
              activities.push({
                id: row.activityId,
                activityType: {
                  id: row.activityTypeId,
                  name: row.activityTypeName,
                },
                name: row.activityName,
                overview: row.overview,
                desc: row.desc,
                addressLine1: row.addressLine1,
                location: {
                  latitude: row.location.y,
                  longitude: row.location.x,
                },
                price: row.price,
                distanceInMeters: row.distanceInMeters,
              });
            }
        }
        
        return {
            alias: args.input.alias,
            sabreId: property.sabreId,
            addressLine1: property.addressLine1,
            amenities: amenitiesFormatKeys,
            location: {
                latitude,
                longitude
            },
            nearbyActivities: activities
        }
    } catch (err) {
        console.log(err)
    }
}
module.exports = {
    getSabrePropertyDetails,
};
