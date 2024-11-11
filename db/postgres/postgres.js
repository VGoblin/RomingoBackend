
'use strict';

// require scripts
const knex = require('knex')({
  client: 'pg',
  connection: {
    host: global.config.postgres.host,
    port: global.config.postgres.port,
    user: global.config.postgres.username,
    password: global.config.postgres.password,
    database: global.config.postgres.dbName,
  },
  migrations: {
    directory: "./db/migrations"
  },
  debug: process.env.NODE_ENV !== 'production',
});

knex.migrate.latest();
//knex.migrate.down();

const { DateTime } = require('luxon');

async function initializePostgres() {
  try {
    await knex.raw('SELECT 1;');
    console.log('initializePostgres: connected');
  } catch (e) {
    console.error(e);
  }
}

const sendgrid = require('../../sendgrid/sendgrid');

function cities() {
  return knex
    .select(
      'C.id AS cityId',
      'C.name AS cityName',
      'C.center',
      'C.zoom',
      'S.id AS stateId',
      'S.code',
      'S.name AS stateName',
      'CO.id AS countryId',
      'CO.name AS countryName'
    )
    .from('City AS C')
    .where('blocked', false)
    .innerJoin('State AS S', 'C.stateId', 'S.id')
    .innerJoin('Country AS CO', 'S.countryId', 'CO.id')
    .orderBy('cityName');
}

function cityById(id) {
  return knex
    .select(
      'C.id AS cityId',
      'C.name AS cityName',
      'C.center',
      'C.zoom',
      'S.id AS stateId',
      'S.code',
      'S.name AS stateName',
      'CO.id AS countryId',
      'CO.name AS countryName'
    )
    .from('City AS C')
    .where('C.id', id)
    .innerJoin('State AS S', 'C.stateId', 'S.id')
    .innerJoin('Country AS CO', 'S.countryId', 'CO.id')
    .first();
}

async function propertiesByCityId(cityId, allows_big_dogs = 0) {
  let sql = `
  SELECT
  P."id",
  P."sabreId",
  P."desc",
  P."alias",
  P."addressLine1",
  P."name",
  P."imageDirectoryName",
  P."featuredImageFilename",
  P."imageFilenames",
  P."neighborhood",
  P."romingoScore",
  P."googlePlaceId",
  P."listingsPagePromoText",
  P."detailsPagePromoText",
  P."checkoutPagePromoText",
  P."petFeesData",
  P."page_rank",
  P."allows_big_dogs",
  ARRAY_AGG(DA."name") AS "dogAmenities"
  FROM
  "Property" AS P
  LEFT JOIN
  "DogAmenity" AS DA
  ON
  DA."id" = ANY(P."dogAmenities")
  WHERE
  P."cityId" = '${cityId}'`;

  if (allows_big_dogs == 1) {
    sql += `AND P."allows_big_dogs" = ${allows_big_dogs}`;
  }

  sql += `
  AND P."blocked" = false
  GROUP BY
  P."id"
  ORDER BY
  p."page_rank" ASC;
  `;
  const results = await knex.raw(sql);
  return results.rows;
}

async function propertiesByCityIdAndCorporateDiscount(
  cityId,
  corporateDiscount,
  allows_big_dogs = 0
) {
  let sql = `
  SELECT
  P."id",
  P."sabreId",
  P."desc",
  P."alias",
  P."addressLine1",
  P."name",
  P."imageDirectoryName",
  P."featuredImageFilename",
  P."imageFilenames",
  P."neighborhood",
  P."romingoScore",
  P."googlePlaceId",
  P."listingsPagePromoText",
  P."detailsPagePromoText",
  P."checkoutPagePromoText",
  P."petFeesData",
  P."page_rank",
  P."allows_big_dogs",
  ARRAY_AGG(DA."name") AS "dogAmenities"
  FROM
  "Property" AS P
  LEFT JOIN
  "DogAmenity" AS DA
  ON
  DA."id" = ANY(P."dogAmenities")
  WHERE
  P."cityId" = '${cityId}'
  AND P."corporateDiscount" = ${corporateDiscount}`;
  if (allows_big_dogs == 1) {
    sql += ` AND P."allows_big_dogs" = ${allows_big_dogs}`;
  }
  sql += `
  AND P."blocked" = false
  GROUP BY
  P."id"
  ORDER BY
  P."page_rank" ASC;
  `;
  const results = await knex.raw(sql);
  return results.rows;
}

