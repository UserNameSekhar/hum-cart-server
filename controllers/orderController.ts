import { Request, Response } from "express";
import OrderCollection from "../schemas/OrderSchema";
import UserCollection from "../schemas/UserSchema";
import { APP_CONSTANTS } from "../constants";
import Stripe from "stripe";
import Razorpay from "razorpay";
import { log } from "console";

//Global variables
const currency = "inr";
const deliveryCharge = 10;

// Stripe Gateway initialize
const secretKey = process.env.STRIPE_SECRET_KEY || "";

const stripe = new Stripe(secretKey);

// Razorpay Gateway initialize
const key_id = process.env.RAZORPAY_KEY_ID || "";
const key_secret = process.env.RAZORPAY_SECRET_KEY || "";

const razorpayInstace = new Razorpay({ key_id, key_secret });

// Placing orders using COD Method
const placeOrder = async (req: Request, res: Response) => {
  try {
    const { userId, items, amount, address } = req.body;

    // Ensure all required fields are provided
    if (!userId || !items || !amount || !address) {
      return res.status(400).json({
        success: false,
        status: APP_CONSTANTS.FAILED,
        msg: "Missing required fields",
        data: null,
      });
    }

    // Prepare the order data
    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "cod",
      payment: false,
      date: Date.now(),
    };

    // Save new order in database
    const newOrder = new OrderCollection(orderData);
    await newOrder.save();

    // Clear the cart for the user
    await UserCollection.findByIdAndUpdate(userId, { cartData: {} });

    // Send success response
    return res.status(200).json({
      success: true,
      status: APP_CONSTANTS.SUCCESS,
      msg: "Order Placed!",
      data: newOrder,
    });
  } catch (error: any) {
    console.error("Error placing order: ", error);
    return res.status(500).json({
      success: false,
      status: APP_CONSTANTS.FAILED,
      msg: "Order Not Placed!",
      data: null,
    });
  }
};

//Placing orders using Stripe Method
const placeOrderStripe = async (req: Request, res: Response) => {
  try {
    const { userId, items, amount, address } = req.body;
    const { origin } = req.headers;

    // Ensure all required fields are provided
    if (!userId || !items || !amount || !address || !origin) {
      return res.status(400).json({
        success: false,
        status: APP_CONSTANTS.FAILED,
        msg: "Missing required fields",
        data: null,
      });
    }

    // Prepare the order data
    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "Stripe",
      payment: false,
      date: Date.now(),
    };

    // Save new order in database
    const newOrder = new OrderCollection(orderData);
    await newOrder.save();

    const line_items = items.map((item: any) => ({
      price_data: {
        currency: currency,
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency: currency,
        product_data: {
          name: "Delivery Charges",
        },
        unit_amount: deliveryCharge * 100,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
      line_items,
      mode: "payment",
    });

    // Clear the cart for the user
    // await UserCollection.findByIdAndUpdate(userId, { cartData: {} });

    // Send success response
    return res.status(200).json({
      success: true,
      session_url: session.url,
      status: APP_CONSTANTS.SUCCESS,
      msg: "Order Placed!",
      data: newOrder,
    });
  } catch (error: any) {
    console.error("Error placing order: ", error);
    return res.status(500).json({
      success: false,
      status: APP_CONSTANTS.FAILED,
      msg: "Order Not Placed!",
      data: null,
    });
  }
};

// Verify Stripe
const verifyStripe = async (req: Request, res: Response) => {
  const { orderId, success, userId } = req.body;

  try {
    if (success === "true") {
      await OrderCollection.findByIdAndUpdate(orderId, { payment: true });
      await UserCollection.findByIdAndUpdate(userId, { cartData: {} });

      // Send success response
      return res.status(200).json({
        success: true,
        msg: "Order Placed!",
      });
    } else {
      await OrderCollection.findByIdAndDelete(orderId);

      // Returning 400 for payment failure or invalid status
      return res.json({
        success: false,
        msg: "Payment verification failed.",
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      status: APP_CONSTANTS.FAILED,
      msg: error.message,
    });
  }
};

//Placing orders using Razorpay Method
const placeOrderRazorpay = async (req: Request, res: Response) => {
  try {
    const { userId, items, amount, address } = req.body;
    const { origin } = req.headers;

    // Ensure all required fields are provided
    if (!userId || !items || !amount || !address || !origin) {
      return res.status(400).json({
        success: false,
        status: APP_CONSTANTS.FAILED,
        msg: "Missing required fields",
        data: null,
      });
    }

    // Prepare the order data
    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "Razorpay",
      payment: false,
      date: Date.now(),
    };

    // Save new order in database
    const newOrder = new OrderCollection(orderData);
    await newOrder.save();

    const options = {
      amount: amount * 100,
      currency: currency.toUpperCase(),
      receipt: newOrder._id.toString(),
    };

    await razorpayInstace.orders.create(options, (error, order) => {
      if (error) {
        console.log(error);
        return res.json({
          success: false,
          msg: "error",
        });
      }

      // Send success response
      return res.status(200).json({
        success: true,
        order,
        status: APP_CONSTANTS.SUCCESS,
      });
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      status: APP_CONSTANTS.FAILED,
      msg: error.message,
    });
  }
};

const verifyRazorpay = async (req: Request, res: Response) => {
  try {
    const { userId, razorpay_order_id } = req.body;

    const orderInfo = await razorpayInstace.orders.fetch(razorpay_order_id);
    if (orderInfo.status === "paid") {
      await OrderCollection.findByIdAndUpdate(orderInfo.receipt, {
        payment: true,
      });
      await UserCollection.findByIdAndUpdate(userId, { cartData: {} });
      // Send success response
      return res.status(200).json({
        success: true,
        status: APP_CONSTANTS.SUCCESS,
        msg: "Payment Successful!",
      });
    } else {
      res.json({ success: false, msg: "Payment Failed!" });
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      status: APP_CONSTANTS.FAILED,
      msg: error.message,
    });
  }
};

