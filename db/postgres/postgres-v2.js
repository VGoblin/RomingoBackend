const { knex } = require('./postgres')
const sabre = require('../../sabre/sabre.js');

function deleteUserById(id) {
 return knex('Users').where('id', id).del()
}

function deleteHotelById(id) {
  return knex('Property').update({ name: 'DELETED'}).where('id', id)
}

function deleteHotelRoomById(id) {
  return knex('Room').where('id', id).del()
}

async function userExists(id) {
  if (id.length < 8) {
    return false
  }
  const result = await knex('Users').where('id', id)
  if (result.length > 0) {
    return true
  }
  return false
}

async function parseData(matchedProperties) {
  const formattedData = []
  for (let i = 0; i < matchedProperties.length; i++) {
    const localData = matchedProperties[i]
    let city = await knex
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
      .where('C.id', localData.cityId)
      .innerJoin('State AS S', 'C.stateId', 'S.id')
      .innerJoin('Country AS CO', 'S.countryId', 'CO.id')
      .first();

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

async function getHotelsByName(name) {
  const result = await knex('Property').where('name', 'ilike', `${name}%`)
  if (result.length > 0) {   
    const hotels = await parseData(result)
    return hotels
  }
  return []
 
}

async function getReservationsByEmail(email, userId) {
  const users = await knex('Users').where('id', userId)
  if (users.length < 1) {
    return []
  }

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
    .where({'Booking.email': email})
    .orderBy("Booking.createdAt", "DESC")
}

async function sabreTest(sabreId) {

  // const res = await sabre.propertyDetailsV4(
  //     sabreId
  //     checkIn,
  //     checkOut,
  //     args.input.adults,
  //     args.input.children,
  //     property.corporateDiscount
  // );
  // const res = await sabre.propertyDetailsV4('100196674', '2023-05-01', '2023-05-02', 1, [], true)//.hotelSearch()

  // const res = await sabre.queryRooms()  sabreId,100804537, 100196674
  // const res = await sabre.property('100196674', '2023-05-01', '2023-05-02', 1, [], true)//.hotelSearch()
  // const res = await sabre.hotelSearch()
  const res = await sabre.test()
  return res
}

module.exports = {
  deleteUserById,
  getReservationsByEmail,
  deleteHotelById,
  deleteHotelRoomById,
  userExists,
  getHotelsByName,
  sabreTest
}