async function propertyById(id) {
  const sql = `
  SELECT
  P."id",
  P."cityId",
  P."addressLine1",
  P."corporateDiscount",
  P."sabreId",
  P."desc",
  P."alias",
  P."page_rank",
  P."neighborhood",
  P."romingoScore",
  ARRAY_AGG(DA."name") AS "dogAmenities",
  P."imageDirectoryName",
  P."featuredImageFilename",
  P."imageFilenames",
  P."googlePlaceId",
  P."listingsPagePromoText",
  P."detailsPagePromoText",
  P."checkoutPagePromoText",
  P."petFeesData"
  FROM
  "Property" AS P
  LEFT JOIN
  "DogAmenity" AS DA
  ON
  DA."id" = ANY(P."dogAmenities")
  WHERE
  P."id" = '${id}'
  AND
  P."blocked" = false
  GROUP BY
  P."id";
  `;
  const results = await knex.raw(sql);
  return results.rows;
}
async function getPropertyIdByAlias(alias) {
  const sql = `SELECT id FROM "Property" WHERE alias = '${alias}'`;
  const results = await knex.raw(sql);
  return results.rows;
}

async function getPropertyDetail(alias) {
  const sql = `SELECT * FROM "Property" WHERE alias = '${alias}'`;
  const results = await knex.raw(sql);
  return results.rows;
}

async function getPropertyDetailById(id) {
  const sql = `SELECT * FROM "Property" WHERE id = '${id}'`;
  const results = await knex.raw(sql);
  return results.rows;
}

async function getPropertyNameById(id) {
  const sql = `SELECT name FROM "Property" WHERE id = '${id}'`;
  const results = await knex.raw(sql);
  return results.rows[0];
}

async function nearbyActivities(latitude, longitude) {
  const sql = `
  SELECT
  A."id" AS "activityId",
  A."name" AS "activityName",
  A."overview",
  A."desc",
  A."addressLine1",
  A."location",
  A."price",
  A."locationGeog" <-> ST_MakePoint(${longitude}, ${latitude}) AS "distanceInMeters",
  AT."id" AS "activityTypeId",
  AT."name" AS "activityTypeName"
  FROM
  "Activity" AS A
  INNER JOIN
  "ActivityType" AS AT
  ON
  A."activityTypeId" = AT."id"
  WHERE
  A."locationGeog" <-> ST_MakePoint(${longitude}, ${latitude}) <= 321869
  ORDER BY
  "distanceInMeters"
  LIMIT 10;
  `;
  const results = await knex.raw(sql);
  return results.rows;
}

function propertyBySabreId(sabreId) {
  return knex
    .select('P.id', 'P.name')
    .from('Property AS P')
    .where('P.sabreId', sabreId)
    .first();
}

function createBooking(
  id,
  propertyId,
  paymentIntentId,
  cardId,
  sabreConfirmationId,
  propertyConfirmationId,
  firstName,
  lastName,
  email,
  mobileCountryCallingCode,
  mobileNumber,
  checkInAtLocal,
  checkOutAtLocal,
  data,
  bookingMethod,
  deadlineLocal,
  customerId,
  captured,
  intentType,
  setupIntentObject,
) {
  let customerChargedStatus;

  if (bookingMethod === 2) {
    customerChargedStatus = 'pending';
  }

  return knex
    .table('Booking')
    .insert({
      id,
      propertyId,
      paymentIntentId,
      cardId,
      sabreConfirmationId,
      propertyConfirmationId,
      firstName,
      lastName,
      email,
      mobileCountryCallingCode,
      mobileNumber,
      checkInAtLocal,
      checkOutAtLocal,
      data,
      bookingMethod,
      deadlineLocal,
      customerId,
      customerChargedStatus,
      captured,
      intentType,
      setupIntentObject
    })
    .returning('id');
}

function bookingList() {
  return knex.select(
   'id', 
   'propertyId',
   'paymentIntentId',
   'cardId',
   'sabreConfirmationId', 
   'propertyConfirmationId', 
   'faunaDocId',
   'firstName', 
   'lastName',
   'email',
   'mobileNumber',
   'checkInAtLocal',
   'checkOutAtLocal',
   'deadlineLocal',
   'data',
   'captured',
   'cancellationFeePrice',
   'intentType',
   'setupIntentObject',
   'customerId',
   'reservationStatus'
   )
   .from('Booking').orderBy("createdAt", "DESC")
}


