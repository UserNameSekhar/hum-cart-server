import mongoose from "mongoose";
import UserCollection from "../schemas/UserSchema";
import { ThrowError } from "./ErrorUtil";

export const getUser = async (request: any, response: any) => {
  try {
    const theUser: any = request.headers["user"];
    const userId = theUser.id;
    if (!userId) {
      return response.status(401).json({
        msg: "Invalid User Request",
      });
    }
    const mongoUserId = new mongoose.Types.ObjectId(userId);
    let userObj: any = await UserCollection.findById(mongoUserId);
    if (!userObj) {
      return ThrowError(response, 404, "User in not found");
    }
    return userObj;
  } catch (error) {
    return ThrowError(response);
  }
};
