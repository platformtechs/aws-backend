import mongoose, { Schema } from 'mongoose';

const StudentSchema = new Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    phone: {
      type: String,
    },
    password: String,
    bannerImage: String,
    profileImage: String,
    username: String,
    tagline: String,
    address: String,
    location: {
      type: {
        type: String,
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [75.9115, 31.5143],
      },
    },
    bio: String,
    school: String,
    classInfo: String,
    interests: {
      default: 'Music, Reading book, cricket',
      type: String,
    },
    board: Array,
    languages: Array,
    email: String,
    whatsapp: String,
    requirementsRef: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Requirement',
      },
    ],
  },
  { timestamps: true }
);

StudentSchema.index({ location: '2dsphere' });

StudentSchema.statics.updateStudent = async function (id, args) {
  try {
    console.log('in update');
    const result = await this.findByIdAndUpdate(id, { $set: { ...args } });
    console.log('result', result);
  } catch (e) {
    console.log('err', e);
  } 
};

StudentSchema.statics.addRequirement = async function (id, args) {
  console.log('requirement');
  const Requirement = mongoose.model('Requirement');
  const requirement = await new Requirement({ ...args, student: id });
  console.log('id', id);
  await this.findByIdAndUpdate(id, { $push: { requirementsRef: requirement.id } }, { returnNewDocument: true });
  return {
    requirement: await requirement.save(),
  };
};

export default mongoose.model('Student', StudentSchema);
