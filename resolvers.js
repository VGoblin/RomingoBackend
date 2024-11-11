// om namah shivaya

'use strict';

// require scripts
const {
  GraphQLDate,
  GraphQLDateTime,
  GraphQLJSON,
} = require('graphql-scalars');

const { hello } = require('./resolvers/hello.js');
const { cities } = require('./resolvers/cities.js');
const { properties } = require('./resolvers/properties.js');
const {
  propertiesByCorporateDiscount,
} = require('./resolvers/properties-by-corporate-discount.js');
const { property } = require('./resolvers/property.js');
const { validatePrice } = require('./resolvers/validate-price.js');
const { createPaymentIntent } = require('./resolvers/create-payment-intent.js');
const { createBooking } = require('./resolvers/create-booking.js');
const {
  createBooking: createBooking2,
} = require('./resolvers/create-booking2');
const { adminCreateProperty } = require('./resolvers/admin-create-property.js');
const { adminDogAmenities } = require('./resolvers/admin-dog-amenities');
const { adminImageDirectory } = require('./resolvers/admin-image-directory.js');
const { adminUpdateProperty } = require('./resolvers/admin-update-property.js');
const { adminProperties } = require('./resolvers/admin-properties.js');
const { adminProperty } = require('./resolvers/admin-property.js');
const { adminRooms } = require('./resolvers/admin-rooms.js');
const { adminRoom } = require('./resolvers/admin-room.js');
const { adminCreateRoom } = require('./resolvers/admin-create-room.js');
const { adminUpdateRoom } = require('./resolvers/admin-update-room.js');
const { adminCountries } = require('./resolvers/admin-countries.js');
const { adminStates } = require('./resolvers/admin-states.js');
const { adminCities } = require('./resolvers/admin-cities.js');
const { adminCity } = require('./resolvers/admin-city.js');
const { adminCreateCity } = require('./resolvers/admin-create-city.js');
const { adminUpdateCity } = require('./resolvers/admin-update-city.js');
const { createSetupIntent } = require('./resolvers/create-setup-intent.js');
const { bookingList } = require('./resolvers/booking-list.js');
const { capturePayment } = require('./resolvers/capture-payment.js');
const { getSabreRoomReservationAvailabilty } = require('./resolvers/get-sabre-room-reservation-availabilty');
const { getPropertyDetails } = require('./resolvers/get-property-details.js');
const { getSabrePropertyDetails } = require('./resolvers/get-property-details-sabre.js');
const { getReservationDetails } =require('./resolvers/get-reservation-details');
const { cancelBooking } = require('./resolvers/cancel-booking');
const { getBookingDetails } = require('./resolvers/get-booking-details');
const { modifyBooking } = require('./resolvers/modify-booking')
const { getHomepageProperties, getHomepagePropertiesTwo, getHomepagePropertiesThree } = require('./resolvers/get-homepage-properities')
const { propertiesByLocation } = require('./resolvers/properties-by-location')
const {tripHotelList} = require('./resolvers/trip-advisor/trip-advisor-hotel');
const {tripHotelId}   = require('./resolvers/trip-advisor/trip-advisor-hotel-id')

const { 
  createUser, 
  loginUser, 
  checkUserForReset, 
  resetUserPassword,
  createUserProfile,
  getUserProfile
} = require('./resolvers/manage-user');


const resolvers = {
  GraphQLDate,
  GraphQLDateTime,
  GraphQLJSON,

  Query: {
    hello,
    cities,
    properties,
    propertiesByCorporateDiscount,
    property,
    validatePrice,
    adminDogAmenities,
    adminImageDirectory,
    adminProperties,
    adminProperty,
    adminRooms,
    adminRoom,
    adminCountries,
    adminStates,
    adminCities,
    adminCity,
    bookingList,
    getSabreRoomReservationAvailabilty,
    getPropertyDetails,
    getSabrePropertyDetails,
    getReservationDetails,
    getBookingDetails,

    loginUser,
    checkUserForReset,
    getUserProfile,

    getHomepageProperties,
    getHomepagePropertiesTwo,
    getHomepagePropertiesThree,
    propertiesByLocation,
    tripHotelList,
    tripHotelId
  },

  Mutation: {
    createPaymentIntent,
    createBooking,
    adminCreateProperty,
    adminUpdateProperty,
    adminCreateRoom,
    adminUpdateRoom,
    adminCreateCity,
    adminUpdateCity,
    createSetupIntent,
    createBooking2,
    capturePayment,
    cancelBooking,
    modifyBooking,

    createUser,
    resetUserPassword,
    createUserProfile
  },
};

module.exports = {
  resolvers,
};
