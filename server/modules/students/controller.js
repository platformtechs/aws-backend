/* eslint-disable no-console */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Student from './model';

export const createStudent = async (req, res) => {
  const { phone, password } = req.body;
  console.log('create');
  console.log(req.body);
  try {
    const user = await Student.findOne({ phone });
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
              phone: user.phone,
              userId: user._id,
            },
            process.env.JWT_KEY,
            {
              expiresIn: '30d',
            }
          );
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
        const newStudent = new Student({
          _id: new mongoose.Types.ObjectId(),
          phone,
          password: hash,
        });
        try {
          const data = await newStudent.save();
          const signupToken = jwt.sign(
            {
              phone: data.phone,
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

export const updateStudent = async (req, res) => {
  try {
    const { Image } = req.query;
    let data = {};
    console.log('Image', Image);
    if (Image && Image === 'bannerImage') {
      data = { ...req.body, bannerImage: req.file.path };
    }
    if (Image && Image === 'profileImage') {
      data = { ...req.body, profileImage: req.file.path };
    } else {
      data = req.body;
    }
    console.log('query', req.query);
    const userId = mongoose.Types.ObjectId(req.params.id);
    console.log('id', userId);
    await Student.updateStudent(userId, data);
    return res.status(201).json({ error: false, message: 'user updated' });
  } catch (e) {
    return res.status(500).json({ error: true, message: e.message });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const { phone } = req.body;
    const result = await Student.deleteOne({ phone });
    return res.status(200).json({ error: false, message: 'Student deleted', result }); 
  } catch (e) {
    return res.status(500).json({ error: true, message: e.message });
  }
};

export const getStudent = async (req, res) => {
  try {
    const userId = mongoose.Types.ObjectId(req.params.id);
    console.log('id', userId);
    return res.status(201).json({ error: false, user: await Student.findById({ _id: userId }) });
  } catch (e) {
    return res.status(500).json({ error: true, message: e.message });
  }
};

export const getNearbyStudent = async (req, res) => {
  try {
    console.log(req.query.lng);
    const result = await Student.find({
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [
              parseFloat(req.query.lng),
              parseFloat(req.query.lat),
            ],
          },
          $maxDistance: 5000,
        },
      },
    });
    return res.status(201).json({ error: false, userList: result });
  } catch (e) {
    return res.status(500).json({ error: true, message: e.message });
  }
};

export const getAllStudent = async (req, res) => {
  try {
    return res.status(200).json({ allStudent: await Student.find() });
  } catch (e) {
    return res.status(500).json({ error: true, message: e.message });
  }
};

export const addRequirement = async (req, res) => {
  console.log('addrequirement');
  try {
    const data = req.body;
    const userId = mongoose.Types.ObjectId(req.params.id);
    const { requirement } = await Student.addRequirement(userId, data);
    return res.status(200).json({ error: false, requirement });
  } catch (e) {
    return res.status(500).json({ error: true, message: e.message });
  }
};

export const getRequirement = async (req, res) => {
  console.log('requirements');
  try {
    const userId = mongoose.Types.ObjectId(req.params.id);
    const Requirement = mongoose.model('Requirement');
    return res.status(200).json({ error: false, requirements: await Requirement.find({ student: userId }) });
  } catch (e) {
    return res.status(500).json({ error: true, message: e.message });
  }
}
;
