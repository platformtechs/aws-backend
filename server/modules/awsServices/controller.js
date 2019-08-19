/* eslint-disable no-console */
/* eslint-disable no-shadow */
/* eslint-disable no-undef */
import AWS, { EC2 } from 'aws-sdk';
import mongoose from 'mongoose';

import User from '../users/model';

export const configureAws = async (user) => {
  AWS.configure({
    accessKeyId: user.accessKeyId, secretAccessKey: user.secretAccessKey, region: 'ap-south-1',
  });
};

export const createInstance = async (req, res) => {
  const { _id } = req.body;
  const userId = mongoose.Types.ObjectId(_id);
  const user = User.findById(userId);
  configureAws(user);

  // AMI is amzn-ami-2011.09.1.x86_64-ebs
  const instanceParams = {
    ImageId: 'AMI_ID',
    InstanceType: 't1.micro',
    KeyName: 'KEY_PAIR_NAME',
    MinCount: 1,
    MaxCount: 1,
  };

  // Create an EC2 service object
  const instancePromise = new EC2({ apiVersion: '2016-11-15' }).runInstances(instanceParams).promise();
  instancePromise.then(data => {
    // eslint-disable-next-line no-console
    console.log('data', data);
    const instanceId = data.Instances[0].InstanceId;
    // eslint-disable-next-line no-console
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
    }).catch(err => {
      // eslint-disable-next-line no-console
      console.error(err, err.stack);
    });
  }).catch(err => {
    // eslint-disable-next-line no-console
    console.error(err, err.stack);
  });
};

export const startAndStopInstance = async (req, res) => {
  const { _id } = req.body;
  const userId = mongoose.Types.ObjectId(_id);
  const user = User.findById(userId);

  configureAws(user);

  const params = {
    InstanceIds: [process.argv[3]],
    DryRun: true,
  };

  if (process.argv[2].toUpperCase() === 'START') {
  // Call EC2 to start the selected instances
    ec2.startInstances(params, (err, data) => {
      if (err && err.code === 'DryRunOperation') {
        params.DryRun = false;
        ec2.startInstances(params, (err, data) => {
          if (err) {
            console.log('Error', err);
          } else if (data) {
            console.log('Success', data.StartingInstances);
          }
        });
      } else {
        console.log("You don't have permission to start instances.");
      }
    });
  } else if (process.argv[2].toUpperCase() === 'STOP') {
  // Call EC2 to stop the selected instances
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
  }
};

export const rebootInstance = async (req, res) => {
  const { _id } = req.body;
  const userId = mongoose.Types.ObjectId(_id);
  const user = User.findById(userId);

  configureAws(user);

  const params = {
    InstanceIds: ['INSTANCE_ID'],
    DryRun: true,
  };

  // Call EC2 to reboot instances
  ec2.rebootInstances(params, (err, data) => {
    if (err && err.code === 'DryRunOperation') {
      params.DryRun = false;
      ec2.rebootInstances(params, (err, data) => {
        if (err) {
          console.log('Error', err);
        } else if (data) {
          console.log('Success', data);
        }
      });
    } else {
      console.log("You don't have permission to reboot instances.");
    }
  });
};