function paymentCaptured(id) {
  return knex
    .table('Booking')
    .update({
      captured: 1,
      updatedAt: DateTime.utc().toISO(),
    })
    .where('id', id);
}


function updateBookingWithFaunaDocId(id, faunaDocId) {
  return knex
    .table('Booking')
    .update({
      faunaDocId,
      updatedAt: DateTime.utc().toISO(),
    })
    .where('id', id);
}

function updateCharges(transactionId, cardId, amount) {
  const sql = `
  UPDATE
  "Booking"
  SET
  charges = charges || jsonb_build_object(
    'total', (charges -> 'total') :: numeric + ${amount},
    'data', charges -> 'data' || '{"transactionId": "${transactionId}", "amount": ${amount}, "createdAt": "${DateTime.utc().toISO()}"}'
  ),
  "updatedAt" = '${DateTime.utc().toISO()}'
  WHERE
  "cardId" = '${cardId}'
  `;
  return knex.raw(sql);
}

function getBookingByConfirmationId(email, propertyConfirmationId) {
  return knex.select(
    'Booking.id', 
    'Booking.propertyId',
    'Booking.paymentIntentId',
    'Booking.cardId',
    'Booking.sabreConfirmationId', 
    'Booking.propertyConfirmationId', 
    'Booking.faunaDocId',
    'Booking.firstName', 
    'Booking.lastName',
    'Booking.email',
    'Booking.mobileNumber',
    'Booking.checkInAtLocal',
    'Booking.checkOutAtLocal',
    'Booking.deadlineLocal',
    'Booking.data',
    'Booking.captured',
    'Booking.cancellationFeePrice',
    'Booking.intentType',
    'Booking.setupIntentObject',
    'Booking.customerId',
    'Booking.reservationStatus',
    'Property.name as hotelName',
    'Property.addressLine1',
    'Property.zipCode',
    // 'Room.name as roomType'
    )
    .from('Booking')
    .leftJoin('Property', 'Booking.propertyId', 'Property.id')
    // .leftJoin('Room', 'Booking.propertyId', 'Room.propertyId')
    .where({'Booking.propertyConfirmationId': propertyConfirmationId, 'Booking.email': email})
    .orderBy("Booking.createdAt", "DESC")
}

function getBookingByConfirmationIdOnly(propertyConfirmationId) {
  return knex.select(
    'Booking.id', 
    'Booking.propertyId',
    'Booking.paymentIntentId',
    'Booking.cardId',
    'Booking.sabreConfirmationId', 
    'Booking.propertyConfirmationId', 
    'Booking.faunaDocId',
    'Booking.firstName', 
    'Booking.lastName',
    'Booking.email',
    'Booking.mobileNumber',
    'Booking.checkInAtLocal',
    'Booking.checkOutAtLocal',
    'Booking.deadlineLocal',
    'Booking.data',
    'Booking.captured',
    'Booking.cancellationFeePrice',
    'Booking.intentType',
    'Booking.setupIntentObject',
    'Booking.customerId',
    'Booking.reservationStatus',
    'Property.name as hotelName',
    'Property.addressLine1',
    'Property.zipCode',
    // 'Room.name as roomType'
    )
    .from('Booking')
    .leftJoin('Property', 'Booking.propertyId', 'Property.id')
    // .leftJoin('Room', 'Booking.propertyId', 'Room.propertyId')
    .where({'Booking.sabreConfirmationId': propertyConfirmationId})
    .orderBy("Booking.createdAt", "DESC")
}

function getBookingById (id) {
  return knex.select(
    'id', 
    'propertyId',
    'paymentIntentId',
    'cardId',
    'sabreConfirmationId', 
    'propertyConfirmationId', 
    'faunaDocId',
    'firstName', 
    'lastName',
    'email',
    'mobileNumber',
    'checkInAtLocal',
    'checkOutAtLocal',
    'deadlineLocal',
    'data',
    'captured',
    'cancellationFeePrice',
    'intentType',
    'setupIntentObject',
    'customerId',
    'reservationStatus'
    )
    .from('Booking')
    .where('id', id)
    .orderBy("createdAt", "DESC")
}

