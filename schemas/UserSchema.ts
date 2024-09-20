import mongoose from "mongoose";
import { IUser } from "../models/IUser";

const UserSchema = new mongoose.Schema<IUser>(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    imageUrl: { type: String, required: true },
    cartData: { type: Object, default: {} }, // Define cartData as an object with default empty object
  },
  {
    minimize: false, // To prevent empty objects from being removed from MongoDB documents
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  }
);

const UserCollection = mongoose.model<IUser>("users", UserSchema);
export default UserCollection;