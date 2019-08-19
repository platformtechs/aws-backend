import Teacher from './model';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const createTeacher = async (req, res) => {
  const { phone, password } = req.body;
  console.log('create');
  console.log(req.body);
  try {
    const user = await Teacher.findOne({ phone });
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
                        message:err
                    });
                } 
                    const newTeacher = new Teacher({
                        _id: new mongoose.Types.ObjectId(),
                        phone: phone,
                        password: hash
                    });
                    try {
                        let data = await newTeacher.save();
                        const signupToken = jwt.sign(
                            {
                                phone: data.phone,
                                userId: data._id
                            },
                            process.env.JWT_KEY,
                            {
                                expiresIn: "30d"
                            }
                        );
                        return res.status(200).json({ error:false, user: data, token:signupToken });
                    } catch (e) {
                        return res.status(500).json({ error: true, message: e.message })
                    }
                
            });
    }
  } catch (e) {
    return res.status(500).json({ error: true, message: e.message });
  }
};

export const updateTeacher = async (req, res) => {
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
    await Teacher.updateTeacher(userId, data);
    return res.status(201).json({ error: false, message: 'user updated' });
  } catch (e) {
    return res.status(500).json({ error: true, message: e.message });
  }
};

export const deleteTeacher = async (req, res) => {
  try {
    const { phone } = req.body;
    const result = await Teacher.deleteOne({ phone });
    return res.status(200).json({ error: false, message: 'Teacher deleted', result }); 
  } catch (e) {
    return res.status(500).json({ error: true, message: e.message });
  }
};

export const getTeacher = async (req, res) => {
  try {
    const userId = mongoose.Types.ObjectId(req.params.id);
    console.log('id', userId);
    return res.status(201).json({ error: false, user: await Teacher.findById({ _id: userId }) });
  } catch (e) {
    return res.status(500).json({ error: true, message: e.message });
  }
};

export const getNearbyTeacher = async (req, res) => {
  try {
    console.log(req.body.lng);
    const result = await Teacher.find({
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [
              parseFloat(req.body.lng),
              parseFloat(req.body.lat),
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

export const getAllTeacher = async (req, res) => {
  try {
    return res.status(200).json({ allTeacher: await Teacher.find() });
  }catch (e) {
    return res.status(500).json({ error: true, message: e.message });
  }
};
