import Post from "../models/post.js";
import User from "../models/user.js"
import { v2 as cloudinary } from "cloudinary";
import notification from "../models/notification.js"
export const createPost = async(req,res)=>{
    try{
   const {text}=req.body;
   let {img}=req.body;
   const userId = req.user._id.toString();
   const user = await User.findOne(req.user._id);
   if(!user){
    return res.status(400).json({error:"user not found"});

   }
   if(!text && !img){
    return res.status(400).json({error:"insufficient data to create post"});
   }
   
   
   if(img){
    const uploadedResponse = await cloudinary.uploader.upload(img);
    img = uploadedResponse.secure_url;   
   }
   const newPost = Post({
    user:userId,
    text,
    img,
    
   })

   await newPost.save();
   await res.status(201).json(newPost);

    }catch(error){
        console.log(`some error occured in createpost route : ${error.message}`)
    return res.status(400).json({error:"error occured in createpost route"})
    }
}


export const deletePost =async(req,res)=>{
    try{
     const postid = req.params.id;
     const post = await Post.findById(req.params.id);
    
     if(!post){
      return res.status(400).json({error:"Post not found"});

     }
     if(post.user.toString()!==req.user._id.toString()){
      return res.status(400).json({error:"you are not authenticated to delete this post"});
     }

     if (post.img) {
			const imgId = post.img.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(imgId);
		}
     await Post.findByIdAndDelete(req.params.id);

    return res.status(200).json({message:"Post successfully deleted"});

    }catch(error){
      console.log(`some error occured in deletepost route : ${error.message}`)
      return res.status(400).json({error:"error occured in deletepost route"})
    }
  }
  
  export const getAllPosts =async(req,res)=>{
    try{
      const posts = await Post.find()
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});
      if (posts.length === 0) {
        return res.status(200).json([]);
      }
  
      res.status(200).json(posts);
    }catch(error){
      console.log(`some error occured in getAllPosts route : ${error.message}`)
      return res.status(400).json({error:"error occured in getAllPosts route"})
    }
  }
  
  export const getFollowingPosts =async(req,res)=>{
    try{
      const userId = req.user._id;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found" });
  
      const following = user.following;
  
      const feedPosts = await Post.find({ user: { $in: following } })
        .sort({ createdAt: -1 })
        .populate({
          path: "user",
          select: "-password",
        })
        .populate({
          path: "comments.user",
          select: "-password",
        });
  
      res.status(200).json(feedPosts);
    }catch(error){
      console.log(`some error occured in getFollowingPosts route : ${error.message}`)
      return res.status(400).json({error:"error occured in getFollowingPosts route"})
    }
  }
  
  export const getLikedPosts =async(req,res)=>{
 
      const userId = req.params.id;

	try {
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(likedPosts);
  
    }catch(error){
      console.log(`some error occured in getLikedPosts route : ${error.message}`)
      return res.status(400).json({error:"error occured in getLikedPosts route"})
    }
  }
  
  export const likeUnlikePost = async (req, res) => {
    try {
        const { id: postId } = req.params;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" }); // Use 404 for "Not Found"
        }

        const userHasLiked = post.likes.includes(userId);

        if (userHasLiked) {
            // User has liked the post, so unlike it
            await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
            await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
            const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
 			      res.status(200).json(updatedLikes); // More consistent message
        } else {
            // User has not liked the post, so like it
            post.likes.push(userId);
            await post.save(); // **Crucially, save the post here!**

            await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });

            const newNotification = new notification({ // Corrected model name (assuming 'Notification')
                from: userId,
                to: post.user,
                type: "like",
            });
            await newNotification.save();

            const updatedLikes = post.likes;
 		      	res.status(200).json(updatedLikes);
        }
    } catch (error) {
        console.error("Error in likeUnlikePost route:", error); // Use console.error for errors
        return res.status(500).json({ error: "Internal server error" }); // Use 500 for server errors
    }
};
  export const commentOnPost = async (req, res) => {
    try {
      // Correctly extract post ID from route parameters
      const { id } = req.params;
      const post = await Post.findById(id);
      const { text } = req.body;
  
      // Get user ID from authenticated user (assuming middleware sets req.user)
      const userid = req.user._id;
  
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
  
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }
  
      // Create comment with valid user ID
      const comment = { user: userid, text };
      post.comments.push(comment);
  
      // Await the save operation
      await post.save();
  
      return res.status(200).json(post);
    } catch (error) {
      console.error(`Error in commentOnPost route: ${error.message}`);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
  
  export const getUserPosts =async(req,res)=>{
    try{
      const { username } = req.params;

      const user = await User.findOne({ username });
      if (!user) return res.status(404).json({ error: "User not found" });
  
      const posts = await Post.find({ user: user._id })
        .sort({ createdAt: -1 })
        .populate({
          path: "user",
          select: "-password",
        })
        .populate({
          path: "comments.user",
          select: "-password",
        });
  
      res.status(200).json(posts);
    }catch(error){
      console.log(`some error occured in getUserPosts route : ${error.message}`)
      return res.status(400).json({error:"error occured in getUserPosts route"})
    }
  }
  
  
  