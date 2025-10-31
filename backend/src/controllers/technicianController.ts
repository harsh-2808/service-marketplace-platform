import { Request, Response } from "express";
import { addService, updateService, getBookingsByTechnician, getServicesByTechnician, requestPayoutService, completeBookingService } from "../service/technician/providerService.js";
import { AuthRequest } from "../middleware/authMiddleware.js";


export const addServiceController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, category, description, price, location, availability } = req.body;
    const newService = await addService({
      name,
      category,
      description,
      price,
      location,
      availability,
      createdBy: req.user?.id,
    });

    res.status(201).json({ message: "Service added successfully", service: newService });
  } catch (error: any) {
    res.status(500).json({ message: "Error adding service", error: error.message });
  }
};

export const updateServiceController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updatedService = await updateService(id, req.body);

    if (!updatedService) {
      res.status(404).json({ message: "Service not found" });
      return;
    }

    res.status(200).json({ message: "Service updated successfully", service: updatedService });
  } catch (error: any) {
    res.status(500).json({ message: "Error updating service", error: error.message });
  }
};

export const getServicesByTechnicianController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const services = await getServicesByTechnician(id);

    if (!services.length) {
      res.status(404).json({ message: "No services found for this technician" });
      return;
    }

    res.status(200).json(services);
  } catch (error: any) {
    console.error("Error fetching technician services:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getBookingsByTechnicianController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const bookings = await getBookingsByTechnician(id);

    if (!bookings.length) {
      res.status(404).json({ message: "No bookings found for this technician" });
      return;
    }

    res.status(200).json(bookings);
  } catch (error: any) {
    console.error("Error fetching technician bookings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const completeBookingController = async (req: Request, res: Response) => {
  try {
    const booking = await completeBookingService(req.params.id);
    res.json({ message: "Booking marked as completed", booking });
  } catch (err: any) {
    console.error("Complete booking error:", err);
    res.status(500).json({ message: "Failed to complete booking", error: err.message });
  }
};

export const requestPayoutController = async (req: Request, res: Response) => {
  try {
    const payout = await requestPayoutService(req.body);
    res.json({ message: "Payout request created", payout });
  } catch (err: any) {
    console.error("Request payout error:", err);
    res.status(500).json({ message: "Failed to request payout", error: err.message });
  }
};






