const AWS = require('aws-sdk');
const fs = require('fs');

AWS.config.update({region: 'us-east-1'});
let credentials = new AWS.SharedIniFileCredentials({profile: 'amplify'});
AWS.config.credentials = credentials;
const ec2 = new AWS.EC2({apiVersion: '2016-11-15'});

const params = {
    KeyName: 'KEY_PAIR_NAME_TEST'
};

// Create the key pair
ec2.createKeyPair(params, function (err, data) {
    if (err) {
        console.log("Error", err);
    } else {
        let keyData = JSON.stringify(data)
        console.log(keyData);
        const options = {
            encoding: 'utf8',
            mode: 0o600
        };
        fs.writeFileSync('key.json', data.KeyMaterial, options);
    }
});