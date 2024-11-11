// om namah shivaya

'use strict';

function request(
  sabreId,
) {
  const req = {
    GetHotelDescriptiveInfoRQ: {
      POS: {
        Source: {
          PseudoCityCode: global.config.sabre.pcc,
        },
      },
      HotelRefs: {
        HotelRef: {
          HotelCode: sabreId,
          CodeContext: 'GLOBAL',
        },
      },
      DescriptiveInfoRef: {
        LocationInfo: true,
        Amenities: true,
      },
    },
  };

  return JSON.stringify(req);
}

module.exports = {
  request,
};
