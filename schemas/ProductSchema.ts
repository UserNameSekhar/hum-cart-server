
import mongoose from "mongoose";
import { IProduct } from "../models/IProduct";

const ProductSchema = new mongoose.Schema<IProduct>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    image: { type: [String], required: true }, // Explicitly define as an array of strings
    brand: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    sizes: { type: [String], required: true }, // Explicitly define as an array of strings
    bestseller: { type: Boolean, default: false }, // Optional boolean with default value
    date: { type: Number, required: true }, // Fix typo: it's 'date' not 'data'
    createdAt: { type: Date, default: Date.now }, // Optional createdAt field
    updatedAt: { type: Date, default: Date.now }, // Optional updatedAt field
  },
  { timestamps: true }
);

const ProductCollection =
  mongoose.models.product || mongoose.model<IProduct>("product", ProductSchema);
export default ProductCollection;
