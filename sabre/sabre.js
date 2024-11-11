'use strict';
var fs = require('fs');

// require scripts
const { DateTime } = require('luxon');
const axios = require('axios').default;

const getHotelAvail = require('./requests/get-hotel-avail.js');
const getHotelDetails = require('./requests/get-hotel-details.js');
const getHotelDetailsv2 = require('./requests/get-hotel-details-v2.js');
const getHotelContentv4 = require('./requests/get-hotel-content-v4.js');
const hotelPriceCheckHelper = require('./requests/hotel-price-check.js');
const createBookingHelper = require('./requests/create-booking.js');
const getBookingHelper = require('./requests/get-booking.js');
const { chainCodes, validCityCodes } = require('./chain-codes.js')

let tokenRefreshedTime = DateTime.fromISO('1970-01-01T00:00:00Z');
let token;

async function initialize() {
  await refreshTokenIfRequired();
}

async function refreshTokenIfRequired() {
  const diffInSeconds = DateTime.now().diff(
    tokenRefreshedTime,
    'seconds'
  ).seconds;

  const tokenRefreshIntervalInSeconds =
    global.config.sabre.tokenRefreshIntervalInSeconds;

  if (diffInSeconds <= tokenRefreshIntervalInSeconds) {
    return;
  }

  // refresh token
  const usernameBase64 = toBase64(global.config.sabre.username);
  const passwordBase64 = toBase64(global.config.sabre.password);
  const secretBase64 = toBase64(`${usernameBase64}:${passwordBase64}`);
  const authorization = `Basic ${secretBase64}`;

  const url = `${global.config.sabre.baseURL}/v2/auth/token`;
  const data = 'grant_type=client_credentials';
  const config = {
    headers: {
      authorization,
      'content-type': 'application/x-www-form-urlencoded',
    },
  };
  const res = await axios.post(url, data, config);

  token = res.data.access_token;
  tokenRefreshedTime = DateTime.now();

  // if (process.env.NODE_ENV !== 'production') {
  console.log(token);
  // }

  console.log('refreshTokenIfRequired: sabre token refreshed');
}

function toBase64(data) {
  return Buffer.from(data).toString('base64');
}

