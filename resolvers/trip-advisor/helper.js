'use strict';

const mapping = require('../../db/data/csv-mapping.json'); 

function jsonFilterHotelid(id){
    let hotel_id;
    mapping.map(($val)=>{
      if($val['Partner Property ID'] == id){
        hotel_id = $val['TA Property ID'];
      }
    });
    return hotel_id;
}

module.exports = {
    jsonFilterHotelid
};