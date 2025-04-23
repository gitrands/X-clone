import express from "express"
import {protectroute} from "../middleware/protectroute.js" 
import {getprofile,followunfollow, update,suggested} from "../controllers/user_controller.js"

const router = express.Router();

router.get("/getprofile/:username",protectroute,getprofile);
router.post("/follow/:id",protectroute,followunfollow);
router.post("/update",protectroute,update);
router.get("/suggest",protectroute,suggested)


export default router;