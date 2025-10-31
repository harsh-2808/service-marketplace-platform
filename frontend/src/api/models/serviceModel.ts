export interface Service {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    location: string;
    technicianName?: string;
    rating?: number;
    createdBy?: string;
}


export interface ServiceFilters {
    category?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
}
