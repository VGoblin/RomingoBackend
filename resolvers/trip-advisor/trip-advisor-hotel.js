'use strict';
const axios = require('axios');
const { jsonFilterHotelid } = require('./helper');
const key = global.config.taKey;

function dateConvert(date){
    const dateObject     = new Date(date);
    const dateOnlyString = dateObject.toISOString().substr(0, 10);
    return dateOnlyString;
}

async function tripHotelList(parent,args,context) {
   let remoteAddress = context.request.socket.remoteAddress
   const userAgent   = context?.request?.headers['user-agent']

   try {
        let queryUrl = 'https://api.tripadvisor.com/api/partner/3.0/synmeta-pricing'
        queryUrl += `?key=${key}`;
        queryUrl += `&hotel_ids=${jsonFilterHotelid(args.input.hotel_ids)}`;
        queryUrl += `&hotel_id_type=${args.input.hotel_id_type || 'TA'}`;
        queryUrl += `&check_in=${dateConvert(args.input.checkIn)}`;
        queryUrl += `&check_out=${dateConvert(args.input.checkOut)}`;
        queryUrl += `&ip_address=${remoteAddress}`;
        queryUrl += `&user_agent=${userAgent}`;
        queryUrl += `&num_adults=${args.input.num_adults}`;
        queryUrl += `&num_rooms=${args.input.num_rooms}`;
        queryUrl += `&currency=${args?.input?.currency || "USD"}`;

        try {
            const response = await axios.get(queryUrl);
            console.log(response)
            response.data.success
            return {
                success: true,
                data:response.data.success,
             };
        } catch (error) {
            return {
                success: false,
                error_msg:error.response.data.errors[0].message,
            };
        }
    }
    catch(e) {
        return {
        success: false,
            error_msg:e.response.data.error.message,
        };
    }
}

module.exports = {
    tripHotelList
};