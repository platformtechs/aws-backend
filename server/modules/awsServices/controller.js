/* eslint-disable quotes */
/* eslint-disable padded-blocks */
/* eslint-disable indent */
/* eslint-disable comma-dangle */
/* eslint-disable import/no-named-as-default-member */
/* eslint-disable no-else-return */

/* eslint-disable no-shadow */
/* eslint-disable no-undef */
import AWS, { EC2 } from 'aws-sdk';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import NodeRSA from 'node-rsa';
import User from '../users/model';
// eslint-disable-next-line no-return-assign
const configureAws = async (user) =>
  AWS.config = new AWS.Config({
    accessKeyId: user.accessid, secretAccessKey: user.accesskey, region: 'ap-south-1',
  });

const createKeyPair = async (user) => {
  const params = {
    KeyName: user.username,
  };

  // Create the key pair
  await new EC2({ apiVersion: '2016-11-15', region: 'ap-south-1' }).createKeyPair(params, (err, data) => {
    if (err) {
      console.log('Error', err);
    } else {
      const keyData = JSON.stringify(data);
      console.log('------------------------===============-----------------------');
      console.log(keyData);
      console.log('------------------------===============-----------------------');

      User.updateUser(user._id, { instancekey: data.KeyMaterial });
      console.log('------------------------===============-----------------------');
    }
  });
  console.log('access key user', NewU);
};

export const createInstance = async (req, res) => {
  const { _id, username, adminId } = req.body;
  const user = await User.findById(adminId);
  console.log('user', user);
  console.log('------------------------===============-----------------------');

  console.log('accesskey', user.accesskey);
  console.log('------------------------===============-----------------------');

  await configureAws(user);
  bcrypt.hash(user.password, 10, async (err, hash) => {
    if (err) {
      return res.status(500).json({
        error: true,
        message: err,
      });
    }
    const tempUser = new User({
      _id: new mongoose.Types.ObjectId(),
      username,
      email: user.email,
      password: hash,
      accessid: user.accessid,
      accesskey: user.accesskey,
      createdby: _id,
      usertype: 'USER',
    });
    const newUser = await tempUser.save();
    console.log('------------------------===============-----------------------');

    console.log('newUser', newUser);
    console.log('------------------------===============-----------------------');

    await createKeyPair(newUser);

    console.log('------------------------===============-----------------------');
    // AMI is amzn-ami-2011.09.1.x86_64-ebs
    const instanceParams = {
      ImageId: 'ami-028b3bf1662e6082f',
      InstanceType: 't2.micro',
      KeyName: user.username,
      MinCount: 1,
      MaxCount: 1,
    };

    // Create an EC2 service object
    const instancePromise = new EC2({ apiVersion: '2016-11-15', region: 'ap-south-1' }).runInstances(instanceParams).promise();
    instancePromise.then(data => {
      console.log(data);
      console.log('------------------------===============-----------------------');

      const instanceId = data.Instances[0].InstanceId;
      console.log('Created instance', instanceId);
      User.updateUser(newUser._id, { instanceid: data.Instances[0].InstanceId });
      console.log('------------------------===============-----------------------');

      console.log('data', data);
      const ipAddress = data.Instances[0].PrivateIpAddress;

      const params = {
        InstanceId: instanceId
      };
      new EC2({ apiVersion: '2016-11-15', region: 'ap-south-1' }).getPasswordData(params, (err, data) => {
        if (err) console.log("ejofj"); // an error occurred
        else {
          console.log('id newUser', newUser);
          // const newU = User.findById({_id: newUser._id });
          // console.log("new user", newU);
          const key = new NodeRSA(newUser.instancekey);
          console.log('key', newUser.instancekey);
          const decryptedPassword = key.decrypt(data.PasswordData, 'utf8');
          // const decryptedPassword = getPassword.GetDecryptedPassword(data.PasswordData);
          return res.status(200).json({ error: false, instanceId, ipAddress, username: newUser.username, password: decryptedPassword });
      }
     });

    }).catch(err => {
      console.error(err, err.stack);
      return res.status(500).json({ error: true, message: err.message });
    });
});
};

// export const describeInstances = async (req, res) => {
//   const { _id } = req.body;
//   const userId = mongoose.Types.ObjectId(_id);
//   const user = await User.findById(userId);
//   console.log('user', user);
//   console.log('accesskey', user.accesskey);

