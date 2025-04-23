import express from 'express';
import authroutes from "./routes/routes.js"
import userroutes from "./routes/user.js"
import posts from "./routes/post_route.js"
import notification from './routes/notification_route.js';
import dotenv from 'dotenv'
import connectdb from './db/db.js'
import cookieParser from 'cookie-parser';
import { v2 as cloudinary } from "cloudinary";
import cors from 'cors';

dotenv.config();
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});
const app = express();
app.use(cors()); // Enable CORS
app.use(express.json({limit: '5mb'})); // Increase the limit to 50mb
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));
app.use("/api/auth",authroutes);
app.use("/api/users",userroutes);
app.use("/api/post",posts);
app.use("/api/notification",notification);
app.listen(5000 , ()=>{
    console.log("hi everyone this server listen")
    connectdb();
});