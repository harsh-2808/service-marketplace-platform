import mongoose, { Schema, Document } from "mongoose";

export interface IBooking extends Document {
  serviceId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  technicianId: mongoose.Types.ObjectId;
  amount: number;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
}

const bookingSchema = new Schema<IBooking>(
  {
    serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    technicianId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IBooking>("Booking", bookingSchema);
