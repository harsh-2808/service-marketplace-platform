import api from "./axiosInstance";

export const getAdminEarnings = async () => {
    const res = await api.get("/api/admin/earnings");
    return res.data;
};

export const getMostBookedCategory = async () => {
    const res = await api.get("/api/admin/most-booked-category");
    return res.data;
};

export const getPendingPayouts = async () => {
    const res = await api.get("/api/admin/payouts/pending");
    return res.data.data;
};

export const approvePayout = async (payoutId: string) => {
    const res = await api.post(`/api/admin/${payoutId}/approve`);
    return res.data;
};