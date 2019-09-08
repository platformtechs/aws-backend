/* eslint-disable quotes */
/* eslint-disable padded-blocks */
/* eslint-disable indent */
/* eslint-disable comma-dangle */
/* eslint-disable import/no-named-as-default-member */
/* eslint-disable no-else-return */

/* eslint-disable no-shadow */
/* eslint-disable no-undef */
import AWS, {
  EC2
} from 'aws-sdk';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
// import NodeRSA from 'node-rsa';
import ursa from 'ursa';
import User from '../users/model';
import fs from 'fs';

// eslint-disable-next-line no-return-assign
const configureAws = (user) =>
  AWS.config = new AWS.Config({
    accessKeyId: user.accessid,
    secretAccessKey: user.accesskey,
    region: 'ap-south-1',
  });

export const createInstance = async (req, res) => {
  try {
    const {
      adminId,
      os,
      instanceType,
      username,
      days
    } = req.body;
    const oldUser = await User.findOne({
      username
    });
    if (oldUser) {
      return res.status(500).json({
        error: true,
        message: "user already exist"
      });
    }
    const user = await User.findById(adminId);
    console.log('user', user);
    console.log('------------------------===============-----------------------');

    console.log('accesskey', user.accesskey);
    console.log('------------------------===============-----------------------');

    await configureAws(user);

    const ec2 = new EC2({
      apiVersion: '2016-11-15',
      region: 'ap-south-1'
    });

    const password = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);

    bcrypt.hash(password, 10, async (err, hash) => {
      if (err) {
        return res.status(500).json({
          error: true,
          message: err,
        });
      }
      const dateObj = new Date();
      dateObj.setDate(dateObj.getDate() + Number(days));
      const dateData = dateObj.toLocaleDateString();
      const tempUser = new User({
        _id: new mongoose.Types.ObjectId(),
        username,
        panelpass: password,
        email: user.email,
        password: hash,
        awsadminid: adminId,
        createdby: user.createdby,
        usertype: 'USER',
        instancekey: "",
        instanceid: "",
        instancetype: instanceType,
        expiredat: dateData
      });
      const newUser = await tempUser.save();
      console.log('------------------------===============-----------------------');
      console.log('newUser', newUser);
      console.log('------------------------===============-----------------------');
        const keyPairParams = {
          KeyName: newUser.username,
        };
        console.log('newUser name', newUser.username);
        const key = await ec2.createKeyPair(keyPairParams).promise().then(data => data).catch(err => {
          console.error(err, err.stack);
          return res.status(500).json({
            error: true,
            message: err.message
          });
        });
        console.log('------------------------===============-----------------------');
        const keyData = JSON.stringify(key);
        console.log('key', keyData);
        fs.writeFileSync(`./Keys/${username}.pem`, key.KeyMaterial, 'utf-8');
        fs.writeFileSync(`./Keys/${username}-all.pem`, JSON.stringify(key), 'utf-8');
        const accessKey = key.KeyMaterial;
        console.log('------------------------===============-----------------------');
        console.log('datakey..key.', accessKey);
        const newUser1 = await User.updateUser(newUser._id, {
          instancekey: accessKey
        });
        console.log('------------------------===============-----------------------');
        console.log('Access keyPair updated User', newUser1);

        const instanceParams = {
          ImageId: os,
          InstanceType: instanceType,
          KeyName: newUser1.username,
          MinCount: 1,
          MaxCount: 1,
        };

        const instancePromise = await ec2.runInstances(instanceParams).promise().then(data => data).catch(err => {
          console.error(err, err.stack);
          return res.status(500).json({
            error: true,
            message: err.message
          });
        });
        console.log('------------------------===============-----------------------');
        console.log('instance data', instancePromise);
        console.log('------------------------===============-----------------------');
          const instanceid = instancePromise.Instances[0].InstanceId;
        console.log('------------------------===============-----------------------');
        console.log("Created instance", instanceid);
        console.log('------------------------===============-----------------------');
          const ipAddress = instancePromise.Instances[0].PublicIpAddress;
        const newUser2 = await User.updateUser(newUser1._id, {
          instanceid,
          instanceip: ipAddress,
          instancestatus: "running"
        });
         console.log('updated User', newUser2);
        console.log('------------------------===============-----------------------');
      const tagParams = {
          Resources: [instanceid],
          Tags: [{
            Key: 'Name',
            Value: username
          }]
        };
        const tagPromise = await ec2.createTags(tagParams).promise().then(data => data).catch(err => console.log("err", err));
        console.log("tags", tagPromise);
        console.log('------------------------===============-----------------------');

        // console.log('------------------------===============-----------------------');

        // console.log('------------------------===============-----------------------');
        const response = {
          instanceid,
          adminid: adminId,
          ipAddress,
          username,
          password
        };
        return res.status(200).json({
          error: false,
          result: response
        });
      }).catch(err => {
        console.error(err, err.stack);
        return res.status(500).json({
          error: true,
          message: err.message
        });
      });
  } catch (err) {
    console.error("err", err);
    return res.status(500).json({
      error: true,
      message: err.message
    });
  }
};

