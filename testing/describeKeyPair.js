const AWS = require('aws-sdk');

AWS.config.update({region: 'us-east-1'});
let credentials = new AWS.SharedIniFileCredentials({profile: 'amplify'});
AWS.config.credentials = credentials;
const ec2 = new AWS.EC2({apiVersion: '2016-11-15'});
ec2.describeKeyPairs(function (err, data) {
    if (err) {
        console.log("Error", err);
    } else {
        console.log("Success", JSON.stringify(data.KeyPairs));
    }
});