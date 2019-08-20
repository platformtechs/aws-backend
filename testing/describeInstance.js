const AWS = require('aws-sdk');

AWS.config.update({region: 'us-east-1'});
let credentials = new AWS.SharedIniFileCredentials({profile: 'amplify'});
AWS.config.credentials = credentials;
const ec2 = new AWS.EC2({apiVersion: '2016-11-15'});

const params = {
    DryRun: false
};

// Call EC2 to retrieve policy for selected bucket
ec2.describeInstances(params, function (err, data) {
    if (err) {
        console.log("Error", err.stack);
    } else {
        console.log("Success", JSON.stringify(data));
    }
});