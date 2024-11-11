// om namah shivaya

'use strict';

function request(
  sabreIds,
  checkIn,
  checkOut,
  adults,
  children,
  corporateDiscount
) {
  const req = {
    GetHotelAvailRQ: {
      POS: {
        Source: {
          PseudoCityCode: global.config.sabre.pcc,
        },
      },
      SearchCriteria: {
        RateDetailsInd: true,
        HotelRefs: {
          HotelRef: [],
        },
        RateInfoRef: {
          CurrencyCode: 'USD',
          BestOnly: '1',
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
      },
    },
  };

  if (process.env.NODE_ENV === 'production') {
    if (corporateDiscount) {
      console.log('corp discount added')
      req.GetHotelAvailRQ.SearchCriteria.RateInfoRef.CorpDiscount =
        global.config.sabre.corporateDiscount;
    } else {
      req.GetHotelAvailRQ.SearchCriteria.RateInfoRef.RatePlanCandidates = {
        ExactMatchOnly: true,
        OtherAvailableRatePlans: false,
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

  for (let i = 0; i < sabreIds.length; i++) {
    req.GetHotelAvailRQ.SearchCriteria.HotelRefs.HotelRef.push({
      HotelCode: sabreIds[i],
      CodeContext: 'GLOBAL',
    });
  }

  if (children.length > 0) {
    let childAges = '';
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      childAges += `${child.age},`;
    }
    childAges = childAges.substr(0, childAges.length - 1);
    req.GetHotelAvailRQ.SearchCriteria.RateInfoRef.Rooms.Room[0].ChildAges =
      childAges;
  }

  return JSON.stringify(req);
}

module.exports = {
  request,
};
