// om namah shivaya

'use strict';

// require scripts
const http = require('http');

const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const cron = require('node-cron');
var cors = require('cors');
const { csvHoteList, singleHotel } = require('./resolvers/trip-advisor.js');
const {tripHotelList}= require('./resolvers/trip-advisor-hotel.js');

// const admin = require('firebase-admin');

async function startService() {
  // process.env.NODE_ENV = 'production';

  // config
  const config = require('./config/config.js');
  await config.initializeConfig();

  /*
  // firebase
  admin.initializeApp({
    credential: admin.credential.cert(global.config.firebase.serviceAccountKey),
  });
  */

  // postgres
  const pg = require('./db/postgres/postgres.js');
  await pg.initializePostgres();

  // fauna
  const fauna = require('./db/fauna/fauna.js');

  // sabre
  const sabre = require('./sabre/sabre.js');
  await sabre.initialize();

  // stripe
  const stripe = require('./stripe/stripe.js');
  await stripe.initialize();
  // sendgrid
  const sendgrid = require('./sendgrid/sendgrid.js');

  const app = express();
  app.use(cors())
  // sendgridadminUpdatePropertyTitle
  const port = process.env.PORT || 4000;

 
  app.get('/', (req, res) => {
    res.json({
      packageName: global.config.packageName,
      port,
      environment: process.env.NODE_ENV,
    });
  });
  const { generateAlias } = require('./db/seed/generate-alias.js');
  // webhooks start
  // stripe start
  const authorize = require('./stripe/webhooks/issuing_authorization.request.js');
  app.post(
    '/webhooks/stripe/issuing_authorization.request',
    express.raw({
      type: 'application/json',
    }),
    authorize.receive
  );

  const all = require('./stripe/webhooks/all.js');
  app.post(
    '/webhooks/stripe/all',
    express.raw({
      type: 'application/json',
    }),
    all.receive
  );

  const bnpl = require('./stripe/webhooks/bnpl.js');
  app.post(
    '/webhooks/stripe/bnpl',
    express.raw({
      type: 'application/json',
    }),
    bnpl.receive
  );

  app.get('/create-script-api', async (req, res) => {
     let response =  await generateAlias()
     return res.json({"response":response});
  });


 app.get('/trip-advisor-hotel-csv-listing', async (req, res) => {
  return await csvHoteList(pg, req, res)
 });

 app.get('/trip-advisor-hotel-item', async (req, res) => {
  let args = {
    input: {
      id: "e7832cfe-9360-44e5-a089-26b96acddf51", // req.query.id
      adults:1,  // req.query.adults
      children:1, // req.query.children
      checkIn: new Date("2023-03-30 00:00:00"), // req.query.checkIn
      checkOut: new Date("2023-04-27 00:00:00"), // req.query.checkOut
      dogs:1 , // req.query.dogs
      alias:"",
    }
  }
  let property = await singleHotel(pg, args, {})
  return res.send({property})
 });

//  custom tripadvisor
 app.get('/trip', async (req, res) => {

  let args = {
    input: {
      key: "2143528E8C854DB291C4E91056A6EA78", 
      hotel_ids:"637688",
      checkIn: "2023-05-07",
      checkOut: "2023-05-08", 
      ip_address:"2405:201:5007:9825:3f93:1dc8:191f:abd0",
      user_agent:"DESKTOP",
    }
  }
  let tripHotelLists = await tripHotelList(args)
  return res.send({tripHotelLists})
 });
  // stripe end
  // webhooks end

  //API v2
  const pg2 = require('./db/postgres/postgres-v2');

  app.post('/v2/user/:id', async (req, res) => {
    const result = await pg2.deleteUserById(req.params.id)
    console.log(result)
    return res.json({ result })
  })

  app.get('/v2/user/reservations', async (req, res) => {
    console.log('get route reservations' + req.query)
    const result = await pg2.getReservationsByEmail(req.query.email, req.query.id)
    console.log(result)
    return res.json({ result })
  })

  app.get('/v2/sabre/test', async (req, res) => {
    const result = await pg2.sabreTest('100382130')
    console.log(result)
    return res.json({ test: result })
  })

  app.post('/v2/admin/room/:id', async (req, res) => {
    try {
      if (pg2.userExists(req.query?.userId)) {
        const result = await pg2.deleteHotelRoomById(req.params.id)
        return res.json({ result })
      }
      return res.json({ status: 'not authorized'})
    } catch (err) {
      return res.json({ err })
    }
  })

  app.post('/v2/admin/hotel/:id', async (req, res) => {
    try {
      if (pg2.userExists(req.query?.userId)) {
        const result = await pg2.deleteHotelById(req.params.id)
        return res.json({ result })
      }
      return res.json({ status: 'not authorized'})
    } catch (err) {
      return res.json({ err })
    }
  })

  app.get('/v2/hotels-by-name/:name', async (req, res) => {
    try {
      const hotels = await pg2.getHotelsByName(req.params.name)
      return res.json({ hotels })
    } catch (err) {
      return res.json({ err })
    }
  })

  const httpServer = http.createServer(app);

  const { typeDefs } = require('./type-defs.js');
  const { resolvers } = require('./resolvers.js');

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    introspection: true,
    context: contextHandler,
  });
  await server.start();
  server.applyMiddleware({ app });

  await new Promise((resolve) => httpServer.listen({ port }, resolve));
  console.log({
    packageName: global.config.packageName,
    port,
    environment: process.env.NODE_ENV,
  });
  /**
  * Cron job 
  */
  cron.schedule('0 * * * *', () => {
    pg.sendCheckInReminder()
  });
}

async function contextHandler({ req }) {
  return  {
    headers: req.headers,
    request: req,
  }
  /*
  try {
    const idToken = context.req.headers.authorization;
    if (idToken) {
      const decodedIdToken = await admin.auth().verifyIdToken(idToken);
      const user = {
        id: decodedIdToken.uid,
        iam: decodedIdToken.iam,
      };
      context.req.user = user;
    }
    return context;
  } catch (e) {
    console.error('e', e);
    return context;
  }
  */
}

startService();
