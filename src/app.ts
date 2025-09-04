import dotenv from "dotenv";
dotenv.config(); 
import express from "express";
import http from "http";
import cors from "cors";
import { json, urlencoded } from "express";
import connectdb from "./config/dbConfig";
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
import orderRoutes from './routes/user/order.routes'
import providerOrderRoutes from './routes/provider/order.routes'
import adminAuthRoutes from './routes/admin/auth.routes'
import adminProviderRoutes from './routes/admin/provider.routes'
import userAuthRoutes from './routes/user/auth.routes'
import providerAuthRoutes from './routes/provider/auth.routes'
import providerProfileRoutes from './routes/provider/profile.routes'
import providerNotificationRoutes from './routes/provider/notification.routes'
import providerSlotRoutes from './routes/provider/slot.routes'
import adminOrderRoutes from './routes/admin/order.routes'
import adminNotificationRoutes from './routes/admin/notification.routes'
import userProviderRoutes from './routes/user/provider.routes'
import cookieParser from 'cookie-parser'
import { errorHandler } from "./middlewares/errorHandler"
import { StatusCode } from "./enums/statusCode.enum"
import passport from 'passport'
import './config/passport'
import { authenticateGoogle } from "./services/googleServices";
import { googleCallback,googleController } from "./services/googleServices";
import { morganMiddleware, logger } from './config/logger';
import  container  from "./containers/container.config";
import { TYPES } from "./containers/types";
import { ISocketService } from "./sockets/ISocketService";

const socketService = container.get<ISocketService>(TYPES.SocketService);


const port = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);


app.use(cookieParser());
app.use(morganMiddleware);
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
app.use("/api/admin",adminServicePackageRoutes);
app.use("/api/admin",adminOrderRoutes);
app.use("/api/admin",adminNotificationRoutes);

///user routes
app.use("/api/user",userAuthRoutes);
app.use("/api/user",userAddressRoutes);
app.use("/api/user",userBrandRoutes);
app.use("/api/user",userProfileRoutes);
app.use("/api/user",userVehicleRoutes);
app.use("/api/user",userServicePackageRoutes);
app.use("/api/user",cartRoutes);
app.use("/api/user",orderRoutes);
app.use("/api/user",userProviderRoutes);
//provider routes
app.use("/api/provider",providerAuthRoutes);
app.use("/api/provider",providerProfileRoutes);
app.use("/api/provider",providerOrderRoutes);
app.use("/api/provider",providerNotificationRoutes);
app.use("/api/provider",providerSlotRoutes);




 
 app.use("*",(req,res,next)=>{
   res.status(StatusCode.NOT_FOUND).send({message:'Invalid Route'})
 })
 app.use(errorHandler);
socketService.initialize(server);

connectdb().then(() => {
    console.log("Database connected successfully");
    
      logger.info('Database connected successfully', { 
        dbName: process.env.DB_NAME, 
        dbHost: process.env.DB_HOST 
    });
    
       server.listen(port, () => {
        console.log(` Server running on port ${port}`);
         logger.info(`Server started on port ${port}`, {
            environment: process.env.NODE_ENV || 'development',
            pid: process.pid
        });
            logger.debug('Server configuration', {
            port: port,
            nodeVersion: process.version,
            platform: process.platform,
            memoryUsage: process.memoryUsage()
        });
    });
}).catch((error) => {
    console.error(" Database connection failed:", error);
        logger.error('Database connection failed', {
        error: error.message,
        stack: error.stack,
        dbConfig: {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME
        }
    });
    process.exit(1);
});

export default app;
