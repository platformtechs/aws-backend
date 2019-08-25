const AWS = require('aws-sdk');
const fs = require('fs');

// const keyPair = require('./key.json')

AWS.config.update({ region: 'us-east-1' });
const credentials = new AWS.SharedIniFileCredentials({ profile: 'amplify' });
AWS.config.credentials = credentials;
const ec2 = new AWS.EC2({ apiVersion: '2016-11-15' });

const instanceParams = {
  ImageId: 'ami-14c5486b',
  InstanceType: 't2.micro',
  KeyName: 'KEY_PAIR_NAME_TEST',
  MinCount: 1,
  MaxCount: 1,
};
ec2.runInstances(instanceParams, (err, data) => {
    if(err) console.log("err", err);
    else console.log("data", data);
});