//Get all orders
const allOrders = async (req: Request, res: Response) => {
  try {
    const orders = await OrderCollection.find({});

    // Send success response
    return res.status(200).json({
      success: true,
      status: APP_CONSTANTS.SUCCESS,
      msg: "All Orders!",
      data: orders,
    });
  } catch (error: any) {
    console.error("Error fetching orders: ", error);
    return res.status(500).json({
      success: false,
      status: APP_CONSTANTS.FAILED,
      msg: "Failed to fetch orders",
      data: null,
    });
  }
};

//Get all User Orders
const userOrders = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    // Ensure all required fields are provided
    if (!userId) {
      return res.status(400).json({
        success: false,
        status: APP_CONSTANTS.FAILED,
        msg: "Missing required fields",
        data: null,
      });
    }

    const orders = await OrderCollection.find({ userId });

    // Send success response
    return res.status(200).json({
      success: true,
      status: APP_CONSTANTS.SUCCESS,
      msg: "User Orders!",
      data: orders,
    });
  } catch (error: any) {
    console.error("Error fetching user orders: ", error);
    return res.status(500).json({
      success: false,
      status: APP_CONSTANTS.FAILED,
      msg: "Failed to fetch orders",
      data: null,
    });
  }
};

//Update Order Status from Admin
const updateStatus = async (req: Request, res: Response) => {
  try {
    const { orderId, status } = req.body;

    const updatedStatus = await OrderCollection.findByIdAndUpdate(orderId, {
      status,
    });

    // Send success response
    return res.status(200).json({
      success: true,
      status: APP_CONSTANTS.SUCCESS,
      msg: "Status Updated!",
      data: updatedStatus,
    });
  } catch (error: any) {
    console.error("Error updating the order status: ", error);
    return res.status(500).json({
      success: false,
      status: APP_CONSTANTS.FAILED,
      msg: "Failed to update status",
      data: null,
    });
  }
};

export {
  placeOrder,
  placeOrderStripe,
  placeOrderRazorpay,
  allOrders,
  userOrders,
  updateStatus,
  verifyStripe,
  verifyRazorpay,
};
