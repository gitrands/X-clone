import mongoose, { mongo } from "mongoose";

const connectdb = async()=>{
  

    try{
      const conn = await mongoose.connect(process.env.MONGO_DB);
      console.log('mongo is connected');
    }catch(err){
        console.log(`Error : ${err}`)
    }

}

export default connectdb ;