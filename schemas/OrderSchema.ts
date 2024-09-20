import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: { type: String, required: true, default: "Order Placed" },
    paymentMethod: { type: String, required: true },
    payment: { type: Boolean, required: true, default: false },
    date: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }, // Optional createdAt field
    updatedAt: { type: Date, default: Date.now }, // Optional updatedAt field
  },
  { timestamps: true }
);

const OrderCollection =
  mongoose.models.order || mongoose.model("order", OrderSchema);
export default OrderCollection;
