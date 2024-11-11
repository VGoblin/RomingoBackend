// om namah shivaya

'use strict';

// require scripts
const pg = require('../db/postgres/postgres.js');

async function adminUpdateProperty(parent, args) {
  const [id] = await pg.adminUpdateProperty(
    args.input.id,
    args.input.cityId,
    args.input.corporateDiscount,
    args.input.sabreId,
    args.input.name,
    args.input.desc,
    args.input.addressLine1,
    args.input.zipCode,
    args.input.neighborhood,
    args.input.romingoScore,
    args.input.dogAmenities,
    args.input.imageDirectoryName,
    args.input.featuredImageFilename,
    args.input.imageFilenames,
    args.input.googlePlaceId,
    args.input.listingsPagePromoText,
    args.input.detailsPagePromoText,
    args.input.checkoutPagePromoText,
    args.input.blocked,
    args.input.alias,
    args.input.page_rank,
    args.input.allows_big_dogs,
    args.input.hotelEmail,
    args.input.hotelAlternativeEmail,
    JSON.parse(args.input.petFeesData),
  );

  return {
    id,
  };
}

module.exports = {
  adminUpdateProperty,
};
