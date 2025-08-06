import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from "cookie-parser";

import { connectDB } from './config/mongodb.js';
import userRoutes from './routes/userRoutes.js';

//? Create App and PORT
const app=express();
const PORT=process.env.PORT || 4000;

//? DB Connection
connectDB();

//? Middlewares
app.use(express.json());
app.use(cors());
app.use(cookieParser());

//? API
app.get('/',(req,res)=>{
    res.send('App Running !!!')
})
app.use('/api/user',userRoutes)

app.listen(PORT,()=>{
    console.log(`Server is running on PORT:${PORT}`);
})