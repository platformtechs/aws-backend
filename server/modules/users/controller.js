/* eslint-disable no-console */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from './model';

export const createUser = async (req, res) => {
  const { email, password } = req.body;
  console.log('create');
  console.log(req.body);
  try {
    const user = await User.findOne({ email });
    if (user) {
      bcrypt.compare(password, user.password, async (err, result) => {
        if (err) {
          return res.status(401).json({
            error: true,
            message: 'Auth failed',
          });
        }
        if (result) {
          const loginToken = jwt.sign(
            {
              email: user.email,
              userId: user._id,
            },
            process.env.JWT_KEY,
            {
              expiresIn: '30d',
            }
          );
          // user.password = null;
          return res.status(200).json({
            error: false,
            message: 'Auth successful',
            user,
            token: loginToken,
          });
        }
      });
    } else {
      bcrypt.hash(password, 10, async (err, hash) => {
        if (err) {
          return res.status(500).json({
            error: true,
            message: err,
          });
        }
        const newUser = new User({
          _id: new mongoose.Types.ObjectId(),
          email,
          password: hash,
        });
        try {
          const data = await newUser.save();
          const signupToken = jwt.sign(
            {
              email: data.email,
              userId: data._id,
            },
            process.env.JWT_KEY,
            {
              expiresIn: '30d',
            }
          );
          return res.status(200).json({ error: false, user: data, token: signupToken });
        } catch (e) {
          return res.status(500).json({ error: true, message: e.message });
        }
      });
    }
  } catch (e) {
    return res.status(500).json({ error: true, message: e.message });
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

export const deleteUser = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await User.deleteOne({ email });
    return res.status(200).json({ error: false, message: 'User deleted', result });
  } catch (e) {
    return res.status(500).json({ error: true, message: e.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const userId = mongoose.Types.ObjectId(req.params.id);
    console.log('id', userId);
    return res.status(201).json({ error: false, user: await User.findById({ _id: userId }) });
  } catch (e) {
    return res.status(500).json({ error: true, message: e.message });
  }
};

export const getAllUser = async (req, res) => {
  try {
    return res.status(200).json({ allUser: await User.find() });
  } catch (e) {
    return res.status(500).json({ error: true, message: e.message });
  }
};
