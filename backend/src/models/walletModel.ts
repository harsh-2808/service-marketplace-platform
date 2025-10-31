import mongoose, { Schema, Document } from "mongoose";

export interface IWallet extends Document {
    technicianId: mongoose.Types.ObjectId;
    balance: number;
}

const walletSchema = new Schema<IWallet>({
    technicianId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    balance: { type: Number, required: true, default: 0 },
});

export default mongoose.model<IWallet>("Wallet", walletSchema);