function adminCreateProperty(
  cityId,
  corporateDiscount,
  sabreId,
  alias,
  page_rank,
  allows_big_dogs,
  name,
  desc,
  addressLine1,
  zipCode,
  neighborhood,
  romingoScore,
  dogAmenities,
  imageDirectoryName,
  featuredImageFilename,
  imageFilenames,
  googlePlaceId,
  listingsPagePromoText,
  detailsPagePromoText,
  checkoutPagePromoText,
  blocked,
  hotelEmail,
  hotelAlternativeEmail
) {
  return knex
    .table('Property')
    .insert({
      cityId,
      corporateDiscount,
      sabreId,
      alias,
      page_rank,
      allows_big_dogs,
      name,
      desc,
      addressLine1,
      zipCode,
      neighborhood,
      romingoScore,
      dogAmenities,
      imageDirectoryName,
      featuredImageFilename,
      imageFilenames,
      googlePlaceId,
      listingsPagePromoText,
      detailsPagePromoText,
      checkoutPagePromoText,
      blocked,
      hotelEmail,
      hotelAlternativeEmail,
    })
    .returning('id');
}

function adminDogAmenities() {
  return knex.select('id', 'name', 'desc').from('DogAmenity').orderBy('name');
}

function adminUpdateProperty(
  id,
  cityId,
  corporateDiscount,
  sabreId,
  name,
  desc,
  addressLine1,
  zipCode,
  neighborhood,
  romingoScore,
  dogAmenities,
  imageDirectoryName,
  featuredImageFilename,
  imageFilenames,
  googlePlaceId,
  listingsPagePromoText,
  detailsPagePromoText,
  checkoutPagePromoText,
  blocked,
  alias,
  page_rank,
  allows_big_dogs,
  hotelEmail,
  hotelAlternativeEmail,
  petFeesData,
) {
  return knex
    .table('Property')
    .update({
      cityId,
      corporateDiscount,
      sabreId,
      name,
      desc,
      addressLine1,
      zipCode,
      neighborhood,
      romingoScore,
      dogAmenities,
      imageDirectoryName,
      featuredImageFilename,
      imageFilenames,
      googlePlaceId,
      listingsPagePromoText,
      detailsPagePromoText,
      checkoutPagePromoText,
      blocked,
      alias,
      page_rank,
      allows_big_dogs,
      hotelEmail,
      hotelAlternativeEmail,
      petFeesData,
      updatedAt: DateTime.utc().toISO(),
    })
    .where('id', id)
    .returning('id');
}

function adminProperties() {
  return knex
    .select('P.id', 'P.name AS propertyName', 'C.name AS cityName')
    .from('Property AS P')
    .innerJoin('City AS C', 'P.cityId', 'C.id')
    .orderBy('propertyName');
}

function adminPropertiesCSV() {
  return knex
    .select('P.id', 
    'P.name AS propertyName', 
    'C.name AS cityName', 
    'S.name AS stateName',
    'CO.name AS countryName',
    'P.addressLine1 AS addressLine1', 
    'P.hotelEmail AS hotelEmail', 
    'P.zipCode AS zipCode',
    )
    .from('Property AS P')
    .innerJoin('City AS C', 'P.cityId', 'C.id')
    .innerJoin('State AS S', 'C.stateId', 'S.id')
    .innerJoin('Country AS CO', 'S.countryId', 'CO.id')
    .orderBy('propertyName');
}

function adminProperty(id) {
  return knex
    .select(
      'id',
      'cityId',
      'corporateDiscount',
      'sabreId',
      'name',
      'desc',
      'addressLine1',
      'zipCode',
      'neighborhood',
      'romingoScore',
      'dogAmenities',
      'imageDirectoryName',
      'featuredImageFilename',
      'imageFilenames',
      'googlePlaceId',
      'listingsPagePromoText',
      'detailsPagePromoText',
      'checkoutPagePromoText',
      'blocked',
      'alias',
      'page_rank',
      'allows_big_dogs',
      'hotelEmail',
      'hotelAlternativeEmail',
      'petFeesData'
    )
    .from('Property')
    .where('id', id)
    .first();
}

function adminRooms(propertyId) {
  return knex
    .select(
      'id',
      'propertyId',
      'sabreNames',
      'sabreTexts',
      'name',
      'areaInSquareFeet',
      'featuredImageFilename',
      'imageFilenames',
      'blocked'
    )
    .from('Room')
    .where('propertyId', propertyId)
    .orderBy('name');
}

