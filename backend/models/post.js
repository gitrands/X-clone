import mongoose from "mongoose";



const post_schema = new mongoose.Schema({

   user:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:"User",
   },
   text:{
    type:String,
   },
   img:{
    type:String,

   },
   likes:{
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    default: [],
   },
   comments:[
    {
     text:{
        type:String,
        required:true,
     },
     user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User",
       },

    },
    
   ],

},
{timestamps:true})



const Post = new mongoose.model("post",post_schema);
export default Post;