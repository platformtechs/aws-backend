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
    address: String,
    email: String,
    accessid: String,
    accesskey: String,
    instanceid: String,
    instancekey: String,
    isdeactivated: Boolean,
    issuspended: Boolean,
  },
  { timestamps: true }
);

UserSchema.statics.updateUser = async function (id, args) {
  try {
    console.log('in update');
    const result = await this.findByIdAndUpdate(id, { $set: { ...args } });
    console.log('result', result);
  } catch (e) {
    console.log('err', e);
  }
};
UserSchema.statics.createUser = async function (user) {
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
