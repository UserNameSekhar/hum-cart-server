import bcryptjs from "bcryptjs";
import gravatar from "gravatar";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { APP_CONSTANTS } from "../constants";
import { IUser } from "../models/IUser";
import UserCollection from "../schemas/UserSchema";
import { ThrowError } from "../utils/ErrorUtil";
import * as UserUtil from "../utils/UserUtil";

/**
 * @usage : Register a User
 * @url : http://localhost:9000/api/users/register
 * @params : username, email, password
 * @method : POST
 * @access : PUBLIC
 */
export const registerUser = async (request: any, response: any) => {
  try {
    //read the form data
    let { username, email, password } = request.body;

    //check if email exists or not
    let userObj = await UserCollection.findOne({ email });
    if (userObj) {
      return response.status(401).json({
        msg: "User with this Email already exists",
        data: null,
        status: APP_CONSTANTS.FAILED,
      });
    }

    //get the gravatar url
    let imageUrl: string = gravatar.url(email, {
      size: "200",
      rating: "pg",
      default: "mm",
    });

    //hash password
    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);

    //Create an user
    let newUser: IUser = {
      username: username,
      email: email,
      password: hashPassword,
      imageUrl: imageUrl,
    };

    let user = await new UserCollection(newUser).save();
    if (user) {
      return response.status(201).json({
        msg: "User Registration is Success!",
        status: APP_CONSTANTS.SUCCESS,
        data: null,
      });
    }
  } catch (error) {
    return ThrowError(response);
  }
};

/**
 * @usage : Login a User
 * @url : http://localhost:9000/api/users/login
 * @params : email, password
 * @method : POST
 * @access : PUBLIC
 */

export const loginUser = async (request: any, response: any) => {
  try {
    let { email, password } = request.body;

    //Verify email and password
    let userObj = await UserCollection.findOne({ email });
    if (!userObj) {
      return response.status(401).json({
        msg: "Invalid Email ID",
        data: null,
        status: APP_CONSTANTS.FAILED,
      });
    }

    let isMatch: boolean = await bcryptjs.compare(password, userObj.password);
    if (!isMatch) {
      return response.status(401).json({
        msg: "Invalid Password",
        data: null,
        status: APP_CONSTANTS.FAILED,
      });
    }

    const createToken = (id: string) => {
      return jwt.sign({ id }, process.env.EXPRESS_APP_JWT_SECRET_KEY || "");
    };

    const token = createToken(userObj._id);
    return response.status(200).json({
      msg: `Welcome Back! ${userObj.username}`,
      token: token,
      data: userObj,
      status: APP_CONSTANTS.SUCCESS,
    });
  } catch (error) {
    return ThrowError(response);
  }
};

/**
 * @usage : Login a admin
 * @url : http://localhost:9000/api/users/admin
 * @params : email, password
 * @method : POST
 * @access : PUBLIC
 */