function adminRoom(id) {
  return knex
    .select(
      'id',
      'propertyId',
      'sabreNames',
      'sabreTexts',
      'name',
      'areaInSquareFeet',
      'featuredImageFilename',
      'imageFilenames',
      'blocked'
    )
    .from('Room')
    .where('id', id)
    .first();
}

function adminCreateRoom(
  propertyId,
  sabreNames,
  sabreTexts,
  name,
  areaInSquareFeet,
  featuredImageFilename,
  imageFilenames,
  blocked
) {
  return knex
    .table('Room')
    .insert({
      propertyId,
      sabreNames,
      sabreTexts,
      name,
      areaInSquareFeet,
      featuredImageFilename,
      imageFilenames,
      blocked,
    })
    .returning('id');
}

function adminUpdateRoom(
  id,
  propertyId,
  sabreNames,
  sabreTexts,
  name,
  areaInSquareFeet,
  featuredImageFilename,
  imageFilenames,
  blocked
) {
  return knex
    .table('Room')
    .update({
      propertyId,
      sabreNames,
      sabreTexts,
      name,
      areaInSquareFeet,
      featuredImageFilename,
      imageFilenames,
      blocked,
      updatedAt: DateTime.utc().toISO(),
    })
    .where('id', id)
    .returning('id');
}

function roomsByPropertyId(propertyId) {
  return knex
    .select(
      'id',
      'sabreNames',
      'sabreTexts',
      'name',
      'areaInSquareFeet',
      'featuredImageFilename',
      'imageFilenames'
    )
    .from('Room')
    .where('propertyId', propertyId)
    .where('blocked', false);
}

function adminCountries() {
  return knex.select('id', 'name').from('Country').orderBy('name');
}

function adminStates(countryId) {
  return knex
    .select('id', 'code', 'name')
    .from('State')
    .where('countryId', countryId)
    .orderBy('name');
}

function adminCities(stateId) {
  return knex
    .select('id', 'name')
    .from('City')
    .where('stateId', stateId)
    .orderBy('name');
}

function adminCity(id) {
  return knex
    .select(
      'C.id AS cityId',
      'C.name AS cityName',
      'C.center',
      'C.zoom',
      'C.blocked',
      'S.id AS stateId',
      'S.code',
      'S.name AS stateName',
      'CO.id AS countryId',
      'CO.name AS countryName'
    )
    .from('City AS C')
    .where('C.id', id)
    .innerJoin('State AS S', 'C.stateId', 'S.id')
    .innerJoin('Country AS CO', 'S.countryId', 'CO.id')
    .orderBy('cityName')
    .first();
}

function adminCreateCity(stateId, name, latitude, longitude, zoom, blocked) {
  return knex
    .table('City')
    .insert({
      stateId,
      name,
      center: knex.raw(`point(${longitude}, ${latitude})`),
      centerGeog: knex.raw(`ST_MakePoint(${longitude}, ${latitude})`),
      zoom,
      blocked,
    })
    .returning('id');
}

function adminUpdateCity(
  id,
  stateId,
  name,
  latitude,
  longitude,
  zoom,
  blocked
) {
  return knex
    .table('City')
    .update({
      stateId,
      name,
      center: knex.raw(`point(${longitude}, ${latitude})`),
      centerGeog: knex.raw(`ST_MakePoint(${longitude}, ${latitude})`),
      zoom,
      blocked,
      updatedAt: DateTime.utc().toISO(),
    })
    .where('id', id)
    .returning('id');
}

function adminBookingsToCharge() {
  const deadlineLocal = DateTime.now().toUTC().plus({ days: 2 });

  return knex
    .select('id', 'data', 'customerId')
    .from('Booking')
    .where('customerChargedStatus', 'pending')
    .where('deadlineLocal', '<=', deadlineLocal)
    .orderBy('deadlineLocal');
}

function adminUpdateCustomerChargedStatus(
  id,
  customerChargedStatus,
  paymentIntentId,
  customerChargedError
) {
  return knex
    .table('Booking')
    .update({
      customerChargedStatus,
      paymentIntentId,
      customerChargedError,
      updatedAt: DateTime.utc().toISO(),
    })
    .where('id', id);
}

function updatePetFeesData(id, petFeesData) {
  return knex
    .table('Property')
    .update({
      petFeesData,
      updatedAt: DateTime.utc().toISO(),
    })
    .where('id', id);
}

