import Service from "../../models/serviceModel.js";
import User from "../../models/userModel.js";
import Booking from "../../models/bookingModel.js";
import { io, connectedUsers } from "../../index.js";
import WalletTransaction from "../../models/walletTransactionModel.js";

interface ServiceFilters {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    page?: number;
    limit?: number;
}

export const getServices = async (filters: ServiceFilters) => {
    const query: any = {};

    if (filters.category) query.category = filters.category;

    if (filters.location)
        query.location = { $regex: filters.location, $options: "i" };

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        query.price = {};
        if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
        if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const [services, total] = await Promise.all([
        Service.find(query).skip(skip).limit(limit),
        Service.countDocuments(query)
    ]);

    return {
        services,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page
    };
};

export const createBookingService = async (data: any) => {
    const { serviceId, customerId, technicianId, date, time } = data;

    const service = await Service.findById(serviceId);
    if (!service) throw new Error("Service not found");

    const customer = await User.findById(customerId);
    const technician = await User.findById(technicianId);
    if (!customer || !technician)
        throw new Error("Customer or Technician not found");

    const booking = await Booking.create({
        serviceId,
        customerId,
        technicianId,
        date,
        time,
        amount: service.price,
        status: "confirmed",
    });

    // Notify technician
    const techSocket = connectedUsers.get(technicianId);
    if (techSocket) {
        io.to(techSocket).emit("newBooking", {
            message: "You have a new booking!",
            booking,
        });
    }

    const admin = await User.findOne({ role: "admin" });
    if (!admin) throw new Error("Admin not found");

    admin.walletBalance += booking.amount;
    await admin.save();

    await WalletTransaction.create({
        userId: admin._id,
        type: "credit",
        amount: booking.amount,
        reference: booking._id,
        description: `Full booking amount credited for booking ${booking._id}`,
    });

    return booking;
};

export const getBookingsByCustomer = async (customerId: string) => {
    return await Booking.find({ customerId: customerId });
};