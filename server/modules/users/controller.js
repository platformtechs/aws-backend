/* eslint-disable keyword-spacing */
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
  const { accesskey, accessid, createdby, username } = req.body;
  console.log('create');
  console.log(req.body);

  const oldUser = await User.findOne({ username });
  if (oldUser) {
    return res.status(500).json({
      error: true,
      message: 'user already exist',
    });
  }
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
    });
  }
};

export const createSubAdmin = async (req, res) => {
  const { username, mobile, plan, password, createdby } = req.body;
  console.log('create');
  console.log(req.body);
  const oldUser = await User.findOne({ username });
  if (oldUser) {
    return res.status(500).json({
      error: true,
      message: 'user already exist',
    });
  }

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
      mobile,
      panelpass: password,
      plan,
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

      const response = {
        _id: data._id,
        username,
        mobile,
        usertype: data.usertype,
      };
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

    console.log(password, 'mypass');

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

        const { email, usertype, _id } = user;

        const response = {
          email,
          usertype,
          _id,
          username,
        };
        // user.password = null;
        return res.status(200).json({
          error: false,
          message: 'Auth successful',
          user: response,
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

export const changePass = async (req, res) => {
  const { oldPassword, password, _id } = req.body;
  try {
    const userId = mongoose.Types.ObjectId(_id);
    const user = await User.findById(userId);
    console.log('user', user);
    bcrypt.compare(oldPassword, user.password, (err, result) => {
      if (err){
        console.log('err', err);
        return res.status(401).json({
          error: true,
          message: 'Auth failed',
        });
      }
      console.log(result);
      if (!result) {
        console.log('inside');
        return res.status(401).json({
          error: true,
          message: 'Auth failed',
        });
      }
      bcrypt.hash(password, 10, async (err, hash) => {
        try {
          if (err) {
            return res.status(401).json({
              error: true,
              message: 'Auth failed',
            });
          }
          const data = { password: hash };
          const { result } = await User.updateUser(userId, data);
          const loginToken = jwt.sign({
            username: user.username,
            userId: user._id,
          },
          process.env.JWT_KEY, {
            expiresIn: '30d',
          }
          );
          return res.status(200).json({
            error: false,
            message: 'Auth successful',
            token: loginToken,
          });
        } catch (error) {
          return res.status(401).json({
            error: true,
            message: 'Auth failed',
          });
        }
      });
    });
  } catch (error) {
    console.log('err', error);
    return res.status(401).json({
      error: true,
      message: 'error',
    });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log('create');
    console.log(req.body);
    const oldUser = await User.findOne({ username });
    if (oldUser) {
      return res.status(500).json({
        error: true,
        message: 'user already exist',
      });
    }

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
        const signupToken = jwt.sign({
          username: data.username,
          userId: data._id,
        },
        process.env.JWT_KEY, {
          expiresIn: '30d',
        }
        );
        const {
          _id,
          usertype,
        } = data;
        const response = {
          _id,
          username,
          email,
          usertype,
        };
        return res.status(200).json({
          error: false,
          user: response,
          token: signupToken,
        });
      } catch (e) {
        return res.status(500).json({
          error: true,
          message: e.message,
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: e.message,
    });
  }
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

export const renewUser = async (req, res) => {
  try {
    console.log('renew');
    const { _id, days } = req.body;
    const userId = mongoose.Types.ObjectId(_id);
    const user = await User.findById(userId);
    console.log('user', user);
    const dateObj = new Date();
    const dateDB = new Date(user.expiredat);
    dateObj.setDate(dateDB.getDate() + Number(days));
    const dateData = dateObj.toLocaleDateString();
    console.log('expiredAt', dateData);
    const data = { expiredat: dateData };
    const { result } = await User.updateUser(userId, data);
    return res.status(201).json({ error: false, message: 'user updated' });
  } catch (e) {
    return res.status(500).json({ error: true, message: e.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { _id, createdby } = req.body;
    const result = await User.deleteOne({ _id });
    const user = await User.findById({ createdby });
    return res.status(200).json({ error: false, message: `User deleted by ${user.username}`, result });
  } catch (e) {
    return res.status(500).json({ error: true, message: e.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const userId = mongoose.Types.ObjectId(req.body._id);
    return res.status(201).json({ error: false, user: await User.findById(userId) });
  } catch (e) {
    return res.status(500).json({ error: true, message: e.message });
  }
};

// export const isActivate = async (req, res) => {
//   try {
//     const { _id } = req.body;
//     const user = await User.findById({ _id });
//     console.log(user);
//     if (user.isactivated){
//       return res.status(200).json({ error: false, message: 'Users', user });
//     }
//     else{

//     }
//   } catch (e) {
//     return res.status(500).json({ error: true, message: e.message });
//   }
// };
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
    });
    console.log(result);
    return res.status(200).json({ error: false, message: 'Users', result });
  } catch (e) {
    return res.status(500).json({ error: true, message: e.message });
  }
};