//   // if (user.usertype === 'ADMIN' || user.usertype === 'SUBADMIN') {
//   await configureAws(user);
//   const ec2 = new AWS.EC2({ apiVersion: '2016-11-15' });

//   const params = {
//     DryRun: false,
//   };

//     // Call EC2 to retrieve policy for selected bucket
//   ec2.describeInstances(params, (err, data) => {
//     if (err) {
//       console.log('Error', err.stack);
//       return res.status(500).json({ error: true, message: err.message });
//     } else {
//       console.log('Success', JSON.stringify(data));
//       return res.status(200).json({ error: false, instances: data });
//     }
//   });
//   // }
// };

export const listInstances = async (req, res) => {
  const { _id } = req.body;
  const userId = mongoose.Types.ObjectId(_id);
  const user = await User.findById(userId);
  const instanceId = user.map(_ => _.instanceid);
  console.log('user', user);

  await configureAws(user);
  const ec2 = new AWS.EC2({ apiVersion: '2016-11-15' });
  const params = {
    InstanceIds: instanceId,
  };
  ec2.describeInstances(params, (err, data) => {
    if (err) {
      console.log(err, err.stack);
      return res.status(500).json({ error: true, instances: err.stack });
    // eslint-disable-next-line brace-style
    } // an error occurred
    else {
      console.log(data); // successful response
      return res.status(200).json({ error: false, instances: data });
    }
  });
};

export const startInstance = async (req, res) => {
  const { _id } = req.body;
  const userId = mongoose.Types.ObjectId(_id);
  const user = await User.findById(userId);
  // eslint-disable-next-line no-console

  await configureAws(user);
  const ec2 = new AWS.EC2({ apiVersion: '2016-11-15' });
  const params = {
    InstanceIds: user.instanceid,
    DryRun: true,
  };

  // Call EC2 to start the selected instances
  ec2.startInstances(params, (err, data) => {
    if (err && err.code === 'DryRunOperation') {
      params.DryRun = false;
      ec2.startInstances(params, (err, data) => {
        if (err) {
          console.log('Error', err);
        } else if (data) {
          console.log('Success', data.StartingInstances);
          return res.status(200).json({ error: false, instance: data });
        }
      });
    } else {
      console.log("You don't have permission to start instances.");
    }
  });
};

export const stopInstance = async (req, res) => {
  const { _id } = req.body;
  const userId = mongoose.Types.ObjectId(_id);
  const user = await User.findById(userId);
  // eslint-disable-next-line no-console

  await configureAws(user);
  const ec2 = new AWS.EC2({ apiVersion: '2016-11-15' });
  const params = {
    InstanceIds: user.instanceid,
    DryRun: true,
  };

  // Call EC2 to stop the selected instances
  ec2.stopInstances(params, (err, data) => {
    if (err && err.code === 'DryRunOperation') {
      params.DryRun = false;
      ec2.stopInstances(params, (err, data) => {
        if (err) {
          console.log('Error', err);
          return res.status(500).json({ error: true, message: e.message });
        } else if (data) {
          console.log('Success', data.StoppingInstances);
          return res.status(200).json({ error: false, message: 'Instance stoped' });
        }
      });
    } else {
      console.log("You don't have permission to stop instances");
      return res.status(500).json({ error: true, message: e.message });
    }
  });
};

export const rebootInstance = async (req, res) => {
  const { _id } = req.body;
  const userId = mongoose.Types.ObjectId(_id);
  const user = User.findById(userId);

  configureAws(user);
  const ec2 = new AWS.EC2({ apiVersion: '2016-11-15' });

  const params = {
    InstanceIds: user.instanceid,
    DryRun: true,
  };

  // Call EC2 to reboot instances
  ec2.rebootInstances(params, (err, data) => {
    if (err && err.code === 'DryRunOperation') {
      params.DryRun = false;
      ec2.rebootInstances(params, (err, data) => {
        if (err) {
          console.log('Error', err);
          return res.status(500).json({ error: true, message: e.message });
        } else if (data) {
          console.log('Success', data);
          return res.status(200).json({ error: false, instance: data });
        }
      });
    } else {
      console.log("You don't have permission to reboot instances.");
      return res.status(500).json({ error: true, message: e.message });
    }
  });
};
