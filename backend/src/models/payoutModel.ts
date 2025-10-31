import mongoose, { Schema, Document } from "mongoose";

export interface IPayoutRequest extends Document {
  technicianId: mongoose.Types.ObjectId;
  amount: number;
  status: "pending" | "approved" | "rejected";
}

const payoutSchema = new Schema<IPayoutRequest>(
  {
    technicianId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IPayoutRequest>("PayoutRequest", payoutSchema);
