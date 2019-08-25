/* eslint-disable space-before-blocks */
/* eslint-disable no-console */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from './model';

// export const createUser = async (req, res) => {
//   const { email, password, createdby, awsadminid } = req.body;
//   console.log('create');
//   console.log(req.body);

//   bcrypt.hash(password, 10, async (err, hash) => {
//     if (err) {
//       return res.status(500).json({
//         error: true,
//         message: err,
//       });
//     }
//     const newUser = new User({
//       _id: new mongoose.Types.ObjectId(),
//       email,
//       password: hash,
//       accesskey:,
//       accessid:,
//       createdby,
//       awsadminid,
//       usertype: 'USER',
//     });
//     try {
//       const data = await newUser.save();
//       const signupToken = jwt.sign(
//         {
//           email: data.email,
//           userId: data._id,
//         },
//         process.env.JWT_KEY,
//         {
//           expiresIn: '30d',
//         }
//       );
//       return res.status(200).json({ error: false, user: data, token: signupToken });
//     } catch (e) {
//       return res.status(500).json({ error: true, message: e.message });
//     }
//   });
// };

export const createAccesskey = async (req, res) => {
<<<<<<< HEAD
  const { accesskey, accessid, createdby, username, password, email } = req.body;
=======
  const { accesskey, accessid, createdby, username } = req.body;
>>>>>>> e45908ff576559215b735a1d34107ba3ec6217e2
  console.log('create');
  console.log(req.body);
  // const password = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
  // console.log(password);
  console.log('------------------------===============-----------------------');

  const newUser = new User({
    _id: new mongoose.Types.ObjectId(),
    username,
    accesskey,
    accessid,
    createdby,
    usertype: 'AWSADMIN',
  });
  try {
    const data = await newUser.save();
    const signupToken = jwt.sign({
      username: data.username,
      userId: data._id,
    },
    process.env.JWT_KEY, {
      expiresIn: '30d',
    }
<<<<<<< HEAD
    const newUser = new User({
      _id: new mongoose.Types.ObjectId(),
      username,
      email,
      password: hash,
      accesskey,
      accessid,
      createdby,
      usertype: 'AWSADMIN',
=======
    );
    return res.status(200).json({
      error: false,
      user: data,
      token: signupToken,
    });
  } catch (e) {
    return res.status(500).json({
      error: true,
      message: e.message,
>>>>>>> e45908ff576559215b735a1d34107ba3ec6217e2
    });
  }
};

export const createSubAdmin = async (req, res) => {
<<<<<<< HEAD
  const { email, password, createdby, username } = req.body;
=======
  const { username, email, password, createdby } = req.body;
>>>>>>> e45908ff576559215b735a1d34107ba3ec6217e2
  console.log('create');
  console.log(req.body);

  bcrypt.hash(password, 10, async (err, hash) => {
    if (err) {
      return res.status(500).json({
        error: true,
        message: err,
      });
    }
    const newUser = new User({
      _id: new mongoose.Types.ObjectId(),
      username,
      email,
      password: hash,
      createdby,
      usertype: 'SUBADMIN',
    });
    try {
      const data = await newUser.save();
      const signupToken = jwt.sign(
        {
          username: data.username,
          userId: data._id,
        },
        process.env.JWT_KEY,
        {
          expiresIn: '30d',
        }
      );

      let response = {
        _id:data._id,
        username,
        email,
        usertype:data.usertype,
      }
      return res.status(200).json({ error: false, user: response, token: signupToken });
    } catch (e) {
      return res.status(500).json({ error: true, message: e.message });
    }
  });
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  // console.log('create');
  // console.log(req.body);
  try {
    const user = await User.findOne({ username });
    console.log(user);
    // const hashedPassword = await hashPassword(password);

    console.log(password, 'mypsss');

    if (user) {
      bcrypt.compare(password, user.password, (err, result) => {
        console.log(err);
        console.log(result);
        if (!result) {
          console.log('inside');
          return res.status(401).json({
            error: true,
            message: 'Auth failed',
          });
        }

        const loginToken = jwt.sign(
          {
            username: user.username,
            userId: user._id,
          },
          process.env.JWT_KEY,
          {
            expiresIn: '30d',
          }
        );

        let {email, usertype, _id} = user

        let response = {
          email,
          usertype,
          _id,
          username          
        }
          // user.password = null;
        return res.status(200).json({
          error: false,
          message: 'Auth successful',
          user:response,
          token: loginToken,
        });
      });
    } else {
      return res.status(401).json({
        error: true,
        message: 'error',
      });
    }
  } catch (error){
    console.log('err', error);
    return res.status(401).json({
      error: true,
      message: 'error',
    });
  }
};

export const createAdmin = async (req, res) => {
  const { username, email, password } = req.body;
  console.log('create');
  console.log(req.body);

  bcrypt.hash(password, 10, async (err, hash) => {
    if (err) {
      return res.status(500).json({
        error: true,
        message: err,
      });
    }
    const newUser = new User({
      _id: new mongoose.Types.ObjectId(),
      username,
      email,
      password: hash,
      usertype: 'ADMIN',
    });
    try {
      const data = await newUser.save();
      const signupToken = jwt.sign(
        {
          username: data.username,
          userId: data._id,
        },
        process.env.JWT_KEY,
        {
          expiresIn: '30d',
        }
      );
      let {_id, usertype} = data
      let response = {
        _id,
        username,
        email,
        usertype
      }
      return res.status(200).json({ error: false, user: response, token: signupToken });
    } catch (e) {
      return res.status(500).json({ error: true, message: e.message });
    }
  });
};

export const updateUser = async (req, res) => {
  try {
    const { UserName } = req.query;
    let data = {};
    console.log('UserName', UserName);
    data = req.body;
    console.log('query', req.query);
    const userId = mongoose.Types.ObjectId(req.params.id);
    console.log('id', userId);
    await User.updateUser(userId, data);
    return res.status(201).json({ error: false, message: 'user updated' });
  } catch (e) {
    return res.status(500).json({ error: true, message: e.message });
  }
};
export const modifyUser = async (req, res) => {
  try {
    const { UserName } = req.query;
    let data = {};
    console.log('UserName', UserName);
    data = req.body;
    console.log('query', req.query);
    const userId = mongoose.Types.ObjectId(req.params.id);
    console.log('id', userId);
    await User.modifyUser(userId, data);
    return res.status(201).json({ error: false, message: 'user updated' });
  } catch (e) {
    return res.status(500).json({ error: true, message: e.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
<<<<<<< HEAD
    return res.status(201).json({ error: false, user: await User.findOne({ _id: req.body._id }) });
=======
    const { username } = req.body;
    const result = await User.deleteOne({ username });
    return res.status(200).json({ error: false, message: 'User deleted', result });
>>>>>>> e45908ff576559215b735a1d34107ba3ec6217e2
  } catch (e) {
    return res.status(500).json({ error: true, message: e.message });
  }
};

export const getUser = async (req, res) => {
  try {
    return res.status(201).json({ error: false, user: await User.findOne({ username: req.body.username }) });
  } catch (e) {
    return res.status(500).json({ error: true, message: e.message });
  }
};

// export const getAllUser = async (req, res) => {
//   try {
//     return res.status(200).json({ allUser: await User.find() });
//   } catch (e) {
//     return res.status(500).json({ error: true, message: e.message });
//   }
// };

export const listUser = async (req, res) => {
  try {
    const { _id, usertype } = req.body;
    const result = await User.find({
      $and: [
        { createdby: _id }, { usertype },
      ],
    }, {"username":1, "email":1, "isdeactivated":1} );
    return res.status(200).json({ error: false, message: 'Users', result });
  } catch (e) {
    return res.status(500).json({ error: true, message: e.message });
  }
};
