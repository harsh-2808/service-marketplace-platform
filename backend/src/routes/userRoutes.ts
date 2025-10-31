import express from "express";
import { createBookingController, getBookingsByCustomerController, getServicesController, getUserDetails } from "../controllers/userController.js";
import { authorizeRoles, verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:id/profile", verifyToken, getUserDetails);

router.get("/all/services", verifyToken, authorizeRoles("admin", "customer"), getServicesController);

router.post("/save/booking", verifyToken, authorizeRoles("customer"), createBookingController);

router.get("/get/:id/bookings", verifyToken, authorizeRoles("admin", "customer"), getBookingsByCustomerController);

export default router;
