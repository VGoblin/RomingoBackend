'use strict';
const axios = require('axios');

async function tripHotelId(parent,args) {
    let urls = process.env.TRIP_ADVISOR
    let key  = process.env.TRIP_KEY 

    let queryUrl = urls+"/2.0/location/"
        queryUrl +=`/${args.input.hotel_ids}`
        queryUrl +=`?key=${key}`

    try {
        const response = await axios.get(queryUrl);
        return {data: response.data};
    } catch (error) {
        return {data: error.response.data};
    }
}

module.exports = {
    tripHotelId
}