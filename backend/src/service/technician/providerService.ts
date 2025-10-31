
import Service, { IService } from "../../models/serviceModel.js";
import Booking from "../../models/bookingModel.js";
import User, { IUser } from "../../models/userModel.js";
import WalletTransaction from "../../models/walletTransactionModel.js";
import PayoutRequest from "../../models/payoutModel.js";
import { io, connectedUsers } from "../../index.js";

export const addService = async (serviceData: Partial<IService>): Promise<IService> => {
  const service = new Service(serviceData);
  return await service.save();
};

export const updateService = async (id: string, updateData: Partial<IService>): Promise<IService | null> => {
  return await Service.findByIdAndUpdate(id, updateData, { new: true });
};

export const getServicesByTechnician = async (technicianId: string): Promise<IService[]> => {
  return await Service.find({ createdBy: technicianId });
};

export const getBookingsByTechnician = async (technicianId: string) => {
  const bookings = await Booking.find({ technicianId })
    .populate<{ customerId: IUser }>("customerId", "name email")
    .populate<{ technicianId: IUser }>("technicianId", "name email")
    .populate<{ serviceId: IService }>("serviceId", "name price");

  const formatted = bookings.map((b) => {
    const service = b.serviceId as unknown as IService;
    const technician = b.technicianId as unknown as IUser;
    const customer = b.customerId as unknown as IUser;

    return {
      ...b.toObject(),
      serviceName: service?.name || "N/A",
      technicianName: technician?.name || "N/A",
      customerName: customer?.name || "N/A",
    };
  });

  return formatted;
};

export const completeBookingService = async (bookingId: string) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error("Booking not found");

  const admin = await User.findOne({ role: "admin" });
  if (!admin) throw new Error("Admin not found");

  const technician = await User.findById(booking.technicianId);
  if (!technician) throw new Error("Technician not found");

  const commissionRate = 0.2;
  const adminCommission = booking.amount * commissionRate;
  const technicianShare = booking.amount - adminCommission;

  admin.walletBalance -= technicianShare;
  technician.walletBalance += technicianShare;
  await Promise.all([admin.save(), technician.save()]);

  await WalletTransaction.insertMany([
    {
      userId: admin._id,
      type: "debit",
      amount: technicianShare,
      reference: booking._id,
      description: `Transferred ${technicianShare} to technician`,
    },
    {
      userId: technician._id,
      type: "credit",
      amount: technicianShare,
      reference: booking._id,
      description: `Earnings from booking ${booking._id}`,
    },
  ]);

  booking.status = "completed";
  await booking.save();

  // Notify customer
  const customerSocket = connectedUsers.get(booking.customerId.toString());
  if (customerSocket) {
    io.to(customerSocket).emit("bookingStatusUpdate", {
      bookingId: booking._id,
      status: booking.status,
    });
  }

  return booking;
};

export const requestPayoutService = async (data: any) => {
  const { technicianId, amount } = data;
  const technician = await User.findById(technicianId);
  if (!technician) throw new Error("Technician not found");

  if (technician.walletBalance < amount)
    throw new Error("Insufficient wallet balance");

  const payout = await PayoutRequest.create({
    technicianId,
    amount,
    status: "pending",
  });

  return payout;
};