function adminUpdatePropertyTitle(
  id,
  alias
) {
  return knex
    .table('Property')
    .update({
      alias,
      updatedAt: DateTime.utc().toISO(),
    })
    .where('id', id)
    .returning('id');
}

function getHotelEmailById(id) {
  return knex
    .select('hotelEmail', 'hotelAlternativeEmail')
    .from('Property')
    .where('id', id)
    .first();
}

const sendReminder = async (data) => {
  const bookingsData = data.rows;

  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

  if (bookingsData) {
    try {
      const sentTo = []
      for (const bookingData of bookingsData) {
        if (bookingData.reservationStatus === 'cancelled') {
          continue
        }
        const propertyInfo = await getPropertyDetailById(bookingData.propertyId);
        const { hotelEmail, hotelAlternativeEmail, name, addressLine1, zipCode, cityId } = propertyInfo[0];
        const cityDetails = await cityById(cityId);

        const checkInDate = new Date(bookingData.checkInAtLocal);
        const checkOutDate = new Date(bookingData.checkOutAtLocal);

        const emailData = {
          firstName: bookingData.firstName,
          lastName: bookingData.lastName,
          checkIn: checkInDate.toLocaleDateString("en-US", options),
          checkOut: checkOutDate.toLocaleDateString("en-US", options), 
          nightlyRate: `$${bookingData.data.averagePrice} + $${parseInt(bookingData.data.averagePriceAfterTax) - parseInt(bookingData.data.averagePrice)} taxes/fees`,
          totalPrice: `$${bookingData.data.totalPriceAfterTax}`,
          hotelName: `${name} \n\n ${addressLine1} \n\n ${cityDetails.cityName}, ${zipCode}`,
          // roomtype: bookingData.name,
          // confirmationNumber: bookingData.sabreConfirmationId,
          email: bookingData.email,
        }

        if (!sentTo.some(id => id == bookingData.id)) {
          const isEmailSent = await sendgrid.sendBookingReminder(hotelEmail, hotelAlternativeEmail, name, emailData);

          if (isEmailSent) {
            const currentDateTime = DateTime.utc().toISO();
            const updateRow = `Update "Booking" set "isReminderSent" = true, "updatedAt" = '${currentDateTime}' where id = '${bookingData.id}' `
            sentTo.push(bookingData.id)
            knex.raw(updateRow).then(data => console.log({data}))
          }
        } 
      }
    } catch (error) {
     //console.log({error: JSON.stringify(error.response.body)}); 
    }
  }
}
// Cron Job
function sendCheckInReminder() {
  const d = new Date(),
  pstYear = d.toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric"
  }),
  pstMonth = d.toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    month: '2-digit',
  }),
  pstDay = d.toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    day: '2-digit'
  }),
  pstHour = d.toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  //console.log({pstHour});
  if (pstHour >= '08:00:00') {
    //const currentDate = `2022-10-03 00:00:00`;
    const currentDate = `${pstYear}-${pstMonth}-${pstDay} 00:00:00`;
    d.getHours() + ":" + d.getMinutes();
    const checkInDate = `select "Booking"."id", "Booking"."propertyId", "checkInAtLocal","checkOutAtLocal","sabreConfirmationId","data","email", "firstName", "lastName", "reservationStatus", "Room"."id" as "roomId", "Room"."name" from "Booking" inner join "Room" on "Room"."propertyId" = "Booking"."propertyId" where "Booking"."isReminderSent" = false and "Booking"."checkInAtLocal" = '${currentDate}' limit 5`;
    const results =  knex.raw(checkInDate);
    console.log(results)
    // const someData = `select "id", "checkInAtLocal" from "Booking" limit 10`;
    // const someResults = knex.raw(someData)
    // someResults.then(newData => console.log(newData));

    results.then(data => sendReminder(data));
  }
}

function updateBookingPaymentIntent(id, paymentIntentId) {
  return knex
    .table('Booking')
    .update({
      paymentIntentId,
      updatedAt: DateTime.utc().toISO(),
    })
    .where('id', id);
}


function updateBookingBySabreConfirmationId (sabreConfirmationId, status) {
  return knex
    .table('Booking')
    .update({
      reservationStatus: status,
      updatedAt: DateTime.utc().toISO(),
    })
    .where('sabreConfirmationId', sabreConfirmationId)
    .returning('id');
}

