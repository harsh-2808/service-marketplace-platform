import mongoose, { Schema, Document } from "mongoose";

export interface IService extends Document {
  name: string;
  category: string;
  description: string;
  price: number;
  location: string;
  availability: boolean;
  createdBy: mongoose.Types.ObjectId;
}

const serviceSchema = new Schema<IService>(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    availability: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IService>("Service", serviceSchema);
