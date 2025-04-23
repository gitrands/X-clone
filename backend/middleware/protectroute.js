import jwt from "jsonwebtoken";
import User from "../models/user.js"


export const protectroute =async(req,res , next)=>{

   try{
const token = req.cookies.jwt;

    if(!token){
        return res.status(401).json({error:"Invalid token 1 "});
    }
 
    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    if(!decoded){
        return res.status(401).json({error:"Invalid token 2 "});

    }

    const user = await User.findById(decoded.userId).select("-password");

    req.user=user;
    next();

   }catch(error){
    console.log(`something went wrong on ${error.message}`);
     return res.status(400).json({error:"this catch method "})
   }
    

} 