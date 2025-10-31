import mongoose, { Schema, Document } from "mongoose";

export interface IWalletTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  type: "credit" | "debit";
  amount: number;
  reference?: mongoose.Types.ObjectId;
  description?: string;
}

const walletTransactionSchema = new Schema<IWalletTransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["credit", "debit"], required: true },
    amount: { type: Number, required: true },
    reference: { type: Schema.Types.ObjectId },
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IWalletTransaction>(
  "WalletTransaction",
  walletTransactionSchema
);
