// om namah shivaya

'use strict';

// require scripts
const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
  credentials: global.config.gcp.serviceAccountKey,
});

const bucket = storage.bucket(global.config.gcp.publicBucketName);

async function adminImageDirectory(parent, args) {
  const directory = {
    name: args.input.rooms === true ? 'rooms' : args.input.name,
    directories: [],
    files: [],
  };

  if (args.input.rooms === true) {
    const prefix = `images/${args.input.name}/rooms/`;

    const [gcsFiles] = await bucket.getFiles({
      autoPaginate: false,
      prefix,
    });

    for (let i = 0; i < gcsFiles.length; i++) {
      let gcsFile = gcsFiles[i].name;

      if (gcsFile.endsWith('/') === false) {
        gcsFile = gcsFile.substring(prefix.length);
        gcsFile = gcsFile.split('/');

        let dir = directory;

        for (let j = 0; j < gcsFile.length; j++) {
          if (j === gcsFile.length - 1) {
            dir.files.push({ name: gcsFile[j] });
          } else {
            let exists = false;

            for (let k = 0; k < dir.directories.length; k++) {
              if (dir.directories[k].name === gcsFile[j]) {
                dir = dir.directories[k];
                exists = true;
                break;
              }
            }

            if (!exists) {
              dir.directories.push({
                name: gcsFile[j],
                directories: [],
                files: [],
              });

              dir = dir.directories[dir.directories.length - 1];
            }
          }
        }
      }
    }
  } else {
    const [gcsFiles] = await bucket.getFiles({
      autoPaginate: false,
      delimiter: '/',
      prefix: `images/${args.input.name}/`,
    });

    for (let i = 0; i < gcsFiles.length; i++) {
      let gcsFile = gcsFiles[i].name;

      if (gcsFile.endsWith('/') === false) {
        gcsFile = gcsFile.split('/');
        gcsFile = gcsFile[gcsFile.length - 1];
        directory.files.push({ name: gcsFile });
      }
    }
  }

  return directory;
}

module.exports = {
  adminImageDirectory,
};