export const listInstances = async (req, res) => {
  try {
    const {
      _id,
      usertype
    } = req.body;
    const result = [];
    const userId = mongoose.Types.ObjectId(_id);
    if (usertype === "SUBADMIN") {
      const createdby = await User.find({ $and: [{ createdby: userId }, { usertype: "USER" }] });
      const awsAdmin = createdby.map(_ => _.awsadminid);
      const awsAdminSet = [...new Set(awsAdmin)];
      awsAdminSet.forEach(async el => {
        const user = await User.find({ _id: el });
        await configureAws(user);
        const ec2 = new AWS.EC2({
          apiVersion: '2016-11-15'
        });
        const user1 = await User.find({ awsadminid: el });
        const instanceId = user1.map(_ => _.instanceid);
        const params = {
          InstanceIds: instanceId,
        };
        ec2.describeInstances(params, (err, data) => {
          if (err) {
            console.log(err, err.stack);
            return res.status(500).json({
              error: true,
              instances: err.stack
            });
          } else {
            console.log(data); // successful response
            result.push(...data);
          }
        });
      });
      return res.status(200).json({
        error: false,
        result
      });
    }
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: err.message
    });
  }
};

export const getInstance = async (req, res) => {
  try {
    const { instanceid } = req.body;
    const user = await User.findOne({ instanceid });
  const user1 = await User.findOne({ _id: user.awsadminid });
    console.log("user", user);
    console.log("========================");
    console.log("user1", user1);
    await configureAws(user1);
    const ec2 = new AWS.EC2({
      apiVersion: '2016-11-15'
    });
    const params = {
      InstanceIds: [instanceid],
    };
    ec2.describeInstances(params, (err, data) => {
      if (err) {
        console.log(err, err.stack);
        return res.status(500).json({
          error: true,
          instances: err.stack
        });
      } else {
        console.log(data); // successful response
        const instance = data.Reservations[0].Instances[0];
        console.log("instance", instance);
        return res.status(201).json({
          error: false,
          result: instance
        });
      }
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: err.message
    });
  }
};

export const getPassword = async (req, res) => {
  try {
  const { instanceid, _id } = req.body;
  const user = await User.findOne({ instanceid });
  const user1 = await User.findOne({ _id: user.awsadminid });
  console.log('user', user);
  console.log('------------------------===============-----------------------');

  // console.log('accesskey', user.accesskey);
  // console.log('------------------------===============-----------------------');

  await configureAws(user1);
  console.log(user1);
  const ec2 = new EC2({ apiVersion: '2016-11-15', region: 'ap-south-1' });

  const ec2Params = {
    InstanceId: instanceid,
    DryRun: true
  };
  // fs.writeFileSync('./Keys/test.pem', user.instancekey, 'base64')
  const pem = fs.readFileSync(`./Keys/${user.username}.pem`);
  console.log("user", user.username);
  const pkey = ursa.createPrivateKey(pem);
  console.log("=====================");
  console.log("pkey created");
  ec2.getPasswordData(ec2Params, (err, data) => {
    if (err && err.code === 'DryRunOperation') {
      ec2Params.DryRun = false;
      ec2.getPasswordData(ec2Params, async (err, data) => {
        if (err) {
          console.log("err", err);
        }
        const password = pkey.decrypt(data.PasswordData, 'base64', 'utf8', ursa.RSA_PKCS1_PADDING);
        const { result } = await User.updateUser(user._id, {
            instancepass: password
        });
        return res.status(200).json({
          error: false,
          password
        });
      });
    } else {
      console.log("no permission");
      return res.status(500).json({
        error: true,
        message: err.message
      });
    }
  });
} catch (err) {
    console.error(err, err.stack);
    return res.status(500).json({
      error: true,
      message: err.message
    });
  }
};

