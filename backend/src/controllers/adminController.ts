import { Request, Response } from "express";
import { approvePayoutService, calculateEarnings, getMostBookedCategoryService, getPendingPayoutsService } from "../service/admin/adminService.js";


export const approvePayoutController = async (req: Request, res: Response) => {
    try {
        const payout = await approvePayoutService(req.params.id);
        res.json({ message: "Payout approved and disbursed", payout });
    } catch (err: any) {
        console.error("Approve payout error:", err);
        res.status(500).json({ message: "Failed to approve payout", error: err.message });
    }
};

export const getAdminEarnings = async (req: Request, res: Response) => {
    try {
        const result = await calculateEarnings();
        res.status(200).json({
            message: "Earnings calculated successfully",
            ...result,
        });
    } catch (err) {
        console.error("Error calculating admin earnings:", err);
        res.status(500).json({ message: "Failed to calculate admin earnings" });
    }
};

export const getMostBookedCategory = async (req: Request, res: Response) => {
    try {
        const data = await getMostBookedCategoryService();
        res.status(200).json({
            message: "Most booked category fetched successfully",
            ...data,
        });
    } catch (err) {
        console.error("Error fetching most booked category:", err);
        res.status(500).json({ message: "Failed to fetch most booked category" });
    }
};

export const getPendingPayoutsController = async (req: Request, res: Response) => {
    try {
        const pendingPayouts = await getPendingPayoutsService();
        res.status(200).json({
            message: "Pending payouts fetched successfully",
            data: pendingPayouts,
        });
    } catch (err: any) {
        console.error("Error fetching pending payouts:", err);
        res.status(500).json({
            message: "Failed to fetch pending payouts",
            error: err.message,
        });
    }
};