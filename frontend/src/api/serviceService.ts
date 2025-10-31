import api from "./axiosInstance";
import type { Booking } from "./models/bookingModel";
import type { Service } from "./models/serviceModel";

export const addService = async (data: Service): Promise<Service> => {
  const res = await api.post<Service>("/api/service", data);
  return res.data;
};

export const updateService = async (id: string, data: Service): Promise<Service> => {
  const res = await api.put<Service>(`/api/service/${id}`, data);
  return res.data;
};

export const getServicesByTechnician = async (technicianId: string): Promise<Service[]> => {
  const res = await api.get<Service[]>(`/api/service/${technicianId}/services`);
  return res.data;
};

export const getBookingsByTechnician = async (technicianId: string): Promise<Booking[]> => {
  const res = await api.get<Booking[]>(`/api/service/${technicianId}/bookings`);
  return res.data;
};

export const completeBooking = async (bookingId: string): Promise<{ message: string }> => {
  const res = await api.put<{ message: string }>(`/api/service/${bookingId}/complete`);
  return res.data;
};

export const requestPayout = async (data: { technicianId: string; amount: number }): Promise<{ message: string }> => {
  const res = await api.post<{ message: string }>("/api/service/payout/request", data);
  return res.data;
};
