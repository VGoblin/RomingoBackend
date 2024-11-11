// om namah shivaya

'use strict';

// require scripts
const fs = require('fs');

const merge = require('lodash.merge');

const smh = require('../helpers/secret-manager-helper.js');

async function initializeConfig() {
  const config = require('./config.json');
  global.config = mergeConfig(config);

  if (process.env.GAE_ENV === 'standard') {
    global.config.postgres.host = global.config.postgres.privateHost;
  } else {
    global.config.postgres.host = global.config.postgres.publicHost;
  }

  await hydrateSecrets();

  if (process.env.NODE_ENV !== 'production') {
    console.log(global.config);
  }
}

function mergeConfig(config) {
  const defaultConfig = config.development;
  const environment = process.env.NODE_ENV || 'development';
  const environmentConfig = config[environment];
  return merge({}, defaultConfig, environmentConfig);
}

async function hydrateSecrets() {
  let config;
  if (process.env.NODE_ENV === 'production') {
    if (fs.existsSync('./secrets/secrets.prod.json')) {
      console.log('hydrateSecrets: reading from local file');
      config = require('../secrets/secrets.prod.json');
    }
  } else {
    if (fs.existsSync('./secrets/secrets.json')) {
      console.log('hydrateSecrets: reading from local file');
      config = require('../secrets/secrets.json');
    }
  }
  if (!config) {
    console.log('hydrateSecrets: reading from secret manager');
    config = JSON.parse(await smh.accessSecretVersion('secrets'));
  }
  config = mergeConfig(config);
  global.config = merge({}, global.config, config);
}

module.exports = {
  initializeConfig,
};
