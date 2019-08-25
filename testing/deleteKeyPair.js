/* eslint-disable no-return-assign */
/* eslint-disable no-undef */
const AWS = require('aws-sdk');

AWS.config = new AWS.Config({
  accessKeyId: '/*access key id*/',
  // eslint-disable-next-line no-undef
  secretAccessKey: '/*secret key*/',
  region: 'ap-south-1',
});

const ec2 = new AWS.EC2({ apiVersion: '2016-11-15', region: 'ap-south-1' });

const params = {
  KeyName: 'tanisha',
};

ec2.deleteKeyPair(params, (err, data) => {
  if (err) {
    console.log('Error', err);
  } else {
    console.log('Key Pair Deleted');
  }
});
