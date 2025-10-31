import PayoutRequest from "../../models/payoutModel.js";
import User from "../../models/userModel.js";
import WalletTransaction from "../../models/walletTransactionModel.js";
import Booking from "../../models/bookingModel.js";

export const approvePayoutService = async (payoutId: string) => {
    const payout = await PayoutRequest.findById(payoutId);
    if (!payout) throw new Error("Payout request not found");

    const technician = await User.findById(payout.technicianId);
    if (!technician) throw new Error("Technician not found");

    if (payout.status !== "pending")
        throw new Error("Payout already processed");

    if (technician.walletBalance < payout.amount)
        throw new Error("Insufficient wallet balance");

    technician.walletBalance -= payout.amount;
    await technician.save();

    await WalletTransaction.create({
        userId: technician._id,
        type: "debit",
        amount: payout.amount,
        reference: payout._id,
        description: "Payout disbursed to bank",
    });

    payout.status = "approved";
    await payout.save();

    return payout;
};

export const calculateEarnings = async () => {
    const completedBookings = await Booking.find({ status: "completed" });

    const totalAmount = completedBookings.reduce(
        (sum, b) => sum + (b.amount || 0),
        0
    );

    const adminEarnings = totalAmount * 0.2;
    const technicianEarnings = totalAmount * 0.8;

    return { totalAmount, adminEarnings, technicianEarnings };
};

export const getMostBookedCategoryService = async () => {
    const bookings = await Booking.find({ status: "completed" }).populate(
        "serviceId",
        "category"
    );

    const categoryCount: Record<string, number> = {};

    bookings.forEach((b) => {
        const service = b.serviceId as any;
        if (service?.category) {
            categoryCount[service.category] =
                (categoryCount[service.category] || 0) + 1;
        }
    });

    const sortedCategories = Object.entries(categoryCount).sort(
        (a, b) => b[1] - a[1]
    );

    const topCategory =
        sortedCategories.length > 0
            ? { category: sortedCategories[0][0], count: sortedCategories[0][1] }
            : null;

    return { topCategory, allCategories: categoryCount };
};

export const getPendingPayoutsService = async () => {
    return await PayoutRequest.find({ status: "pending" });
};