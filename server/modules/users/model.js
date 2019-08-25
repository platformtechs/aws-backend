/* eslint-disable no-console */
import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import User from './model';

const UserSchema = new Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    password: String,
    username: String,
    usertype: String,
    createdby: String,
    awsadminid: String,
    adminId: String,
    address: String,
    email: String,
    accessid: String,
    accesskey: String,
    imageId: String,
    instanceid: String,
    instancekey: String,
    instancetype: String,
    isdeactivated: Boolean,
    issuspended: Boolean,
  },
  { timestamps: true }
);

UserSchema.statics.updateUser = async (id, args) => {
  try {
    console.log('in update');
    console.log('------------------------===============-----------------------');

    console.log('id', id);
    console.log('------------------------===============-----------------------');

    console.log('args', args);
    console.log('------------------------===============-----------------------');

    const result = await User.findByIdAndUpdate(id, { $set: { ...args } }, { new: true, upsert: true });

    console.log('result', result);
    return result;
  } catch (e) {
    console.log('err', e);
  }
};

UserSchema.static.modifyUser = async (id, args) => {
  try {
    console.log('in update');
    // const result = await this.findByIdAndUpdate(id, { $set: { ...args } });
    const result = await this.findAndModify({
      query: { _id: id },
      update: { $set: { ...args } },
      new: true,
    });
    console.log('result', result);
    return result;
  } catch (e) {
    console.log('err', e);
  }
};

UserSchema.statics.createUser = async (user) => {
  const { email, password, accesskey, accessid } = user;

  bcrypt.hash(password, 10, async (e, hash) => {
    if (e) {
      console.log('err', e);
    }
    const newUser = new User({
      _id: new mongoose.Types.ObjectId(),
      email,
      password: hash,
      accesskey,
      accessid,
    });
    await newUser.save();
  });
};
export default mongoose.model('User', UserSchema);
