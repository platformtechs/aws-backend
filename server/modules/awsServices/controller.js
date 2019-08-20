/* eslint-disable no-else-return */

/* eslint-disable no-shadow */
/* eslint-disable no-undef */
import AWS, { EC2 } from 'aws-sdk';
import mongoose from 'mongoose';

import User from '../users/model';

// eslint-disable-next-line no-return-assign
const configureAws = async (user) =>
  AWS.config = new AWS.Config({
    accessKeyId: user.accessid, secretAccessKey: user.accesskey, region: 'us-west-1',
  });

export const createKeyPair = async (user) => {
  const params = {
    KeyName: user.email,
  };

  // Create the key pair
  new EC2({ apiVersion: '2016-11-15', region: 'us-west-1' }).createKey(params, (err, data) => {
    if (err) {
      console.log('Error', err);
      return res.status(500).json({ error: true, message: err.message });
    } else {
      const keyData = JSON.stringify(data);
      console.log(keyData);
      const options = {
        encoding: 'utf8',
        mode: 0o600,
      };
      fs.writeFileSync('key.json', data.KeyMaterial, options);
      User.updateUser(accesskey, data.KeyMaterial);
    }
  });
};

export const createInstance = async (req, res) => {
  const { _id } = req.body;
  const userId = mongoose.Types.ObjectId(_id);
  const user = await User.findById(userId);
  console.log('user', user);
  console.log('accesskey', user.accesskey);
  await configureAws(user);
  await User.createUser(user);
  await createKeyPair(user);

  // AMI is amzn-ami-2011.09.1.x86_64-ebs
  const instanceParams = {
    ImageId: 'ami-0d4027d2cdbca669d',
    InstanceType: 't2.micro',
    KeyName: user.email,
    MinCount: 1,
    MaxCount: 1,
  };

  // Create an EC2 service object
  const instancePromise = new EC2({ apiVersion: '2016-11-15', region: 'us-west-1' }).runInstances(instanceParams).promise();
  instancePromise.then(data => {
    console.log('data', data);
    const instanceId = data.Instances[0].InstanceId;
    updateUser(accessid, instanceId);
    console.log('Created instance', instanceId);
    const tagParams = { Resources: [instanceId],
      Tags: [
        {
          Key: 'Name',
          Value: 'SDK Sample',
        },
      ] };
    const tagPromise = new EC2({ apiVersion: '2016-11-15' }).createTags(tagParams).promise();
    tagPromise.then(() => {
      // eslint-disable-next-line no-console
      console.log('Instance tagged');
      return res.status(200).json({ error: false, message: 'Instance created' });
    }).catch(err => {
      // eslint-disable-next-line no-console
      console.error(err, err.stack);
      return res.status(500).json({ error: true, message: err.message });
    });
  }).catch(err => {
    // eslint-disable-next-line no-console
    console.error(err, err.stack);
    return res.status(500).json({ error: true, message: err.message });
  });
};

// export const startAndStopInstance = async (req, res) => {
//   const { _id } = req.body;
//   const userId = mongoose.Types.ObjectId(_id);
//   const user = User.findById(userId);
//   // eslint-disable-next-line no-console

//   configureAws(user);

//   const params = {
//     InstanceIds: [process.argv[3]],
//     DryRun: true,
//   };

//   if (process.argv[2].toUpperCase() === 'START') {
//   // Call EC2 to start the selected instances
//     ec2.startInstances(params, (err, data) => {
//       if (err && err.code === 'DryRunOperation') {
//         params.DryRun = false;
//         ec2.startInstances(params, (err, data) => {
//           if (err) {
//             console.log('Error', err);
//           } else if (data) {
//             console.log('Success', data.StartingInstances);
//             return res.status(200).json({ error: false, message: 'Instance created' });
//           }
//         });
//       } else {
//         console.log("You don't have permission to start instances.");
//       }
//     });
//   } else if (process.argv[2].toUpperCase() === 'STOP') {
//   // Call EC2 to stop the selected instances
//     ec2.stopInstances(params, (err, data) => {
//       if (err && err.code === 'DryRunOperation') {
//         params.DryRun = false;
//         ec2.stopInstances(params, (err, data) => {
//           if (err) {
//             console.log('Error', err);
//             return res.status(500).json({ error: true, message: e.message });
//           } else if (data) {
//             console.log('Success', data.StoppingInstances);
//             return res.status(200).json({ error: false, message: 'Instance created' });
//           }
//         });
//       } else {
//         console.log("You don't have permission to stop instances");
//         return res.status(500).json({ error: true, message: e.message });
//       }
//     });
//   }
// };

// export const rebootInstance = async (req, res) => {
//   const { _id } = req.body;
//   const userId = mongoose.Types.ObjectId(_id);
//   const user = User.findById(userId);

//   configureAws(user);

//   const params = {
//     InstanceIds: ['INSTANCE_ID'],
//     DryRun: true,
//   };

//   // Call EC2 to reboot instances
//   ec2.rebootInstances(params, (err, data) => {
//     if (err && err.code === 'DryRunOperation') {
//       params.DryRun = false;
//       ec2.rebootInstances(params, (err, data) => {
//         if (err) {
//           console.log('Error', err);
//           return res.status(500).json({ error: true, message: e.message });
//         } else if (data) {
//           console.log('Success', data);
//           return res.status(200).json({ error: false, message: 'Instance created' });
//         }
//       });
//     } else {
//       console.log("You don't have permission to reboot instances.");
//       return res.status(500).json({ error: true, message: e.message });
//     }
//   });
// };
