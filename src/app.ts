import dotenv from "dotenv";
dotenv.config(); 
import express from "express";
import http from "http";
import cors from "cors";
import { json, urlencoded } from "express";
import connectdb from "./config/dbConfig";
import authRoutes from "./routes/auth.routes"; 
import adminRoutes from "./routes/admin.routes"
import userRoutes from './routes/user.routes'
import cookieParser from 'cookie-parser';
import { errorHandler } from "./middlewares/errorHandler";
import { StatusCode } from "./enums/statusCode.enum";
import passport from 'passport';
import './config/passport'



const port = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);


app.use(cookieParser());

app.use(json({ limit: "50mb" }));
app.use(urlencoded({ extended: true, limit: "50mb" }));

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(passport.initialize());
app.use("/api/admin", adminRoutes);   
app.use("/api/auth", authRoutes);
app.use('/api/user',userRoutes);

 
 app.use("*",(req,res,next)=>{
   res.status(StatusCode.NOT_FOUND).send({message:'Invalid Route'})
 })
 app.use(errorHandler);


connectdb().then(() => {
    console.log("Database connected successfully");
       server.listen(port, () => {
        console.log(` Server running on port ${port}`);
    });
}).catch((error) => {
    console.error(" Database connection failed:", error);
    process.exit(1);
});

export default app;