export const startInstance = async (req, res) => {
  const {
    _id,
    instanceid
  } = req.body;
  const userId = mongoose.Types.ObjectId(_id);
  const user = await User.findOne({ instanceid });
  const user1 = await User.findOne({ _id: user.awsadminid });
  // eslint-disable-next-line no-console

  await configureAws(user1);
  const ec2 = new AWS.EC2({
    apiVersion: '2016-11-15'
  });
  const params = {
    InstanceIds: [user.instanceid],
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
          User.updateUser(user._id, { instancestatus: "running" });
          return res.status(200).json({
            error: false,
            instance: data
          });
        }
      });
    } else {
      console.log("You don't have permission to start instances.");
    }
  });
};

export const stopInstance = async (req, res) => {
  const {
    _id,
    instanceid
  } = req.body;
  const userId = mongoose.Types.ObjectId(_id);
  const user = await User.findOne({ instanceid });
  console.log("user", user);
  const user1 = await User.findOne({ _id: user.awsadminid });
  // eslint-disable-next-line no-console
console.log("user1", user1);
  await configureAws(user1);
  const ec2 = new AWS.EC2({
    apiVersion: '2016-11-15'
  });
  const params = {
    InstanceIds: [user.instanceid],
    DryRun: true,
  };

  // Call EC2 to stop the selected instances
  ec2.stopInstances(params, (err, data) => {
    if (err && err.code === 'DryRunOperation') {
      params.DryRun = false;
      ec2.stopInstances(params, (err, data) => {
        if (err) {
          console.log('Error', err);
          return res.status(500).json({
            error: true,
            message: err.message
          });
        } else if (data) {
          console.log('Success', data.StoppingInstances);
          User.updateUser(user._id, { instancestatus: "stopped" });
          return res.status(200).json({
            error: false,
            message: 'Instance stoped'
          });
        }
      });
    } else {
      console.log("You don't have permission to stop instances");
      return res.status(500).json({
        error: true,
        message: err.message
      });
    }
  });
};

export const rebootInstance = async (req, res) => {
  const {
    _id,
    instanceid
  } = req.body;
  const userId = mongoose.Types.ObjectId(_id);
  const user = await User.findOne({ instanceid });
  const user1 = await User.findOne({ _id: user.awsadminid });
  console.log(user1.accesskey);

  configureAws(user1);
  const ec2 = new AWS.EC2({
    apiVersion: '2016-11-15'
  });

  const params = {
    InstanceIds: [user.instanceid],
    DryRun: true,
  };

  // Call EC2 to reboot instances
  ec2.rebootInstances(params, (err, data) => {
    if (err && err.code === 'DryRunOperation') {
      params.DryRun = false;
      ec2.rebootInstances(params, (err, data) => {
        if (err) {
          console.log('Error', err);
          return res.status(500).json({
            error: true,
            message: err.message
          });
        } else if (data) {
          console.log('Success', data);
          User.updateUser(user._id, { instancestatus: "running" });
          return res.status(200).json({
            error: false,
            instance: data
          });
        }
      });
    } else {
      console.log("You don't have permission to reboot instances.");
      return res.status(500).json({
        error: true,
        message: err.message
      });
    }
  });
};

export const terminateInstance = async (req, res) => {
  const {
    _id,
    instanceid
  } = req.body;
  const userId = mongoose.Types.ObjectId(_id);
  const user = await User.findOne({
    instanceid
  });
  const user1 = await User.findOne({ _id: user.awsadminid });

  configureAws(user1);
  const ec2 = new AWS.EC2({
    apiVersion: '2016-11-15'
  });

  const params = {
    InstanceIds: [user.instanceid],
    DryRun: true,
  };

  // Call EC2 to reboot instances
  ec2.terminateInstances(params, (err, data) => {
    if (err && err.code === 'DryRunOperation') {
      params.DryRun = false;
      ec2.terminateInstances(params, (err, data) => {
        if (err) {
          console.log('Error', err);
          return res.status(500).json({
            error: true,
            message: err.message
          });
        } else if (data) {
          console.log('Success', data);
          User.deleteOne({ instanceid });
          return res.status(200).json({
            error: false,
            instance: data
          });
        }
      });
    } else {
      console.log("You don't have permission to reboot instances.");
      return res.status(500).json({
        error: true,
        message: err.message
      });
    }
  });
};
