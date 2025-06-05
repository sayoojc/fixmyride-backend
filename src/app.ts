import dotenv from "dotenv";
dotenv.config(); 
import express from "express";
import http from "http";
import cors from "cors";
import { json, urlencoded } from "express";
import connectdb from "./config/dbConfig";
// import authRoutes from "./routes/auth.routes"; 


import adminUserRoutes from './routes/admin/user.routes'
import adminBrandRoutes from './routes/admin/brand.routes'
import adminModelRoutes from './routes/admin/model.routes'
import adminServicePackageRoutes from './routes/admin/servicePackage.routes'
import userAddressRoutes from './routes/user/address.routes'
import userBrandRoutes from './routes/user/brand.routes'
import userProfileRoutes from './routes/user/profile.routes'
import userVehicleRoutes from './routes/user/vehicle.routes'
import userServicePackageRoutes from './routes/user/servicePackage.routes'
import cartRoutes from './routes/user/cart.routes'
import adminAuthRoutes from './routes/admin/auth.routes'
import adminProviderRoutes from './routes/admin/provider.routes'
import userAuthRoutes from './routes/user/auth.routes'
import providerAuthRoutes from './routes/provider/auth.routes'
import providerProfileRoutes from './routes/provider/profile.routes'
import cookieParser from 'cookie-parser';
import { errorHandler } from "./middlewares/errorHandler";
import { StatusCode } from "./enums/statusCode.enum";
import passport from 'passport';
import './config/passport'
import { authenticateGoogle } from "./services/googleServices";
import { googleCallback,googleController } from "./services/googleServices";



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
app.get("/api/google", authenticateGoogle);

app.get("/api/google/callback", googleCallback, googleController);
///admin routes
app.use("/api/admin",adminAuthRoutes);
app.use("/api/admin",adminUserRoutes);
app.use("/api/admin",adminBrandRoutes); 
app.use("/api/admin",adminModelRoutes); 
app.use("/api/admin",adminProviderRoutes);
app.use("/api/admin",adminServicePackageRoutes)

///user routes
app.use("/api/user",userAuthRoutes);
app.use("/api/user",userAddressRoutes);
app.use("/api/user",userBrandRoutes);
app.use("/api/user",userProfileRoutes);
app.use("/api/user",userVehicleRoutes);
app.use("/api/user",userServicePackageRoutes);
app.use("/api/user",cartRoutes);
//provider routes
app.use("/api/provider",providerAuthRoutes);
app.use("/api/provider",providerProfileRoutes)




 
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
