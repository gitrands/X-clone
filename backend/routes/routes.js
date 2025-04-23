import express from 'express'
import {signup , login, logout,getme} from "../controllers/controllers.js"
import {protectroute} from "../middleware/protectroute.js"
const router = express.Router();

router.post("/signup",signup);
router.post("/login",login);
 router.post("/logout",logout);
router.get("/getuser",protectroute,getme)

 export default router;