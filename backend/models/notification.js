import mongoose, { Schema } from "mongoose";
import User from "./user.js";


const notificationSchema  = new mongoose.Schema({

  from:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true,
  },
  to:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true,
  },

  type:{
    type:String,
    required:true,
    enum:["follow","like"],
  },

  read:{
    type:Boolean,
    default:false,
  }

},
{timestamps:true})

const notification = mongoose.model("notification",notificationSchema);
export default notification ;