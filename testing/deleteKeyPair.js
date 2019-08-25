/* eslint-disable no-return-assign */
/* eslint-disable no-undef */
const AWS = require('aws-sdk');

AWS.config = new AWS.Config({
  accessKeyId: 'AKIAX6MJJ3MULXDMWOZM',
  // eslint-disable-next-line no-undef
  secretAccessKey: '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',
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