function createUser (email, password, isAdmin = false) {
  return knex
    .table('Users')
    .insert({
      email,
      password,
      isAdmin
    })
    .returning(['id', 'email']);
}

function getUser (email) {
  return knex
    .select('id','email', 'password', 'isAdmin')
    .from('Users')
    .where('email', email);
}

function updateTokenForReset (email, token) {
  return knex
    .table('Users')
    .update({
      token: token,
      updatedAt: DateTime.utc().toISO(),
    })
    .where('email', email)
    .returning(['id', 'email', 'token']);
}

function updateUserPassword (userId, newPassword) {
  return knex
    .table('Users')
    .update({
      password: newPassword,
      updatedAt: DateTime.utc().toISO(),
    })
    .where({'id': userId })
    .returning('email');
}

function updateUserProfileById (
  id, name, bio, location
) {
  return knex
    .table('Users')
    .update({
      name,
      bio,
      location,
      updatedAt: DateTime.utc().toISO()
    })
    .where({'id': id})
    .returning([
      'id', 'email', 'name', 'bio', 'location'
    ]);
}

function addPetsData (data) {
  return knex('Pets')
    .insert(data);
}

function getPetsByUserId(id) {
  return knex('Pets').where({ 'userId': id })
}

function getUserProfileData (email) {
  return knex.select(
    'Users.id',
    'Users.email',
    'Users.name',
    'Users.bio',
    'Users.location',
    'Pets.petName',
    'Pets.petDescription',
    'Pets.breedType',
    'Pets.images'
  )
  .from('Users')
  .leftJoin('Pets', 'Users.id', 'Pets.userId')
  .where('Users.email', email);
}

function getHomepageProperties() {
  return knex.raw('select * from "Property" where id in (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
    [
      'fe1300a4-a06f-4347-8d7f-f271b3657ba9', //Manchester Grand Hyatt
      'ba772c6c-7fae-492a-85c0-6232eff50852', //Hilton San Fran
      'e7742fb4-6154-4cd7-b0c6-6b35c0939140', //Mondrain
      '850898b3-0480-42d5-934f-e9b39e68ba43', //Sonesta Downtown Denver
      '862ad750-83c0-4260-8f20-91db6d8b6db3', //Marina Dely Ray LA
      'c4936075-01fa-4a08-89df-9f96a2200c25', //Kimpton Shorebreak Huntington
      '451908c0-87c7-4039-94ed-df57e7586d31', //Mar Monte
      'f89809d5-a8a0-4a42-a51d-bf0a63cf440b', //Hotel Andra Seattle
      '70121c82-354c-4d31-b522-b8fd85ef572f', //Thompson Seattle
      'f557b70f-c2c2-4f37-ba93-bfed37bb13b2', //Hotel Zags Portland
      '18b37d9f-1b3b-49d0-9d87-4c76bfb431af', //HR Mission Bay
      '8f17db8f-b07a-430c-91a0-0221204e53e7', //Intercontinental SD
      '2aede8a7-8843-4ba0-b5bb-84d79f5c01f4', //The Line LA
      'bbf4c8cd-3f62-4822-8b12-9d4d314a9c76', //HR Orange County
    ])
}

function getHomepagePropertiesTwo() {
  return knex.raw('select * from "Property" where id in (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
    [
      'fe1300a4-a06f-4347-8d7f-f271b3657ba9', //Manchester Grand Hyatt
      '4d416654-b64b-437a-8f8f-e0af4ba05d0f', //Westin Bonaventure
      'c6a3ed37-7da7-4552-950f-621185ead919', //Scottsdale Plaza
      'bfae657c-e216-4f18-bc64-da7a8c8aa4e8', //Saguaro Palm Springs
      'ba772c6c-7fae-492a-85c0-6232eff50852', //Hilton San Fran
      '18b37d9f-1b3b-49d0-9d87-4c76bfb431af', //HR Mission Bay

      '983e7040-4633-443e-9092-9eccf6c039ee', //Avalon Palm Springs
      '549ffc8d-75af-4476-8ab6-12170b4d10f3', //Grand Hyatt Vail
      '002d4ff9-b44f-4b66-bedb-623d9cc74373', //El Rey Court
      '8d8ba426-ea1f-4a5f-b80a-d9f1d0e99c78', //Element Colorado Springs DT
      '5626956c-29ae-426d-b2e0-6f4c7749f6e6', //Hyatt at Olive 8
      'e9b3a12d-ba03-460c-80be-720681bea1ea', //Andaz Scottsdale

      '284969d6-4ed9-4e54-afe2-e655a8dfd666', //The Seabird
      '990e0928-6f44-4b6a-8b84-455634a630f1', //Le Meridien Delfina
      'a5d8a0f4-3534-40e9-a8b7-b78c648bfc7e', //Paradise Point
      '2fbcce72-16de-4923-851b-a947caec7916', //Hilton Long Beach
      'bbf4c8cd-3f62-4822-8b12-9d4d314a9c76', //HR Orange County
      '862ad750-83c0-4260-8f20-91db6d8b6db3', //Marina Dely Ray LA
    ])
}

