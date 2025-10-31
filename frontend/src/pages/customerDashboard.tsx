import { useEffect, useState } from "react";
import ServiceCard from "../components/ServiceCard";
import type { Service, ServiceFilters } from "../api/models/serviceModel";
import { useAuth } from "../context/AuthContext";
import { socket } from "../socket";
import {
  bookService,
  getCustomerBookings,
  getServices,
} from "../api/userService";
import LogoutButton from "../components/logout";

interface Booking {
  _id: string;
  serviceId: {
    name: string;
    description?: string;
    price: number;
  };
  date: string;
  time: string;
  amount: number;
  status: string;
}

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState<"services" | "bookings">(
    "services"
  );
  const { user } = useAuth();

  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filters, setFilters] = useState<ServiceFilters>({
    minPrice: 0,
    maxPrice: 10000,
    location: "",
    page: 1,
    limit: 6,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Register socket
  useEffect(() => {
    if (user?._id) {
      socket.emit("register", user._id);
    }
  }, [user]);

  // Fetch available services
  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await getServices(filters);
      setServices(data.services);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch customer bookings
  const fetchBookings = async () => {
    if (!user?._id) return;
    try {
      setLoadingBookings(true);
      const data = await getCustomerBookings(user._id);
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    if (activeTab === "services") {
      fetchServices();
    } else if (activeTab === "bookings") {
      fetchBookings();
    }
  }, [activeTab, filters]);

  // Handle filters
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: name.includes("Price") ? Number(value) : value,
      page: 1,
    }));
  };

  // Pagination
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setFilters((prev) => ({ ...prev, page }));
    }
  };

  // Book Now handler
  const handleBookNow = async (service: Service) => {
    if (!user) return alert("Please log in first!");
    const date = prompt("Enter booking date (YYYY-MM-DD):");
    const time = prompt("Enter booking time (e.g., 10:00 AM):");
    if (!date || !time) return;

    const bookingData = {
      serviceId: service._id,
      customerId: user._id,
      technicianId: service.createdBy!,
      date,
      time,
    };

    try {
      await bookService(bookingData);
      alert("Booking successful!");
      socket.emit("newBooking", {
        technicianId: service.createdBy,
        message: `New booking received for ${service.name}`,
      });
    } catch (err: any) {
      console.error("Booking failed:", err);
      alert(err.response?.data?.message || "Booking failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-green-600 text-white flex flex-col p-6">
        <h2 className="text-2xl font-bold mb-8 text-center">Customer</h2>
        <nav className="space-y-4">
          <button
            onClick={() => setActiveTab("services")}
            className={`block w-full text-left px-3 py-2 rounded-md ${
              activeTab === "services" ? "bg-green-800" : "hover:bg-green-700"
            }`}
          >
            Available Services
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`block w-full text-left px-3 py-2 rounded-md ${
              activeTab === "bookings" ? "bg-green-800" : "hover:bg-green-700"
            }`}
          >
            My Bookings
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto max-h-screen">
        {activeTab === "services" ? (
          <div>
            {/* Filters */}
            <div className="flex flex-wrap items-end justify-between mb-8">
              {/* Filters section */}
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Min Price
                  </label>
                  <input
                    type="number"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    className="border rounded-lg p-2 w-32"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Max Price
                  </label>
                  <input
                    type="number"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    className="border rounded-lg p-2 w-32"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={filters.location || ""}
                    onChange={handleFilterChange}
                    placeholder="e.g. Delhi"
                    className="border rounded-lg p-2 w-40"
                  />
                </div>
              </div>

              {/* Logout button to the far right */}
              <div className="ml-auto">
                <LogoutButton />
              </div>
            </div>

            {/* Services */}
            {loading ? (
              <p className="text-center text-gray-500">Loading services...</p>
            ) : services.length === 0 ? (
              <p className="text-center text-gray-500">No services found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((s) => (
                  <ServiceCard
                    key={s._id}
                    title={s.name}
                    description={s.description}
                    price={s.price}
                    onButtonClick={() => handleBookNow(s)}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-8">
                <button
                  onClick={() => handlePageChange((filters.page || 1) - 1)}
                  disabled={filters.page === 1}
                  className={`px-4 py-2 rounded-lg border ${
                    filters.page === 1
                      ? "bg-gray-200 text-gray-500"
                      : "bg-green-500 text-white hover:bg-green-600"
                  }`}
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-3 py-1.5 rounded-md ${
                      filters.page === i + 1
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange((filters.page || 1) + 1)}
                  disabled={filters.page === totalPages}
                  className={`px-4 py-2 rounded-lg border ${
                    filters.page === totalPages
                      ? "bg-gray-200 text-gray-500"
                      : "bg-green-500 text-white hover:bg-green-600"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h3 className="text-2xl font-semibold mb-4 text-gray-700">
              My Bookings
            </h3>

            {loadingBookings ? (
              <p className="text-center text-gray-500">Loading bookings...</p>
            ) : bookings.length === 0 ? (
              <p className="text-center text-gray-500">No bookings found.</p>
            ) : (
              <div className="space-y-4">
                {bookings.map((b) => (
                  <div
                    key={b._id}
                    className="border rounded-lg p-4 bg-white shadow hover:shadow-md transition"
                  >
                    <h4 className="font-semibold text-green-700">
                      {b.serviceId?.name || "Service"}
                    </h4>
                    <p className="text-gray-600 text-sm mt-1">
                      Date: {new Date(b.date).toLocaleDateString()} | Time:{" "}
                      {b.time}
                    </p>
                    <p className="text-gray-700 mt-1">
                      Status:{" "}
                      <span
                        className={`${
                          b.status === "completed"
                            ? "text-green-600"
                            : b.status === "confirmed"
                            ? "text-blue-600"
                            : "text-gray-600"
                        } font-medium`}
                      >
                        {b.status}
                      </span>
                    </p>
                    <p className="text-gray-800 mt-2 font-semibold">
                      ₹{b.amount}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
