import express from "express";
import { protectroute } from "../middleware/protectroute.js";
import { deleteNotifications, getNotifications } from "../controllers/notification.js";

const router = express.Router();

router.get("/", protectroute, getNotifications);
router.delete("/", protectroute, deleteNotifications);

export default router;