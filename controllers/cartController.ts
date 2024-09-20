import { Request, Response } from "express";
import { APP_CONSTANTS } from "../constants";
import UserCollection from "../schemas/UserSchema";

interface CartData {
  [itemId: string]: {
    [size: string]: number;
  };
}

// Add Products to user cart
const addToCart = async (req: Request, res: Response) => {
  try {
    const { userId, itemId, size } = req.body;

    // Fetch user data
    const userData = await UserCollection.findById(userId);

    // Ensure user exists and cartData is initialized
    if (!userData) {
      return res.status(404).json({
        success: false,
        status: APP_CONSTANTS.FAILED,
        msg: "User not found",
        data: null,
      });
    }

    let cartData: CartData = (userData.cartData as CartData) || {};

    // Ensure item and size exist in cartData
    if (!cartData[itemId]) {
      cartData[itemId] = {}; // Initialize the item if it doesn't exist
    }

    if (!cartData[itemId][size]) {
      cartData[itemId][size] = 0; // Initialize the size if it doesn't exist
    }

    // Increment the quantity
    cartData[itemId][size] += 1;

    // Update the user cart in the database
    const updatedUser = await UserCollection.findByIdAndUpdate(
      userId,
      { cartData },
      { new: true } // Return the updated document
    );

    return res.status(200).json({
      success: true,
      status: APP_CONSTANTS.SUCCESS,
      msg: "Added to Cart!",
      data: updatedUser?.cartData, // Send the updated cartData
    });
  } catch (err: any) {
    console.log(err);
    return res.status(500).json({
      success: false,
      status: APP_CONSTANTS.FAILED,
      msg: err.message,
      data: null,
    });
  }
};

// Update Products in user cart
const updateCart = async (req: Request, res: Response) => {
  try {
    const { userId, itemId, size, quantity } = req.body;

    // Fetch user data
    const userData = await UserCollection.findById(userId);

    if (!userData) {
      return res.status(404).json({
        success: false,
        status: APP_CONSTANTS.FAILED,
        msg: "User not found",
        data: null,
      });
    }

    let cartData: CartData = (userData.cartData as CartData) || {};

    // If the item exists in the cart
    if (cartData[itemId] && cartData[itemId][size] !== undefined) {
      if (quantity === 0) {
        // Remove the item size if quantity is 0
        delete cartData[itemId][size];

        // If no sizes remain for this item, remove the item completely
        if (Object.keys(cartData[itemId]).length === 0) {
          delete cartData[itemId];
        }
      } else {
        // Update the quantity for the size
        cartData[itemId][size] = quantity;
      }
    } else {
      // Item doesn't exist, so add it if quantity > 0
      if (quantity > 0) {
        if (!cartData[itemId]) {
          cartData[itemId] = {};
        }
        cartData[itemId][size] = quantity;
      } else {
        return res.status(400).json({
          success: false,
          status: APP_CONSTANTS.FAILED,
          msg: "Item not found in cart or invalid quantity",
          data: null,
        });
      }
    }

    // Update the user's cart in the database
    const updatedUser = await UserCollection.findByIdAndUpdate(
      userId,
      { cartData },
      { new: true } // Return the updated document
    );

    return res.status(200).json({
      success: true,
      status: APP_CONSTANTS.SUCCESS,
      msg: "Cart updated successfully",
      data: updatedUser?.cartData, // Send updated cartData
    });
  } catch (err: any) {
    console.log(err);
    return res.status(500).json({
      success: false,
      status: APP_CONSTANTS.FAILED,
      msg: err.message,
      data: null,
    });
  }
};

// Get User Cart Data
const getUserCart = async (req: Request, res: Response) => {
 try {

  const { userId } = req.body;

  // Fetch user data
  const userData = await UserCollection.findById(userId);

  if (!userData) {
    return res.status(404).json({
      success: false,
      status: APP_CONSTANTS.FAILED,
      msg: "User not found",
      data: null,
    });
  }

  let cartData: CartData = (userData.cartData as CartData) || {};

  return res.status(200).json({
    success: true,
    status: APP_CONSTANTS.SUCCESS,
    msg: "User Cart Data!",
    data: cartData,
  });
  
 } catch (err:any) {
  console.log(err);
    return res.status(500).json({
      success: false,
      status: APP_CONSTANTS.FAILED,
      msg: err.message,
      data: null,
    });
 }
};

export { addToCart, getUserCart, updateCart };
