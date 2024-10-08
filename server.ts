
import express from 'express';
import cors from 'cors';
import connectCloudinary from "./config/cloudinary";
import { DBUtil } from "./database/DBUtil";
import cartRouter from "./routers/cart/CartRouter";
import orderRouter from "./routers/orders/OrderRouter";
import productsRouter from "./routers/products/productsRouter";
import userRouter from "./routers/users/userRouter";
import dotenv from "dotenv";

// Initialize the express application
const app:express.Application = express();

//configure dot-env
dotenv.config({
  path: "./.env",
});

// Middlewares
app.use(cors());

// const corsOptions = {
//   origin: ["https://hum-cart-admin.vercel.app", "https://hum-cart.vercel.app"],
//   methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//   credentials: true, // Allow credentials (cookies, etc.)
// };

// // Apply CORS middleware globally
// app.use(cors(corsOptions));

// // Handle preflight requests
// app.options("*", cors(corsOptions));

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// Environment variables
const port: number = Number(process.env.PORT) || 8888;
const dbUrl: string = process.env.EXPRESS_APP_MONGODB_CLOUD_URL || "";
const dbName: string = process.env.EXPRESS_APP_MONGODB_DATABASE || "";

// Log environment variables to ensure they are loaded
if (port && dbUrl && dbName) {
  console.log(`\nEnvironment Variables:`);
  console.log(`---------------------------`);
  console.log("PORT :", port);
  console.log("DATABASE URL :", dbUrl);
  console.log("DATABASE NAME :", dbName);
}

// API Endpoints
app.get("/", (req: any, res: any) => {
  res.status(200).json({
    msg: "Welcome to React E-Commerce App",
  });
});
app.use("/api/user", userRouter);
app.use("/api/product", productsRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

// Router configuration
if (port && dbUrl && dbName) {
  app.listen(port, () => {
    console.log(`\nServer started at port ${port}`);
    DBUtil.connectToDB(dbUrl, dbName)
      .then((dbResponse) => {
        console.log(dbResponse);
      })
      .catch((error) => {
        console.error("DB Connection Error:", error);
        process.exit(1);
      });

    connectCloudinary();
  });
} else {
  console.error(
    "Missing environment variables: PORT, EXPRESS_APP_MONGODB_CLOUD_URL, or EXPRESS_APP_MONGODB_DATABASE"
  );
  process.exit(1);
}
