// om namah shivaya

'use strict';

// require scripts
const { gql } = require('apollo-server-express');

const typeDefs = gql`
  scalar GraphQLDate
  scalar GraphQLDateTime
  scalar GraphQLJSON

  type Query {
    hello(input: HelloInput!): Hello!
    cities: [City!]!
    properties(input: PropertiesInput!): [Property!]!
    propertiesByCorporateDiscount(input: PropertiesInput!): [Property!]!
    property(input: PropertyInput!): Property
    validatePrice(input: ValidatePriceInput!): ValidatePriceResponse!
    adminDogAmenities: [DogAmenity!]!
    adminImageDirectory(input: AdminImageDirectoryInput!): Directory!
    adminProperties: [Property!]!
    adminProperty(input: AdminPropertyInput!): AdminProperty
    adminRooms(input: AdminRoomsInput!): [AdminRoom!]!
    adminRoom(input: AdminRoomInput!): AdminRoom
    adminCountries: [Country!]!
    adminStates(input: AdminStatesInput!): [State!]!
    adminCities(input: AdminCitiesInput!): [City!]!
    adminCity(input: AdminCityInput!): City
    bookingList: [Booking]
    getSabreRoomReservationAvailabilty(input: GetAvailableRoomsInput!): Property
    getPropertyDetails(input: GetPropertyDetailInput!): Property
    getSabrePropertyDetails(input: GetSabreHotelInput!): SabreHotelDetails
    getReservationDetails(input: GetReservationDetailsInput!): [Booking]
    getBookingDetails(input: GetBookingDetailsInput!): [Booking]
    loginUser(input: CreateUserInput!): User
    checkUserForReset(input: checkUserForResetInput!): CheckUserForResetResponse
    getUserProfile(input: checkUserForResetInput!): UserProfile
    getHomepageProperties: [Property]
    getHomepagePropertiesTwo: [Property]
    getHomepagePropertiesThree: [Property]
    propertiesByLocation(input: CityId!): [Property]
    tripHotelList(input: TripHotelInput!): TripHotelList!
    tripHotelId(input: TripHotelIdInput!): TripHotelId!
  }

  type Mutation {
    createPaymentIntent(
      input: CreatePaymentIntentInput!
    ): CreatePaymentIntentResponse!
    createBooking(input: CreateBookingInput!): CreateBookingResponse!
    adminCreateProperty(input: AdminCreatePropertyInput!): Property
    adminUpdateProperty(input: AdminUpdatePropertyInput!): Property
    adminCreateRoom(input: AdminCreateRoomInput!): AdminRoom
    adminUpdateRoom(input: AdminUpdateRoomInput!): AdminRoom
    adminCreateCity(input: AdminCreateCityInput!): City
    adminUpdateCity(input: AdminUpdateCityInput!): City
    createSetupIntent(
      input: CreateSetupIntentInput!
    ): CreateSetupIntentResponse!
    createBooking2(input: CreateBooking2Input!): CreateBookingResponse!
    capturePayment(input: CapturePaymentInput!): ResponsePayment!
    cancelBooking(input: CancelBookingInput!): CancelBookingResponse
    modifyBooking(input: ModifyBookingInput!): [Booking]
    createUser(input: CreateUserInput!): User
    resetUserPassword(input: ResetUserPasswordInput!): CheckUserForResetResponse
    createUserProfile(input: createUserProfileInput!): UserProfile
  }

  input CreateUserInput {
    email: String!
    password: String!
  }

  input checkUserForResetInput {
    email: String!
    id: String
  }

  input ResetUserPasswordInput {
    userId: String!
    newPassword: String!
  }

  input createUserProfileInput {
    userId: String!
    name: String
    bio: String
    location: String
    pets: [PetsInput]
  }

  input PetsInput {
    petName: String
    petDescription: String
    breedType: String
    images: GraphQLJSON
  }

  type User {
    id: String!
    email: String!
    isAdmin: Boolean
  }

  type CheckUserForResetResponse {
    status: Int
    message: String
  }

  type UserProfile {
    id: String
    email: String
    name: String
    bio: String
    location: String
    pets: [Pets]
  }

  type Pets {
    petName: String
    petDescription: String
    breedType: String
    images: GraphQLJSON
  }

  input HelloInput {
    name: String!
  }

  input TripHotelInput{
    hotel_ids:String!
    hotel_id_type:String
    checkIn: GraphQLDate!
    checkOut: GraphQLDate!
    num_adults:String
    num_rooms:String
    currency:String
  }

  type Offers {
    availability: String
    displayName: String
    displayPrice: String
    price: Int
    logo: String
    clickUrl: String
  }
  
  type Results {
    hotelId: String
    strikeThroughDisplayPrice: String
    availability: String
    offers: [Offers]
  }
  
  type Success {
    requestId: String
    results: [Results]
    pricingType:String
    isComplete:String
    invalidHotelIds: [String]
  }

  type TripHotelList{
    success:Boolean
    error_msg:String
    data:Success
  }

  input TripHotelIdInput{
    hotel_ids:String!
  }

  type TripAdvisorHotelId{
    location_id:String
  }

  type TripHotelId{
    data:TripAdvisorHotelId
  }

  input PropertiesInput {
    cityId: String!
    checkIn: GraphQLDate!
    checkOut: GraphQLDate!
    adults: Int!
    children: [ChildInput!]!
    dogs: Int!
    allows_big_dogs:Int
  }

  input ChildInput {
    age: Int!
  }

  input PropertyInput {
    propertyId: String!
    checkIn: GraphQLDate!
    checkOut: GraphQLDate!
    adults: Int!
    children: [ChildInput!]!
    dogs: Int!
    alias: String
    page_rank:Int
  }

  type Hello {
    message: String!
  }

  type City {
    id: String!
    name: String!
    center: GeoPoint!
    zoom: Int
    blocked: Boolean!
    state: State!
  }

  type GeoPoint {
    latitude: Float!
    longitude: Float!
  }


  type State {
    id: String!
    code: String!
    name: String!
    country: Country!
  }

  type Country {
    id: String!
    name: String!
  }

  type Property {
    id: String
    sabreId: String
    name: String
    desc: String
    addressLine1: String
    city: City
    zipCode: String
    location: GeoPoint
    neighborhood: String
    romingoScore: Float
    dogAmenities: [String!]
    amenities: [Amenity!]
    featuredImageURL: String
    imageURLs: [String!]
    sabreImageURLs: [String!]
    lowestAveragePrice: Float
    lowestTotalPrice: Float
    lowestAveragePriceAfterTax: Float
    lowestTotalPriceAfterTax: Float
    rooms: [Room!]
    nearbyActivities: [Activity!]
    googlePlaceId: String
    listingsPagePromoText: String
    detailsPagePromoText: String
    checkoutPagePromoText: String
    petFeePolicy: PetFeePolicy
    alias: String
    page_rank: Int
    allows_big_dogs: Int
    hotelEmail: String
    hotelAlternativeEmail: String
    starRating: String
  }

  type Amenity {
    code: Int
    desc: String
    value: String
    accessible: Boolean
    free: Boolean
  }

  type Room {
    type: String
    typeCode: Int
    nonSmoking: Boolean
    beds: [Bed!]!
    desc: String
    amenities: [Amenity!]!
    maxOccupants: Int
    priceKey: String!
    breakfastIncluded: Boolean
    lunchIncluded: Boolean
    dinnerIncluded: Boolean
    averagePrice: Float!
    totalPrice: Float!
    averagePriceAfterTax: Float!
    totalPriceAfterTax: Float!
    totalFees: Float
    fees: [Fee!]!
    feesIncluded: Boolean
    cancelationPolicy: CancelationPolicy!
    availableQuantity: Int
    romingoMatch: Boolean!
    name: String
    areaInSquareFeet: Int
    featuredImageURL: String
    imageURLs: [String!]!
  }

  type Bed {
    code: Int
    desc: String
    count: Int
  }

  type Fee {
    amount: Float!
    desc: String!
  }

  type CancelationPolicy {
    cancelable: Boolean!
    deadlineLocal: String
    deadlineUnit: String
    deadlineMultiplier: Int
    deadlineReference: String
    desc: String
  }

  type Activity {
    id: String!
    activityType: ActivityType!
    name: String!
    overview: String!
    desc: String!
    addressLine1: String!
    location: GeoPoint!
    price: Int!
    distanceInMeters: Float!
  }

  type ActivityType {
    id: Int!
    name: String!
  }

  input ValidatePriceInput {
    priceKey: String!
  }

  type ValidatePriceResponse {
    priceChanged: Boolean!
    priceDifference: Float!
    totalPriceAfterTax: Float!
  }

  input CreatePaymentIntentInput {
    priceKey: String!
  }

  type CreatePaymentIntentResponse {
    priceChanged: Boolean
    priceDifference: Float
    totalPriceAfterTax: Float
    paymentIntent: PaymentIntent
  }

  type PaymentIntent {
    id: String!
    amount: Float!
    clientSecret: String!
  }

  input CreateBookingInput {
    paymentIntentId: String!
    email: String!
    mobile: CreateBookingMobileInput!
    adults: [CreateBookingAdultInput!]!
    children: [CreateBookingChildInput!]!
    noOfDogs: Int!
  }

  input CreateBookingMobileInput {
    countryCallingCode: Int!
    number: String!
  }

  input CreateBookingAdultInput {
    firstName: String!
    lastName: String!
  }

  input CreateBookingChildInput {
    firstName: String!
    lastName: String!
    age: Int!
  }

  type CreateBookingResponse {
    priceChanged: Boolean
    priceDifference: Float
    totalPriceAfterTax: Float
    booking: Booking!
  }

  input GetAvailableRoomsInput {
    alias: String!
    checkIn: GraphQLDate!
    checkOut: GraphQLDate!
    adults: Int!
    children: [ChildInput!]!
    dogs: Int!
  }

  input GetReservationDetailsInput {
    email: String!
    propertyConfirmationId: String!
  }

  input GetBookingDetailsInput {
    id: String
  }
  
  input GetPropertyDetailInput {
    alias: String!
  }

  type Booking {
    id: String
    propertyId: String
    paymentIntentId: String
    cardId: String
    sabreConfirmationId: String
    propertyConfirmationId: String
    faunaDocId: String
    firstName: String
    lastName: String
    email: String
    mobileNumber: String
    checkInAtLocal: String
    checkOutAtLocal: String
    deadlineLocal: String
    data:GraphQLJSON
    hotel: Hotel
    captured: Int!
    cancellationFeePrice: Float
    intentType: String
    setupIntentObject: GraphQLJSON
    customerId: String
    reservationStatus: String
  }

  type Hotel { 
    name: GraphQLJSON
    address: String
    zipCode: Int
  }

  input AdminCreatePropertyInput {
    cityId: String!
    corporateDiscount: Boolean!
    sabreId: String!
    alias: String
    page_rank:Int!
    allows_big_dogs:Int!
    name: String!
    desc: String!
    addressLine1: String!
    zipCode: String!
    neighborhood: String!
    romingoScore: Float!
    dogAmenities: [Int!]!
    imageDirectoryName: String!
    featuredImageFilename: String!
    imageFilenames: [String!]!
    googlePlaceId: String
    listingsPagePromoText: String
    detailsPagePromoText: String
    checkoutPagePromoText: String
    blocked: Boolean!
    hotelEmail: String
    hotelAlternativeEmail: String
  }

  type DogAmenity {
    id: Int!
    name: String!
    desc: String!
  }

  type Directory {
    name: String!
    directories: [Directory!]!
    files: [File!]!
  }

  type File {
    name: String!
  }

  input AdminImageDirectoryInput {
    name: String!
    rooms: Boolean!
  }

  input AdminUpdatePropertyInput {
    id: String!
    cityId: String!
    corporateDiscount: Boolean!
    sabreId: String!
    name: String!
    desc: String!
    addressLine1: String!
    zipCode: String!
    neighborhood: String!
    romingoScore: Float!
    dogAmenities: [Int!]!
    imageDirectoryName: String!
    featuredImageFilename: String!
    imageFilenames: [String!]!
    googlePlaceId: String
    listingsPagePromoText: String
    detailsPagePromoText: String
    checkoutPagePromoText: String
    blocked: Boolean!
    alias:String
    page_rank:Int
    allows_big_dogs:Int
    hotelEmail: String
    hotelAlternativeEmail: String
    petFeesData: String
  }

  input AdminPropertyInput {
    id: String!
  }

  type AdminProperty {
    id: String!
    cityId: String!
    corporateDiscount: Boolean!
    sabreId: String!
    name: String!
    desc: String!
    addressLine1: String!
    zipCode: String!
    neighborhood: String!
    romingoScore: Float!
    dogAmenities: [Int!]!
    imageDirectoryName: String!
    featuredImageFilename: String!
    imageFilenames: [String!]!
    googlePlaceId: String
    listingsPagePromoText: String
    detailsPagePromoText: String
    checkoutPagePromoText: String
    blocked: Boolean!
    alias:String!
    page_rank: Int!
    allows_big_dogs: Int!
    hotelEmail: String
    hotelAlternativeEmail: String
    petFeesData: GraphQLJSON
  }

  input AdminRoomsInput {
    propertyId: String!
  }

  input AdminRoomInput {
    id: String!
  }

  input AdminCreateRoomInput {
    propertyId: String!
    sabreNames: [String!]!
    sabreTexts: [String!]!
    name: String!
    areaInSquareFeet: Int
    featuredImageFilename: String
    imageFilenames: [String!]!
    blocked: Boolean!
  }

  input AdminUpdateRoomInput {
    id: String!
    propertyId: String!
    sabreNames: [String!]!
    sabreTexts: [String!]!
    name: String!
    areaInSquareFeet: Int
    featuredImageFilename: String
    imageFilenames: [String!]!
    blocked: Boolean!
  }

  type AdminRoom {
    id: String!
    propertyId: String!
    sabreNames: [String!]!
    sabreTexts: [String!]!
    name: String!
    areaInSquareFeet: Int
    featuredImageFilename: String
    imageFilenames: [String!]!
    blocked: Boolean!
  }

  input AdminStatesInput {
    countryId: String!
  }

  input AdminCitiesInput {
    stateId: String!
  }

  input AdminCityInput {
    id: String!
  }

  input AdminCreateCityInput {
    stateId: String!
    name: String!
    center: GeoPointInput!
    zoom: Int!
    blocked: Boolean!
  }

  input GeoPointInput {
    latitude: Float!
    longitude: Float!
  }

  input AdminUpdateCityInput {
    id: String!
    stateId: String!
    name: String!
    center: GeoPointInput!
    zoom: Int!
    blocked: Boolean!
  }

  input CreateSetupIntentInput {
    email: String!
  }

  type CreateSetupIntentResponse {
    customerId: String!
    clientSecret: String!
  }

  input CancelBookingInput {
    confirmationId: String!
    cancelAll: Boolean
  }

  input ModifyBookingInput {
    sabreConfirmationId: String!
    email: String
    mobile: Int
    priceKey: String
    adults: [CreateBookingAdultInput!]!
    children: [CreateBookingChildInput!]!
    cardId: String
  }

  type CancelBookingResponse {
    status: Boolean
  }

  input CapturePaymentInput {
    id: String!
    amount: String
    customerId: String
    paymentMethodId: String
  }

  type ResponsePayment {
       status:String!
       statusCode: Int!
  }

  input CreateBooking2Input {
    priceKey: String!
    customerId: String!
    paymentIntentId: String!
    email: String!
    mobile: CreateBookingMobileInput!
    adults: [CreateBookingAdultInput!]!
    children: [CreateBookingChildInput!]!
    noOfDogs: Int!
    intentType: String
    setupIntentObject: GraphQLJSON
    utmSource: String
    utmMedium: String
  }

  type PetFeePolicy {
    maxPets: Int
    maxWeightPerPetInLBS: Int
    desc: String
    perPet: Boolean
    perNight: Boolean
    breakup: GraphQLJSON
    totalFees: Float
  }

  type SabreHotelDetails {
    alias: String
    sabreId: String
    addressLine1: String
    amenities: [Amenity]
    location: GeoPoint
    nearbyActivities: [Activity]
  }

  input GetSabreHotelInput {
    alias: String!
  }

  input CityId {
    cityId: String!
  }

`;

module.exports = {
  typeDefs,
};
