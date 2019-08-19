
import mongoose from 'mongoose';
import User from '../modules/users/model';

export const Admin = (req, res, next) => {
  try {
    const { _id } = req.body;
    const userId = mongoose.Types.ObjectId(_id);
    const user = User.findById(userId);

    if (user.usertype === 'ADMIN') {
      next();
    } else {
      return res.status(403).json({
        error: true,
        message: 'Forbidden',
      });
    }
  } catch (error) {
    return res.status(403).json({
      error: true,
      message: 'Forbidden',
    });
  }
};

export const SubAdmin = (req, res, next) => {
  try {
    const { _id } = req.body;
    const userId = mongoose.Types.ObjectId(_id);
    const user = User.findById(userId);

    if (user.usertype === 'SUBADMIN' && user.usertype === 'ADMIN') {
      next();
    } else {
      return res.status(403).json({
        error: true,
        message: 'Forbidden',
      });
    }
  } catch (error) {
    return res.status(403).json({
      error: true,
      message: 'Forbidden',
    });
  }
};

