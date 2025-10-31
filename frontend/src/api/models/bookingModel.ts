export interface Booking {
    _id: string;

    serviceId: {
        _id: string;
        name: string;
        price: number;
        createdBy?: string; // technician ID
    };

    customerId: {
        _id: string;
        name: string;
        email: string;
    };

    technicianId?: {
        _id: string;
        name: string;
        email: string;
    };

    date: string;
    status: "pending" | "confirmed" | "completed" | "cancelled";
    amount: number;
    paymentStatus?: "unpaid" | "paid" | "refunded";
    createdAt?: string;
    updatedAt?: string;

    serviceName?: string;
    technicianName?: string;
    customerName?: string;
}
