
const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });
const credentials = new AWS.SharedIniFileCredentials({ profile: 'amplify' });
AWS.config.credentials = credentials;
const ec2 = new AWS.EC2({ apiVersion: '2016-11-15' });

const params = {
  InstanceIds: [process.argv[2]],
  DryRun: true,
};

ec2.stopInstances(params, (err, data) => {
  if (err && err.code === 'DryRunOperation') {
    params.DryRun = false;
    ec2.stopInstances(params, (err, data) => {
      if (err) {
        console.log('Error', err);
      } else if (data) {
        console.log('Success', data.StoppingInstances);
      }
    });
  } else {
    console.log("You don't have permission to stop instances");
  }
});
