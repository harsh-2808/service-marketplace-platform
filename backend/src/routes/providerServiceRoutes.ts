import express from "express";
import { addServiceController, completeBookingController, getBookingsByTechnicianController, getServicesByTechnicianController, requestPayoutController, updateServiceController } from "../controllers/technicianController.js";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, authorizeRoles("technician", "admin"), addServiceController);

router.put("/:id", verifyToken, authorizeRoles("technician", "admin"), updateServiceController);

router.get("/:id/services", verifyToken, authorizeRoles("technician", "admin"), getServicesByTechnicianController);

router.get("/:id/bookings", verifyToken, authorizeRoles("technician", "admin"), getBookingsByTechnicianController);

router.put("/:id/complete", verifyToken, authorizeRoles("technician", "admin"), completeBookingController);

router.post("/payout/request", verifyToken, authorizeRoles("technician", "admin"), requestPayoutController);

export default router;