function getHomepagePropertiesThree() {
  return knex.raw('select * from "Property" where id in (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
    [
      'fe1300a4-a06f-4347-8d7f-f271b3657ba9', //Manchester Grand Hyatt
      '4d416654-b64b-437a-8f8f-e0af4ba05d0f', //Westin Bonaventure
      'c6a3ed37-7da7-4552-950f-621185ead919', //Scottsdale Plaza
      'bfae657c-e216-4f18-bc64-da7a8c8aa4e8', //Saguaro Palm Springs
      'ba772c6c-7fae-492a-85c0-6232eff50852', //Hilton San Fran
      'a9456e85-53d0-42dd-accb-fc7a2942376d', //Thompson San Antonio

      '983e7040-4633-443e-9092-9eccf6c039ee', //Avalon Palm Springs
      '549ffc8d-75af-4476-8ab6-12170b4d10f3', //Grand Hyatt Vail
      '002d4ff9-b44f-4b66-bedb-623d9cc74373', //El Rey Court
      '8d8ba426-ea1f-4a5f-b80a-d9f1d0e99c78', //Element Colorado Springs DT
      '5626956c-29ae-426d-b2e0-6f4c7749f6e6', //Hyatt at Olive 8
      'e9b3a12d-ba03-460c-80be-720681bea1ea', //Andaz Scottsdale

      '284969d6-4ed9-4e54-afe2-e655a8dfd666', //The Seabird
      '990e0928-6f44-4b6a-8b84-455634a630f1', //Le Meridien Delfina
      'a5d8a0f4-3534-40e9-a8b7-b78c648bfc7e', //Paradise Point
      '2fbcce72-16de-4923-851b-a947caec7916', //Hilton Long Beach
      'bbf4c8cd-3f62-4822-8b12-9d4d314a9c76', //HR Orange County
      '862ad750-83c0-4260-8f20-91db6d8b6db3', //Marina Dely Ray LA
    ])
}

async function seeAdminUsers() {
  const result = await knex.select(
    'id',
    'email',
    'name',
    'isAdmin',
  )
  .from('Users')
  .where('isAdmin', true);

  console.log(result)
}

// seeAdminUsers()


module.exports = {
  knex,
  initializePostgres,
  cities,
  cityById,
  propertiesByCityId,
  propertiesByCityIdAndCorporateDiscount,
  propertyById,
  nearbyActivities,
  propertyBySabreId,
  createBooking,
  updateBookingWithFaunaDocId,
  updateCharges,
  adminCreateProperty,
  adminDogAmenities,
  adminUpdateProperty,
  adminProperties,
  adminProperty,
  adminRooms,
  adminRoom,
  adminCreateRoom,
  adminUpdateRoom,
  roomsByPropertyId,
  adminCountries,
  adminStates,
  adminCities,
  adminCity,
  adminCreateCity,
  adminUpdateCity,
  adminBookingsToCharge,
  adminUpdateCustomerChargedStatus,
  updatePetFeesData,
  adminUpdatePropertyTitle,
  getPropertyIdByAlias,
  bookingList,
  paymentCaptured,
  getPropertyNameById,
  sendCheckInReminder,
  updateBookingPaymentIntent,
  getPropertyDetail,
  getPropertyDetailById,
  getBookingByConfirmationId,
  updateBookingBySabreConfirmationId,
  getBookingById,
  createUser,
  getUser,
  updateTokenForReset,
  updateUserPassword,
  updateUserProfileById,
  addPetsData,
  getUserProfileData,
  getHomepageProperties,
  getHomepagePropertiesTwo,
  getHomepagePropertiesThree,
  getBookingByConfirmationIdOnly,
  getPetsByUserId,
  adminPropertiesCSV,
};