async function properties(
  sabreIds,
  checkIn,
  checkOut,
  adults,
  children,
  corporateDiscount
) {
  await refreshTokenIfRequired();

  const url = `${global.config.sabre.baseURL}/v4.0.0/get/hotelavail`;
  const data = getHotelAvail.request(
    sabreIds,
    checkIn,
    checkOut,
    adults,
    children,
    corporateDiscount
  );
  const config = {
    headers: {
      'accept-encoding': 'gzip, deflate, br',
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
  };
  const res = await axios.post(url, data, config);

  console.log(data);
  // console.log(JSON.stringify(res.data));

  return res.data;
}

async function property(
  sabreId,
  checkIn,
  checkOut,
  adults,
  children,
  corporateDiscount
) {
  await refreshTokenIfRequired();

  const url = `${global.config.sabre.baseURL}/v3.0.0/get/hoteldetails`;
  const data = getHotelDetails.request(
    sabreId,
    checkIn,
    checkOut,
    adults,
    children,
    corporateDiscount
  );
  const config = {
    headers: {
      'accept-encoding': 'gzip, deflate, br',
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
  };
  const res = await axios.post(url, data, config);

  console.log(data);
  // console.log(JSON.stringify(res.data));

  return res.data;
}

async function propertyDetails(
  sabreId,
  corporateDiscount
) {
  await refreshTokenIfRequired();

  const url = `${global.config.sabre.baseURL}/v3.0.0/get/hoteldescriptiveinfo`;
  const data = getHotelDetailsv2.request(sabreId);
  const config = {
    headers: {
      'accept-encoding': 'gzip, deflate, br',
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
  };
  const res = await axios.post(url, data, config);

  return res.data;
}

async function validatePrice(priceKey) {
  await refreshTokenIfRequired();

  const url = `${global.config.sabre.baseURL}​/v4.0.0/hotel/pricecheck`;
  const data = hotelPriceCheckHelper.computeRequestPayload(priceKey);
  const config = {
    headers: {
      'accept-encoding': 'gzip, deflate, br',
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
  };
  let res = await axios.post(url, data, config);
  res = hotelPriceCheckHelper.parseResponse(res.data);

  return res;
}

async function createBooking(
  email,
  mobile,
  bookingKey,
  adults,
  children,
  card,
  paymentPolicy
) {
  await refreshTokenIfRequired();

  const url = `${global.config.sabre.baseURL}​/v1/trip/orders/createBooking`;
  const data = createBookingHelper.computeRequestPayload(
    email,
    mobile,
    bookingKey,
    adults,
    children,
    card,
    paymentPolicy
  );
  const config = {
    headers: {
      'accept-encoding': 'gzip, deflate, br',
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
  };
  let res = await axios.post(url, data, config);
  res = createBookingHelper.parseResponse(res.data);

  return res;
}

async function getBooking(sabreConfirmationId) {
  await refreshTokenIfRequired();

  const url = `${global.config.sabre.baseURL}/v1/trip/orders/getBooking`;
  const data = getBookingHelper.computeRequestPayload(sabreConfirmationId);
  const config = {
    headers: {
      'accept-encoding': 'gzip, deflate, br',
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
  };
  let res = await axios.post(url, data, config);
  res = getBookingHelper.parseResponse(res.data);

  return res;
}

async function cancelBooking (payloads) {
  await refreshTokenIfRequired();
  const url = `${global.config.sabre.baseURL}/v1/trip/orders/cancelBooking`;
  const data = payloads
  const config = {
    headers: {
      'accept-encoding': 'gzip, deflate, br',
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
  };
  let res = await axios.post(url, data, config);

  return res;
}

async function propertyDetailsV4 (sabreId) {
  await refreshTokenIfRequired();

  const url = `${global.config.sabre.baseURL}/v4.0.0/get/hotelcontent`;
  const data = getHotelContentv4.request(sabreId);
  const config = {
    headers: {
      'accept-encoding': 'gzip, deflate, br',
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
  };
  let res = await axios.post(url, data, config);

  return res?.data
}

async function queryRooms () {
  await refreshTokenIfRequired();

  let url = 'https://services-c1.synxis.com/v1/api/hotel/rooms'
   url += `?chainId=12723`
   url += `&hotelId=100382130`

 const config = {
   headers: {
     authorization: `Bearer ${token}`,
     'content-type': 'application/json',
   },
 };
   let res = await axios.get(url, config);

}

async function hotelSearch() {
  await refreshTokenIfRequired();
  const url = `${global.config.sabre.baseURL}/v2.0.0/hotel/search`;
  const data = {
    "HotelSearchRQ": {
        POS: {
          Source: {
            PseudoCityCode: global.config.sabre.pcc,
          },
        },
        "SearchCriteria": {
          HotelPref: {
            AmenityCodes: {
              AmenityCode: [
                224 //Pets-allowed amenity code
              ]
            },
          },
          "GeoSearch": {
            "GeoRef": {
              "Radius": 200,
              "UOM": "MI",
              AddressRef: {
                CountryCode: "US"
              },
              // GeoCode: {
              //   "Latitude": 32.758,
              //   "Longitude": -97.08           
              // }
     
            },
            "GeoAttributes": {
              "Attributes": [
                {
                  "Name": "LOCALAREA",
                  "Value": "KRAKOW AREA"
                }
              ]
            }
          },
        }
      }
    }
  const config = {
    headers: {
      'accept-encoding': 'gzip, deflate, br',
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
  };
  let res = await axios.post(url, JSON.stringify(data), config);
  return res?.data

}

async function hotelMedia() {
  await refreshTokenIfRequired();
  const url = `${global.config.sabre.baseURL}/v1.0.0/shop/hotels/media`;
  const data = {
    "GetHotelMediaRQ": {
      "HotelRefs": {
           "HotelRef": [
             {
               "HotelCode": "426",
               "CodeContext": "Sabre",
               "ImageRef": {
                 "MaxImages": "20",
                 "Images": {
                   "Image": [
                     {
                       "Type": "SMALL"
                     }
                   ]
                 },
                 "Categories": {
                   "Category": [
                     // {
                     //   "Code": 2
                     // },
                     // {
                     //   "Code": 3
                     // },
                     // {
                     //   "Code": 4 restaurant
                     // },
                     // {
                     //   "Code": 5
                     // }
                   ]
                 },
                 "AdditionalInfo": {
                   "Info": [
                     {
                       "Type": "CAPTION",
                       "content": true
                     }
                   ]
                 },
                 "Languages": {
                   "Language": [
                     {
                       "Code": "EN"
                     }
                   ]
                 }
               }
             }
           ]
         }
       }
    }
  const config = {
    headers: {
      'accept-encoding': 'gzip, deflate, br',
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
  };
  let res = await axios.post(url, JSON.stringify(data), config);
  return res?.data
}

async function delay() {
    return new Promise(resolve => {resolve()})
}

async function test() {
  await refreshTokenIfRequired();
  const url = `${global.config.sabre.baseURL}/v4.0.0/get/hotellist`;

  let hotels = []
  for (let i = 0; i < chainCodes.length; i++) {
    const chainCode = chainCodes[i]
    //https://developer.sabre.com/docs/rest_apis/hotel/search/get_hotel_list/reference-documentation
    const data = {
      "GetHotelListRQ": {
        "POS": {
          "Source": {
            PseudoCityCode: global.config.sabre.pcc,
          }
        },
        // "HotelRefs": {
        //   "HotelRef": [
        //     {
        //       "HotelCode": "100072188",
        //       "CodeContext": "GLOBAL"
        //     }
        //   ]
        // },
        "HotelPref": {
          // "HotelName": "Inn",
          // "BrandCodes": {
          //   "BrandCode": [
          //     "10008",
          //     "10009"
          //   ]
          // },
          "ChainCodes": {
            "ChainCode": [
              chainCode
              // "YX"
            ]
          },
          "AmenityCodes": {
            "Inclusive": false,
            "AmenityCode": [
              224
            ]
          },

        },
        "HotelInfoRef": {
          "Amenities": false,
          "LocationInfo": true,
          "PropertyTypeInfo": false,
          "PropertyQualityInfo": false,
          "SecurityFeatures": false
        }
      }
    }
    const config = {
      headers: {
        'accept-encoding': 'gzip, deflate, br',
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
    };
    let res = await axios.post(url, JSON.stringify(data), config);
    console.log(i)
    console.log(chainCode)
    console.log(res?.data?.GetHotelListRS.HotelInfos.MaxSearchResults)
    // console.log(res.data.GetHotelListRS.HotelInfos.HotelInfo)
    console.log('****')
    const usaBasedHotels = res?.data?.GetHotelListRS.HotelInfos.HotelInfo.filter(hotel => 
      validCityCodes.indexOf(hotel.LocationInfo.Address.CityName.CityCode) > -1 
    )

    hotels.push(...usaBasedHotels)
    await delay(2000)
    // break;
  }
  
  const jsonString = JSON.stringify(hotels)
  fs.writeFile('./sabre-hotels.json', jsonString, err => {
      if (err) {
          console.log('Error writing file', err)
      } else {
          console.log('Successfully wrote file')
      }
  })


  return hotels
}

module.exports = {
  initialize,
  properties,
  property,
  propertyDetails,
  validatePrice,
  createBooking,
  getBooking,
  cancelBooking,
  propertyDetailsV4,
  queryRooms,
  hotelSearch,
  hotelMedia,
  test
};
