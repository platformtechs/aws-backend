/* eslint-disable no-console */
import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    password: String,
    username: String,
    usertype: String,
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

export default mongoose.model('User', UserSchema);
