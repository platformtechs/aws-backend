import mongoose, {Schema} from 'mongoose';

const RequirementSchema = new Schema({ 
   name:String,
   gender:String,
   board:Array,
   classGroup:String,
   classInfo:String, 
   subject:Array,
   languages:Array,
   address:String,
   isConnected:{
     type: Boolean,
     default:false
   },
   location: {
      type: {
        type: String,
        default: "Point"
      },
      coordinates: {
        type: [Number],
        default: [75.9115, 31.5143]
      }
    },
    description:String,
    student: {
        type: Schema.Types.ObjectId,
        ref: 'Student'
    },
    teacher:{
      type:Schema.Types.ObjectId,
      ref: 'Teacher'
    },
    selection:Array,
    views:Array
}, {timestamps: true})

RequirementSchema.statics.updateRequirement = async function (id, args) {
  try {
    console.log("in update")
    let result = await this.findByIdAndUpdate(id, {
      $set: {
        ...args
      }
    });
    console.log("result", result)
  } catch (e) {
    console.log("err", e)
  }
}

RequirementSchema.index({ location: "2dsphere" })

export default mongoose.model('Requirement', RequirementSchema);