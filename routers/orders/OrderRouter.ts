import express from "express";
import {
  allOrders,
  placeOrder,
  placeOrderRazorpay,
  placeOrderStripe,
  updateStatus,
  userOrders,
  verifyRazorpay,
  verifyStripe,
} from "../../controllers/orderController";
import { adminAuth } from "../../middleware/adminAuth";
import userAuth from "../../middleware/userAuth";

const orderRouter = express.Router();

//Admin Features
orderRouter.post("/list", adminAuth, allOrders);
orderRouter.post("/status", adminAuth, updateStatus);

//Payment Features
orderRouter.post("/place", userAuth, placeOrder);
orderRouter.post("/stripe", userAuth, placeOrderStripe);
orderRouter.post("/razorpay", userAuth, placeOrderRazorpay);

//User Feature
orderRouter.post("/userorders", userAuth, userOrders);

//Verify Payment
orderRouter.post("/verifyStripe", userAuth, verifyStripe);
orderRouter.post("/verifyRazorpay", userAuth, verifyRazorpay);

export default orderRouter;
