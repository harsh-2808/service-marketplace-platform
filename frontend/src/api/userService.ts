import api from "./axiosInstance";
import type { ServiceFilters } from "./models/serviceModel";
import type { LoginRequest, LoginResponse, SignupRequest } from "./models/userModel";

export const loginUser = async (data: LoginRequest): Promise<LoginResponse> => {
  const res = await api.post<LoginResponse>("/api/auth/login", data);
  return res.data;
};

export const registerUser = async (data: SignupRequest): Promise<LoginResponse> => {
  const res = await api.post<LoginResponse>("/api/auth/signup", data);
  return res.data;
};

export const getProfile = async (id: string) => {
  const res = await api.get(`/api/users/${id}/profile`);
  return res.data;
};

export const getServices = async (filters: ServiceFilters) => {
  const params = new URLSearchParams();

  if (filters.category) params.append("category", filters.category);
  if (filters.location) params.append("location", filters.location);
  if (filters.minPrice !== undefined) params.append("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.append("maxPrice", String(filters.maxPrice));
  if (filters.page) params.append("page", String(filters.page));
  if (filters.limit) params.append("limit", String(filters.limit));

  const res = await api.get(`/api/users/all/services?${params.toString()}`);
  return res.data;
};

export const bookService = async (bookingData: {
  serviceId: string;
  customerId: string;
  technicianId: string;
  date: string;
  time: string;
}) => {
  const res = await api.post("/api/users/save/booking", bookingData);
  return res.data;
};

export const getCustomerBookings = async (customerId: string) => {
  const res = await api.get(`/api/users/get/${customerId}/bookings`);
  return res.data;
}