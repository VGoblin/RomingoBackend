// om namah shivaya

'use strict';

// require scripts
const { DateTime } = require('luxon');

const pg = require('../db/postgres/postgres.js');
const sabre = require('../sabre/sabre.js');
const common = require('../sabre/requests/common.js');
const common2 = require('../resolvers/common.js');

async function property(parent, args) {

  let id = ""
  if (args?.input?.propertyId != "undefined") {
    id = args.input.propertyId;
  }
  else {
    let ids = await pg.getPropertyIdByAlias(args.input.alias);
    id = ids[0].id
  }
  let rows = await pg.propertyById(id);
  if (rows.length !== 1) {
    return null;
  }

  const property = rows[0];

  if (property.dogAmenities[0] === null) {
    property.dogAmenities = [];
  }

  // preparing params for sabre
  const checkIn = DateTime.fromJSDate(args.input.checkIn).toUTC().toISODate();
  const checkOut = DateTime.fromJSDate(args.input.checkOut).toUTC().toISODate();

  // sending request to sabre
  const res = await sabre.property(
    property.sabreId,
    checkIn,
    checkOut,
    args.input.adults,
    args.input.children,
    property.corporateDiscount
  );
  const data = res.GetHotelDetailsRS.HotelDetailsInfo;

  const cri = data.HotelRateInfo.RateInfos.ConvertedRateInfo[0];
  property.lowestAveragePrice = cri.AverageNightlyRateBeforeTax;
  property.lowestTotalPrice = cri.AmountBeforeTax;
  property.lowestAveragePriceAfterTax = cri.AverageNightlyRate;
  property.lowestTotalPriceAfterTax = cri.AmountAfterTax;

  property.name = data.HotelInfo.HotelName;
  property.addressLine1 =
    data.HotelDescriptiveInfo.LocationInfo.Address.AddressLine1;
  property.zipCode = data.HotelDescriptiveInfo.LocationInfo.Address.PostalCode;

  const latitude = data.HotelDescriptiveInfo.LocationInfo.Latitude;
  const longitude = data.HotelDescriptiveInfo.LocationInfo.Longitude;
  if (latitude && longitude) {
    property.location = {
      latitude,
      longitude,
    };
  }

  property.amenities = [];
  const amenities = data.HotelDescriptiveInfo.Amenities.Amenity;
  for (let i = 0; i < amenities.length; i++) {
    const amenity = amenities[i];
    property.amenities.push({
      code: amenity.Code,
      desc: amenity.Description,
      value: amenity.value,
      //free: amenity.ComplimentaryInd,
    });
  }

  property.sabreImageURLs = [];

  const mediaItem = data.HotelMediaInfo?.MediaItems.MediaItem;
  if (mediaItem) {
    for (let i = 0; i < mediaItem.length; i++) {
      property.sabreImageURLs.push(mediaItem[i].ImageItems.Image[0].Url);
    }
  }

  // rooms
  property.rooms = [];
  const jsonRoom = data.HotelRateInfo.Rooms.Room;
  for (let i = 0; i < jsonRoom.length; i++) {
    const room = {};

    room.type = jsonRoom[i].RoomType;
    room.typeCode = jsonRoom[i].RoomTypeCode;
    room.nonSmoking = jsonRoom[i].NonSmoking;

    room.beds = [];
    const jsonBedType = jsonRoom[i].BedTypeOptions?.BedTypes[0]?.BedType;
    if (jsonBedType) {
      for (let j = 0; j < jsonBedType.length; j++) {
        room.beds.push({
          code: jsonBedType[j].Code,
          desc: jsonBedType[j].Description,
          count: jsonBedType[j].Count,
        });
      }
    }

    room.name = jsonRoom[i].RoomDescription?.Name;
    room.desc = jsonRoom[i].RoomDescription?.Text[0];

    room.amenities = [];
    const jsonAmenity = jsonRoom[i].Amenities?.Amenity;
    if (jsonAmenity) {
      for (let j = 0; j < jsonAmenity.length; j++) {
        room.amenities.push({
          code: jsonAmenity[j].Code,
          desc: jsonAmenity[j].Description,
          value: jsonAmenity[j].value,
          accessible: jsonAmenity[j].AccessibleAmenity,
          free: jsonAmenity[j].ComplimentaryInd,
        });
      }
    }

    room.maxOccupants = jsonRoom[i].Occupancy?.Max;

    const jsonRatePlan = jsonRoom[i].RatePlans.RatePlan[0];

    room.availableQuantity = jsonRatePlan.AvailableQuantity;
    room.priceKey = jsonRatePlan.RateKey;

    common.hydrateMeals(jsonRatePlan.MealsIncluded, room);
    common.hydratePrices(jsonRatePlan.ConvertedRateInfo, room);

    // fees
    let json = jsonRatePlan.ConvertedRateInfo.Fees;
    common.hydrateFees(json, room);

    // cancellationPolicy
    json = jsonRatePlan.ConvertedRateInfo.CancelPenalties.CancelPenalty[0];
    common.hydrateCancelationPolicy(json, room, args.input.checkIn);

    // joining sabre rooms with db rooms
    const dbRooms = await pg.roomsByPropertyId(id);

    room.romingoMatch = false;
    room.imageURLs = [];

    for (let x = 0; x < dbRooms.length; x++) {
      const dbRoom = dbRooms[x];

      if (dbRoom.sabreTexts.length > 0) {
        for (let y = 0; y < dbRoom.sabreTexts.length; y++) {
          const sabreText = dbRoom.sabreTexts[y];

          if (sabreText === room.desc) {
            room.romingoMatch = true;
            room.name = dbRoom.name;
            room.areaInSquareFeet = dbRoom.areaInSquareFeet;

            if (dbRoom.featuredImageFilename) {
              room.featuredImageURL = `${
                global.config.imageBaseURL
              }${encodeURIComponent(
                property.imageDirectoryName
              )}/rooms/${encodeURIComponent(dbRoom.featuredImageFilename)}`;
            }

            for (let z = 0; z < dbRoom.imageFilenames.length; z++) {
              room.imageURLs.push(
                `${global.config.imageBaseURL}${encodeURIComponent(
                  property.imageDirectoryName
                )}/rooms/${encodeURIComponent(dbRoom.imageFilenames[z])}`
              );
            }

            break;
          }
        }
      } else if (dbRoom.sabreNames.length > 0) {
        for (let y = 0; y < dbRoom.sabreNames.length; y++) {
          const sabreName = dbRoom.sabreNames[y];

          if (sabreName === room.name) {
            room.romingoMatch = true;
            room.name = dbRoom.name;
            room.areaInSquareFeet = dbRoom.areaInSquareFeet;

            if (dbRoom.featuredImageFilename) {
              room.featuredImageURL = `${
                global.config.imageBaseURL
              }${encodeURIComponent(
                property.imageDirectoryName
              )}/rooms/${encodeURIComponent(dbRoom.featuredImageFilename)}`;
            }

            for (let z = 0; z < dbRoom.imageFilenames.length; z++) {
              room.imageURLs.push(
                `${global.config.imageBaseURL}${encodeURIComponent(
                  property.imageDirectoryName
                )}/rooms/${encodeURIComponent(dbRoom.imageFilenames[z])}`
              );
            }

            break;
          }
        }
      }

      if (room.romingoMatch) {
        break;
      }
    }

    property.rooms.push(room);
  }

  let city = await pg.cityById(property.cityId);
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
  property.city = city;

  property.featuredImageURL = `${
    global.config.imageBaseURL
  }${encodeURIComponent(property.imageDirectoryName)}/${encodeURIComponent(
    property.featuredImageFilename
  )}`;

  property.imageURLs = [];

  for (let i = 0; i < property.imageFilenames.length; i++) {
    property.imageURLs.push(
      `${global.config.imageBaseURL}${encodeURIComponent(
        property.imageDirectoryName
      )}/${encodeURIComponent(property.imageFilenames[i])}`
    );
  }

  // nearby activities
  property.nearbyActivities = [];
  if (property.location) {
    rows = await pg.nearbyActivities(
      property.location.latitude,
      property.location.longitude
    );
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      property.nearbyActivities.push({
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

  // pet fees
  if (property.petFeesData) {
    property.petFeePolicy = property.petFeesData;
    property.petFeePolicy.totalFees = common2.computePetFeePolicyTotalFees(
      args.input.checkIn,
      args.input.checkOut,
      args.input.dogs,
      property.petFeesData
    );
  }

  return property;
}

module.exports = {
  property,
};
