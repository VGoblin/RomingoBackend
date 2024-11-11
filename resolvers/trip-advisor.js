'use strict';
// require scripts
const { DateTime } = require('luxon');
const sabre = require('../sabre/sabre.js');
const common = require('../sabre/requests/common.js');
const common2 = require('../resolvers/common.js');

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceAll(str, find, replace) {
  if (!str?.length) return ''
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

async function csvHoteList(pg, req, res) {
  try {
  const properties = await pg.adminPropertiesCSV();
  const token = "1?cyWwviz6wmzLR3WCT7I8R3yOiwa4enqzs9rewmMRGffWFmMSJi9E-FCnI8rAl9vTbYPktKKOMe1RBMVwr3R5illwYwhA1qQsut"
  if (req.query.token != token) return res.send({"error" : "Invalid token"});
  let list = []
  for (let i = 0; i < properties.length; i++) {
    let property = properties[i]
    if (property.propertyName != "DELETED") {
      const item = {
        id: property.id,
        name: property.propertyName,
        addressLine1: property.addressLine1,
        zipCode: property.zipCode,
        cityName: property.cityName,
        stateName: property.stateName,
        countryName: property.countryName,
        hotelEmail: property.hotelEmail,
      }
      list.push(item)
    }
  }

  // initializing the CSV string content with the headers
  let csvData = ["id", "Country", "State/Province", "City", "Hotel Name", "Street 1", "Street 2", "Postal Code", "TelephoneNumber"].join(",") + "\r\n"

  list.forEach((item) => {
    // populating the CSV content
    // and converting the null fields to ""
    csvData += [
      item.id, 
      replaceAll(item?.countryName, ",", " "), 
      replaceAll(item?.stateName, ",", " "), 
      replaceAll(item?.cityName.split(",")[0], ",", " "), 
      replaceAll(item?.name, ",", " "), 
      replaceAll(item?.addressLine1, ",", " "), 
      '', 
      replaceAll(item?.zipCode, ",", " "), 
      replaceAll(item?.hotelEmail, ",", " "), 
    ].join(",") + "\r\n"
  })

  // returning the CSV content via the "list_hotels.csv" file
  res
    .set({
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="list_hotels.csv"`,
    })
    .send(csvData)
  } catch(e) {
    return res.send({"error": true, msg: e.message})
  }
}


async function csvHoteList(pg, req, res) {
  try {
  const properties = await pg.adminPropertiesCSV();
  const token = "1cyWwviz6wmzLR3WCT7I8R3yOiwa4enqzs9rewmMRGffWFmMSJi9E-FCnI8rAl9vTbYPktKKOMe1RBMVwr3R5illwYwhA1qQsut"
  if (req.query.token != token) return res.send({"error" : "Invalid token"});
  let list = []
  for (let i = 0; i < properties.length; i++) {
    let property = properties[i]
    if (property.propertyName != "DELETED") {
      const item = {
        id: property.id,
        name: property.propertyName,
        addressLine1: property.addressLine1,
        zipCode: property.zipCode,
        cityName: property.cityName,
        stateName: property.stateName,
        countryName: property.countryName,
        hotelEmail: property.hotelEmail,
      }
      list.push(item)
    }
  }

  // initializing the CSV string content with the headers
  let csvData = ["id", "Country", "State/Province", "City", "Hotel Name", "Street 1", "Street 2", "Postal Code", "TelephoneNumber"].join(",") + "\r\n"

  list.forEach((item) => {
    // populating the CSV content
    // and converting the null fields to ""
    csvData += [
      item.id, 
      replaceAll(item?.countryName, ",", " "), 
      replaceAll(item?.stateName, ",", " "), 
      replaceAll(item?.cityName.split(",")[0], ",", " "), 
      replaceAll(item?.name, ",", " "), 
      replaceAll(item?.addressLine1, ",", " "), 
      '', 
      replaceAll(item?.zipCode, ",", " "), 
      replaceAll(item?.hotelEmail, ",", " "), 
    ].join(",") + "\r\n"
  })

  // returning the CSV content via the "list_hotels.csv" file
  res
    .set({
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="list_hotels.csv"`,
    })
    .send(csvData)
  } catch(e) {
    return res.send({"error": true, msg: e.message})
  }
}


module.exports = {
  csvHoteList,
};
