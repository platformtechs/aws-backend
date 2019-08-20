const AWS = require('aws-sdk');
const fs = require('fs');

AWS.config.update({region: 'us-east-1'});
let credentials = new AWS.SharedIniFileCredentials({profile: 'amplify'});
AWS.config.credentials = credentials;
const ec2 = new AWS.EC2({apiVersion: '2016-11-15'});

const params = {
    KeyName: 'KEY_PAIR_NAME_TEST'
};

ec2.deleteKeyPair(params, function (err, data) {
    if (err) {
        console.log("Error", err);
    } else {
        console.log("Key Pair Deleted");
    }
});