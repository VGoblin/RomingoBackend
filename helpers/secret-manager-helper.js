// om namah shivaya

'use strict';

// require scripts
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

const client = new SecretManagerServiceClient();

async function accessSecretVersion(name) {
  const [version] = await client.accessSecretVersion({
    name: `projects/${global.config.gcp.secretManagerProjectId}/secrets/${name}/versions/latest`,
  });

  return version.payload.data.toString();
}

module.exports = {
  accessSecretVersion,
};
