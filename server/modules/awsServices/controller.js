/* eslint-disable import/no-named-as-default-member */
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

const createKeyPair = async (user) => {
  const params = {
    KeyName: user.email,
  };

  // Create the key pair
  new EC2({ apiVersion: '2016-11-15', region: 'us-west-1' }).createKeyPair(params, (err, data) => {
    if (err) {
      console.log('Error', err);
    } else {
      const keyData = JSON.stringify(data);
      console.log(keyData);
      User.updateUser(user._id, { instancekey: data.KeyMaterial });
    }
  });
};

export const createInstance = async (req, res) => {
  const { _id, email, password, username } = req.body;
  const userId = mongoose.Types.ObjectId(_id);
  const user = await User.findById(userId);
  console.log('user', user);
  console.log('accesskey', user.accesskey);
  await configureAws(user);
  const tempUser = new User({
    _id: new mongoose.Types.ObjectId(),
    username,
    email,
    password: hash,
    accessid:user.accessid,
    accesskey: user.accesskey,
    usertype:"USER"
  })
  const newUser = await tempUser.save();
  console.log("newUser", newUser);
  await createKeyPair(newUser);
  // AMI is amzn-ami-2011.09.1.x86_64-ebs
  const instanceParams = {
    ImageId: 'ami-0d4027d2cdbca669d',
    InstanceType: 't2.micro',
    KeyName: user.email,
    MinCount: 1,
    MaxCount: 1,
  };

  // Create an EC2 service object
  const instancePromise = new EC2({ apiVersion: '2016-11-15', region: 'us-west-1' }).createInstance(instanceParams).promise();
  instancePromise.then(data => {
    const instanceId = data.Instances[0].InstanceId;
    console.log('Created instance', instanceId);
    User.updateUser(newUser._id, { instanceid: data.Instances[0].InstanceId });

    console.log('data', data);
    return res.status(200).json({ error: false, user:newUser });
  }).catch(err => {
    console.error(err, err.stack);
    return res.status(500).json({ error: true, message: err.message });
  });
};

export const describeInstances = async (req, res) => {
  const { _id } = req.body;
  const userId = mongoose.Types.ObjectId(_id);
  const user = await User.findById(userId);
  console.log('user', user);
  console.log('accesskey', user.accesskey);

  // if (user.usertype === 'ADMIN' || user.usertype === 'SUBADMIN') {
    await configureAws(user);
    const ec2 = new AWS.EC2({ apiVersion: '2016-11-15' });

    const params = {
      DryRun: false,
    };

    // Call EC2 to retrieve policy for selected bucket
    ec2.describeInstances(params, (err, data) => {
      if (err) {
        console.log('Error', err.stack);
        return res.status(500).json({ error: true, message: err.message });
      } else {
        console.log('Success', JSON.stringify(data));
        return res.status(200).json({ error: false, instances:data });
      }
    });
  // }
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
          return res.status(200).json({ error: false, instance:data });
        }
      });
    } else {
      console.log("You don't have permission to reboot instances.");
      return res.status(500).json({ error: true, message: e.message });
    }
  });
};