export const loginAdmin = async (request: any, response: any) => {
  try {
    const { email, password } = request.body;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Check if email and password are provided
    if (!email || !password) {
      return response.status(400).json({
        msg: "Please provide both email and password",
        status: "FAILURE",
      });
    }

    // Check if credentials match the environment variables
    if (email === adminEmail && password === adminPassword) {
      const payload = { email };

      const secretKey: string | undefined =
        process.env.EXPRESS_APP_JWT_SECRET_KEY;
      if (!secretKey) {
        return response.status(500).json({
          msg: "Internal Server Error: Secret key is missing",
          status: "FAILURE",
        });
      }

      // Generate JWT token
      const token = jwt.sign(payload, secretKey, {
        expiresIn: "1h", // Token expires in 1 hour
      });

      // Send response with token
      return response.status(200).json({
        msg: `Welcome Back! ${email}`,
        token: token,
        data: null,
        status: "SUCCESS",
      });
    } else {
      // Invalid credentials
      return response.status(401).json({
        msg: "Invalid email or password",
        status: "FAILURE",
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    return response.status(500).json({
      msg: "Something went wrong during login",
      status: "FAILURE",
    });
  }
};

/**
 * @usage : Get User's Data
 * @url : http://localhost:9000/api/users/me
 * @param : request
 * @param : response
 * @method : GET
 * @access : PRIVATE
 */
export const getUsersData = async (request: any, response: any) => {
  try {
    //Check if the user exists
    const theUser = await UserUtil.getUser(request, response);
    if (theUser) {
      response.status(200).json({
        data: theUser,
        status: APP_CONSTANTS.SUCCESS,
        msg: "Current User Data",
      });
    }
  } catch (error) {
    return ThrowError(response);
  }
};

/**
 * @usage : Update Profile Picture
 * @url : http://localhost:9000/api/users/profile
 * @params : imageUrl
 * @method : POST
 * @access : PRIVATE
 */
export const updateProfilePicture = async (request: any, response: any) => {
  try {
    const { imageUrl } = request.body;
    const theUser: any = await UserUtil.getUser(request, response);
    if (theUser) {
      theUser.imageUrl = imageUrl;
      const userObj = await theUser.save();
      if (userObj) {
        response.status(200).json({
          status: APP_CONSTANTS.SUCCESS,
          msg: "Profile Picture is Updated!",
          data: userObj,
        });
      }
    }
  } catch (error) {
    return ThrowError(response);
  }
};

/**
 * @usage : Change The Password
 * @url : http://localhost:9000/api/users/change-password
 * @param : password
 * @method : POST
 * @access : PRIVATE
 */
export const changePassword = async (request: any, response: any) => {
  try {
    const { password } = request.body;
    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);
    const theUser: any = await UserUtil.getUser(request, response);
    if (theUser) {
      theUser.password = hashPassword;
      const userObj = await theUser.save();
      if (userObj) {
        return response.status(200).json({
          status: APP_CONSTANTS.SUCCESS,
          msg: "Password has changed successfully!",
          data: userObj,
        });
      }
    }
  } catch (error) {
    return ThrowError(response);
  }
};

/**
 * @usage : Get All Users
 * @url : http://localhost:9000/api/users/
 * @params : no-params
 * @method : GET
 * @access : PRIVATE
 */
export const getAllUsers = async (request: any, response: any) => {
  try {
    const theUser: any = await UserUtil.getUser(request, response);
    if (theUser) {
      const theUsers: IUser[] | any = await UserCollection.find().populate({
        path: "userObj",
        strictPopulate: false,
      });
      return response.status(200).json({
        status: APP_CONSTANTS.SUCCESS,
        msg: "All Users",
        data: theUsers,
      });
    }
  } catch (error) {
    return ThrowError(response);
  }
};

/**
 * @usage : Update a User Role
 * @url : http://localhost:9000/api/users/:userId
 * @params : isAdmin, isSuperAdmin
 * @method : PUT
 * @access : PRIVATE
 */
export const updateUser = async (request: any, response: any) => {
  try {
    const { isAdmin, isSuperAdmin } = request.body;
    const { userId } = request.params;
    const mongoUserId = new mongoose.Types.ObjectId(userId);

    const theUser: any = await UserUtil.getUser(request, response);
    if (theUser) {
      // Check if the user exists
      const existingUser = await UserCollection.findById(mongoUserId);
      if (!existingUser) {
        return ThrowError(response, 404, "The User does not exist!");
      }

      const newUser = {
        isAdmin: isAdmin,
        isSuperAdmin: isSuperAdmin,
      };

      const updatedUser = await UserCollection.findByIdAndUpdate(
        mongoUserId,
        {
          $set: newUser,
        },
        { new: true }
      );

      if (updatedUser) {
        return response.status(200).json({
          status: APP_CONSTANTS.SUCCESS,
          msg: "User is Updated Successfully!",
          data: updatedUser,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return ThrowError(response, 500, "Server Error");
  }
};

/**
 * @usage : Delete a User
 * @url : http://localhost:9000/api/users/:userId
 * @params : no-params
 * @method : DELETE
 * @access : PRIVATE
 */
export const deleteUser = async (request: any, response: any) => {
  try {
    const { userId } = request.params;
    const mongoUserId = new mongoose.Types.ObjectId(userId);

    const theUser: any = await UserUtil.getUser(request, response);
    if (theUser) {
      const userToDelete: IUser | any = await UserCollection.findById(
        mongoUserId
      );

      if (!userToDelete) {
        return ThrowError(response, 404, "User is not Found!");
      }

      const deletedUser = await UserCollection.findByIdAndDelete(mongoUserId);
      if (deletedUser) {
        return response.status(200).json({
          status: APP_CONSTANTS.SUCCESS,
          msg: `The User ${deletedUser.username} is Deleted!`,
          data: deletedUser,
        });
      }
    }
  } catch (error) {
    return ThrowError(response);
  }
};
