// om namah shivaya

'use strict';

// require scripts
const { DateTime } = require('luxon');
var _ = require('lodash');

const pg = require('../db/postgres/postgres.js');
const sabre = require('../sabre/sabre.js');
const common = require('../sabre/requests/common.js');
const common2 = require('../resolvers/common.js');

async function getSabreRoomReservationAvailabilty(parent, args) {
    let id = ""
    let ids = await pg.getPropertyIdByAlias(args.input.alias);
    id = ids[0].id
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
                            room.featuredImageURL = `${global.config.imageBaseURL
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
                            room.featuredImageURL = `${global.config.imageBaseURL
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

    return {
        "alias": args.input.alias,
        "id": property.id,
        "sabreId": property.sabreId,
        "rooms": property.rooms,
    }
}
module.exports = {
    getSabreRoomReservationAvailabilty,
};
