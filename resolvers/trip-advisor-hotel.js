'use strict';
const axios = require('axios');
const mapping = require('../db/data/csv-mapping.json'); 

function dateConvert(date){
    const dateObject     = new Date(date);
    const dateOnlyString = dateObject.toISOString().substr(0, 10);
    return dateOnlyString;
}

function jsonFilterHotelid(id){
    let hotel_id;
    mapping.map(($val)=>{
      if($val['Partner Property ID'] == id){
        hotel_id = $val['TA Property ID'];
      }
    });
    return hotel_id;
}

async function tripHotelList(parent,args,context) {
    console.log('TA hotel price ')
    let urls = global?.config?.tripadvisor?.url ||'https://api.tripadvisor.com/api/partner/3.0/synmeta-pricing'
    let key  = global?.config?.tripadvisor?.key || '2143528E8C854DB291C4E91056A6EA78'
    let remoteAddress = context.request.socket.remoteAddress
    const userAgent = context?.request?.headers['user-agent']

    let queryUrl = urls
    queryUrl += `?key=${key}`;
    queryUrl += `&hotel_ids=${jsonFilterHotelid(args.input.hotel_ids)}`;
    queryUrl += `&hotel_id_type=${args.input.hotel_id_type}`;
    queryUrl += `&check_in=${dateConvert(args.input.checkIn)}`;
    queryUrl += `&check_out=${dateConvert(args.input.checkOut)}`;
    queryUrl += `&ip_address=${remoteAddress}`;
    queryUrl += `&user_agent=${userAgent}`;
    queryUrl += `&num_adults=${args.input.num_adults}`;
    queryUrl += `&num_rooms=${args.input.num_rooms}`;
    queryUrl += `&currency=${args?.input?.currency || "USD"}`;

    try {
        const response = await axios.get(queryUrl);
        return {data: response.data};
    } catch (error) {
        return {data: error.response.data};
    }
}

module.exports = {
    tripHotelList
};