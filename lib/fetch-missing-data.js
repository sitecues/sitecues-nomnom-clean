'use strict';

const AWS = require('aws-sdk'),
  path = require('path'),
  fs = require('fs'),
  BUCKET = 'logs.sitecues.com';   // Do we need to prefix with s3:// ?

function fetchMissingData(logFileName, localPath) {
  const
    s3Params = {
      Bucket: BUCKET,
      Key: 'raw/wsprd/V2/wsprd3.sitecues.com/metrics/' + logFileName
    },
    s3 = new AWS.S3({
      region : 'us-east-1',
      params: s3Params
    });

  // If we want to hook up as a stream:
  // s3.getObject(params).createReadStream().pipe(file);

  return new Promise((resolve, reject) => {
    s3.getObject((err, object) => {
      if (err) {
        console.log('Failed to download ' + logFileName);
        reject(err);
      }
      else {
        fs.writeFile(path.join(__dirname, '..', localPath), object.Body, resolve)
        console.log('Successfully downloaded ' + logFileName);
      }
    });
  });
}

module.exports = fetchMissingData;