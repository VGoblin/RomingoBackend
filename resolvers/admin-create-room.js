// om namah shivaya

'use strict';

// require scripts
const pg = require('../db/postgres/postgres.js');

async function adminCreateRoom(parent, args) {
  const sabreNames = args.input.sabreNames;
  const sabreTexts = args.input.sabreTexts;

  if (sabreNames.length === 0 && sabreTexts.length === 0) {
    throw 'Both, sabreNames and sabreTexts cannot be empty';
  }

  if (sabreNames.length > 0 && sabreTexts.length > 0) {
    throw 'Both, sabreNames and sabreTexts cannot contain values';
  }

  const rooms = await pg.adminRooms(args.input.propertyId);

  if (sabreNames.length > 0) {
    // checking for duplicates within the original input
    for (let i = 0; i < sabreNames.length; i++) {
      for (let j = i + 1; j < sabreNames.length; j++) {
        if (sabreNames[i] === sabreNames[j]) {
          throw `Duplicate sabreName ${sabreNames[i]} found in the input`;
        }
      }
    }

    // checking for duplicates within the db
    for (let i = 0; i < sabreNames.length; i++) {
      for (let j = 0; j < rooms.length; j++) {
        for (let k = 0; k < rooms[j].sabreNames.length; k++) {
          if (sabreNames[i] === rooms[j].sabreNames[k]) {
            throw `sabreName ${sabreNames[i]} already exists in the DB`;
          }
        }
      }
    }
  } else {
    // checking for duplicates within the original input
    for (let i = 0; i < sabreTexts.length; i++) {
      for (let j = i + 1; j < sabreTexts.length; j++) {
        if (sabreTexts[i] === sabreTexts[j]) {
          throw `Duplicate sabreText ${sabreTexts[i]} found in the input`;
        }
      }
    }

    // checking for duplicates within the db
    for (let i = 0; i < sabreTexts.length; i++) {
      for (let j = 0; j < rooms.length; j++) {
        for (let k = 0; k < rooms[j].sabreTexts.length; k++) {
          if (sabreTexts[i] === rooms[j].sabreTexts[k]) {
            throw `sabreText ${sabreTexts[i]} already exists in the DB`;
          }
        }
      }
    }
  }

  const [id] = await pg.adminCreateRoom(
    args.input.propertyId,
    sabreNames,
    sabreTexts,
    args.input.name,
    args.input.areaInSquareFeet,
    args.input.featuredImageFilename,
    args.input.imageFilenames,
    args.input.blocked
  );

  return {
    id,
  };
}

module.exports = {
  adminCreateRoom,
};
