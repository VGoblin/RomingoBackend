async function insert(params) {
  process.env.NODE_ENV = 'production';

  // config
  const config = require('../config/config.js');
  await config.initializeConfig();

  // postgres
  const pg = require('../db/postgres/postgres.js');
  await pg.initializePostgres();

  const json = require('./pet-fees.json');

  for (let i = 0; i < json.length; i++) {
    const row = json[i];
    const days = row['breakup (days)'].split(',');
    // console.log(days);
    const amounts = row['breakup (amount)'].split(',');
    const breakup = {};
    for (let j = 0; j < days.length; j++) {
      breakup[days[j].toString()] = parseInt(amounts[j]);
    }

    const petFeesData = {
      maxPets: row.maxPets,
      maxWeightPerPetInLBS: row.maxWeightPerPetInLBS,
      desc: row.desc,
      perPet: row.perPet,
      perNight: row.perNight,
      breakup,
    };

    await pg.updatePetFeesData(row.id, petFeesData);
    console.log(`Updated ${i + 1} of ${json.length}`);
  }
}

insert();
