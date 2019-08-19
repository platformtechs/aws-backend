import mongoose, {Schema} from 'mongoose';

const TeacherSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    phone: {
        type: String,
    },
    password:String,
    bannerImage: String,
    profileImage: String,
    username: String,
    tagLine: String,
    address: String,
    location:{
        type: {
            type: String,
            default: "Point"
        },
        coordinates: {
            type: [Number],
            default: [75.9115, 31.5143],
        }
    },
    bio:String,
    teaches: Array,
    languages: Array,
    board: Array,
    classGroup: Array,
    email: String,
    whatsapp: String,
    experience:String,
    gender:String
  },
  { timestamps: true }
);
TeacherSchema.index({location:"2dsphere"})
TeacherSchema.statics.updateTeacher = async function (id, args) {
    try {
        console.log("in update")
        let result = await this.findByIdAndUpdate(id, { $set: { ...args } });
        console.log("result", result)
    } catch(e) {
        console.log("err", e)
    } 
}

export default mongoose.model('Teacher', TeacherSchema);