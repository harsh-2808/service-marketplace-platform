import express from "express";
import { authorizeRoles, verifyToken } from "../middleware/authMiddleware.js";
import { approvePayoutController, getAdminEarnings, getMostBookedCategory, getPendingPayoutsController } from "../controllers/adminController.js";

const router = express.Router();

router.post("/:id/approve", verifyToken, authorizeRoles("admin"), approvePayoutController);

router.get("/earnings", verifyToken, authorizeRoles("admin"), getAdminEarnings);

router.get("/most-booked-category", verifyToken, authorizeRoles("admin"), getMostBookedCategory);

router.get("/payouts/pending", verifyToken, authorizeRoles("admin"), getPendingPayoutsController);

export default router;
