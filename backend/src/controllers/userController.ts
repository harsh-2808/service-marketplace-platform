import { Request, Response } from "express";
import User from "../models/userModel.js";
import { createBookingService, getBookingsByCustomer, getServices } from "../service/customer/userService.js";

export const getUserDetails = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select("-password"); // exclude password

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "User details fetched successfully",
            user,
        });
    } catch (err: any) {
        console.error("Error fetching user:", err);
        res.status(500).json({ message: "Failed to fetch user details", error: err.message });
    }
};

export const getServicesController = async (req: Request, res: Response): Promise<void> => {
    try {
        const filters = {
            category: req.query.category as string,
            minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
            maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
            location: req.query.location as string,
            page: req.query.page ? Number(req.query.page) : 1,
            limit: req.query.limit ? Number(req.query.limit) : 10
        };

        const { services, total, totalPages, currentPage } = await getServices(filters);

        res.status(200).json({
            message: "Services fetched successfully",
            total,
            totalPages,
            currentPage,
            services
        });
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const createBookingController = async (req: Request, res: Response) => {
    try {
        const booking = await createBookingService(req.body);
        res.status(201).json({ message: "Booking successful", booking });
    } catch (err: any) {
        console.error("Create booking error:", err);
        res.status(500).json({ message: "Booking failed", error: err.message });
    }
};

export const getBookingsByCustomerController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const bookings = await getBookingsByCustomer(id);

        if (!bookings.length) {
            res.status(404).json({ message: "No bookings found for this customer" });
            return;
        }
        res.status(200).json(bookings);
    } catch (error: any) {
        console.error("Error fetching customer bookings:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
