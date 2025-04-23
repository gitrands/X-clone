import express from "express"
import { protectroute } from "../middleware/protectroute.js";


import {
	commentOnPost,
	createPost,
	deletePost,
	getAllPosts,
	getFollowingPosts,
	getLikedPosts,
	getUserPosts,
	likeUnlikePost,
} from "../controllers/post_controller.js";

const router = express.Router();

router.get("/all", protectroute, getAllPosts);
router.get("/following", protectroute, getFollowingPosts);
router.get("/likes/:id", protectroute, getLikedPosts);
router.get("/user/:username", protectroute, getUserPosts);
router.post("/create", protectroute, createPost);
router.post("/like/:id", protectroute, likeUnlikePost);
router.post("/comment/:id", protectroute, commentOnPost);
router.delete("/:id", protectroute, deletePost);
export default router;