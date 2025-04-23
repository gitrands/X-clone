import User from "../models/user.js"
import bcrypt from "bcryptjs";

import { v2 as cloudinary } from "cloudinary";
export const getprofile=async(req,res)=>{
      

     
     try{
        const {username}=req.params;
     const user = await User.findOne({username}).select("-password");

     if(!user){
        return res.status(400).json({error:"user not found"});
     }


     res.status(200).json(user);
     }catch(error){
        console.log(`some error occured in getprofile : ${error.message}`)
        res.status(400).json({error:"error occured in getprofile route"})
     }


};

export const followunfollow = async (req, res) => {
  try {
    const { id } = req.params;
    const currentuser = await User.findById(req.user._id);
    const destinationuser = await User.findById(id);

    // Check if users exist
    if (!currentuser || !destinationuser) {
      return res.status(400).json({ error: "User not found" }); // Added return
    }

    // Prevent self-follow
    if (id === req.user._id.toString()) {
      return res.status(400).json({ error: "You cannot follow yourself" }); // Added return
    }

    const isfollow = currentuser.following.includes(id);

    if (isfollow) {
      // Unfollow
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      return res.status(200).json({ message: "User unfollowed successfully" }); // Added return
    } else {
      // Follow
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
      return res.status(200).json({ message: "User followed successfully" }); // Added return
    }
  } catch (error) {
    console.log(`Some error occurred in followunfollow route: ${error}`);
    if (!res.headersSent) {
      return res.status(400).json({ error: "Error occurred in followunfollow route" });
    }
  }
};
     


export const update=async(req,res)=>{
    const { fullname, email, username, currentPassword, newPassword, bio, link } = req.body;
    let {  coverImg , profileImg } = req.body;
    const userId = req.user._id;
   try{
      
    let  user = await User.findById(userId);
    
    if(!user){
      return res.status(400).json({error:"user invalid"})
    }
if(profileImg){
      console.log("profileImg");
    }
    if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
			return res.status(400).json({ error: "Please provide both current password and new password" });
		}
    if (currentPassword && newPassword) {
			const isMatch = await bcrypt.compare(currentPassword, user.password);
			if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });
			if (newPassword.length < 6) {
				return res.status(400).json({ error: "Password must be at least 6 characters long" });
			}

			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(newPassword, salt);
		}

    if (profileImg) {
			if (user.profileImg) {
				// https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
				await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
			}

			const uploadedResponse = await cloudinary.uploader.upload(profileImg);
			profileImg = uploadedResponse.secure_url;
		}

		if (coverImg) {
			if (user.coverImg) {
				await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
			}

			const uploadedResponse = await cloudinary.uploader.upload(coverImg);
			coverImg = uploadedResponse.secure_url;
		}
   
    user.fullname = fullname || user.fullname;
		user.email = email || user.email;
		user.username = username || user.username;
		user.bio = bio || user.bio;
		user.link = link || user.link;
		user.profileImg = profileImg || user.profileImg;
		user.coverImg = coverImg || user.coverImg;


		 user = await user.save();

		// password should be null in response
		user.password = null;

		return res.status(200).json(user);

   

   }catch(error){
    console.log(`some error occured in update route : ${error.message}`)
    return res.status(400).json({error:"error occured in update route"})
   }


}

export const suggested = async(req,res)=>{
  try{
   const userId = req.user._id;

   const usersFollowedByMe = await User.findById(userId).select("following");

   const users = await User.aggregate([
     {
       $match: {
         _id: { $ne: userId },
       },
     },
     { $sample: { size: 10 } },
   ]);

   // 1,2,3,4,5,6,
   const filteredUsers = users.filter((user) => !usersFollowedByMe.following.includes(user._id));
   const suggestedUsers = filteredUsers.slice(0, 4);

   suggestedUsers.forEach((user) => (user.password = null));

   res.status(200).json(suggestedUsers);




  }catch(error){
    console.log(`some error occured in suggested route : ${error.message}`)
    return res.status(400).json({error:"error occured in suggested route"})
  }
}
