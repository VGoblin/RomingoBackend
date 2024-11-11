const { DateTime } = require('luxon');

function computePetFeePolicyTotalFees(checkIn, checkOut, dogs, petFeePolicy) {
  try {
    if (!petFeePolicy) {
      return -1
    }
    
    if (dogs < 1) {
      return 0;
    }

    checkIn = DateTime.fromJSDate(checkIn).toUTC();
    checkOut = DateTime.fromJSDate(checkOut).toUTC();
    const nights = checkOut.diff(checkIn, 'days').days;

    if (nights < 1) {
      return 0;
    }

    if (petFeePolicy.maxPets !== -1) {
      if (dogs > petFeePolicy.maxPets) {
        return -1;
      }
    }

    if (nights > 365) {
      return -1;
    }

    let keys = Object.keys(petFeePolicy.breakup);

    //BUG: 5 being added somehow?
    if (keys.indexOf('5') > -1) {
      keys.splice(0, 1)
    }

    for (let i = 0; i < keys.length; i++) {
      keys[i] = parseInt(keys[i]);
    }

    keys = keys.sort((a, b) => {
      a - b;
    });

    const values = [];

    for (let i = 0; i < keys.length; i++) {
      values.push(petFeePolicy.breakup[keys[i].toString()]);
    }

    let retVal;

    if (petFeePolicy.perNight) {
      for (let i = 0; i < keys.length; i++) {
        if (nights <= keys[i]) {
          if (values[i] === -1) {
            return -1;
          }
          retVal = 0;
          let prevKey = 0;
          let newNights = 0;
          for (let j = 0; j <= i; j++) {
            if (j === i) {
              newNights = nights - prevKey;
            } else {
              newNights = keys[j] - prevKey;
            }
            prevKey = keys[j];
            if (petFeePolicy.perPet) {
              retVal = retVal + newNights * dogs * values[j];
            } else {
              retVal = retVal + newNights * values[j];
            }
          }
          return retVal;
        }
      }
    } else {
      for (let i = 0; i < keys.length; i++) {
        if (nights <= keys[i]) {
          retVal = values[i];
          if (retVal === -1) {
            return retVal;
          }
          if (petFeePolicy.perPet) {
            retVal = retVal * dogs;
          }
          return retVal;
        }
      }
    }
  } catch (e) {
    console.error(e);
    return -1;
  }
}

module.exports = {
  computePetFeePolicyTotalFees,
};

function testComputePetFeePolicyTotalFees() {
  const checkIn = new Date(2022, 08, 08);
  const checkOut = new Date(2022, 08, 19);
  const dogs = 2;
  const petFeePolicy = {
    maxPets: 2,
    maxWeightPerPetInLBS: 75,
    desc: 'Rates are as follows: Up to six nights — $100 per stay. Seven to 30 nights — $100 additional deep cleaning fee. 30 or more nights a fee will be assessed at the hotel’s discretion',
    perPet: true,
    perNight: true,
    breakup: {
      365: 500,
      10: 50,
      5: 200,
      7: 100,
    },
  };
  console.log(computePetFeePolicyTotalFees(checkIn, checkOut, 2, petFeePolicy));
}
