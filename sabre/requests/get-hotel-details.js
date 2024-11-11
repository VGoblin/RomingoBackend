// om namah shivaya

'use strict';

function request(
  sabreId,
  checkIn,
  checkOut,
  adults,
  children,
  corporateDiscount
) {
  const req = {
    GetHotelDetailsRQ: {
      POS: {
        Source: {
          PseudoCityCode: global.config.sabre.pcc,
        },
      },
      SearchCriteria: {
        HotelRefs: {
          HotelRef: {
            HotelCode: sabreId,
            CodeContext: 'GLOBAL',
          },
        },
        RateInfoRef: {
          CurrencyCode: 'USD',
          StayDateTimeRange: {
            StartDate: checkIn,
            EndDate: checkOut,
          },
          Rooms: {
            Room: [
              {
                Index: 1,
                Adults: adults,
                Children: children.length,
                ChildAges: '',
              },
            ],
          },
        },
        HotelContentRef: {
          DescriptiveInfoRef: {
            LocationInfo: true,
            Amenities: true,
          },
          MediaRef: {
            MaxItems: 'ALL',
            MediaTypes: {
              Images: {
                Image: [
                  {
                    Type: 'ORIGINAL',
                  },
                ],
              },
            },
          },
        },
      },
    },
  };

  if (process.env.NODE_ENV === 'production') {
    if (corporateDiscount) {
      req.GetHotelDetailsRQ.SearchCriteria.RateInfoRef.CorpDiscount =
        global.config.sabre.corporateDiscount;
    } else {
      req.GetHotelDetailsRQ.SearchCriteria.RateInfoRef.RatePlanCandidates = {
        ExactMatchOnly: true,
        RatePlanCandidate: [
          {
            RatePlanCode: 'RHG',
          },
          {
            RatePlanCode: 'RMG',
          },
          {
            RatePlanCode: 'R7G',
          },
        ],
      };
    }
  }

  if (children.length > 0) {
    let childAges = '';
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      childAges += `${child.age},`;
    }
    childAges = childAges.substr(0, childAges.length - 1);
    req.GetHotelDetailsRQ.SearchCriteria.RateInfoRef.Rooms.Room[0].ChildAges =
      childAges;
  }

  return JSON.stringify(req);
}

module.exports = {
  request,
};
