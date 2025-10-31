import { useEffect, useState } from "react";
import ServiceCard from "../components/ServiceCard";
import { useAuth } from "../context/AuthContext";
import {
  getServicesByTechnician,
  getBookingsByTechnician,
  addService,
  updateService,
  completeBooking,
  requestPayout,
} from "../api/serviceService";
import { getProfile } from "../api/userService";
import type { Service } from "../api/models/serviceModel";
import type { Booking } from "../api/models/bookingModel";
import LogoutButton from "../components/logout";

export default function TechnicianDashboard() {
  const [activeTab, setActiveTab] = useState<"services" | "bookings">(
    "services"
  );
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    location: "",
    category: "",
  });
  const [technicianInfo, setTechnicianInfo] = useState<any>(null);
  const [payoutAmount, setPayoutAmount] = useState<string>("");

  const { user } = useAuth();

  // Fetch technician profile
  const fetchProfile = async () => {
    if (!user?._id) return;
    try {
      const data = await getProfile(user._id);
      setTechnicianInfo(data.user);
    } catch (err) {
      console.error("Error fetching technician profile:", err);
    }
  };

  //  Fetch technician's services
  const fetchServices = async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      const data = await getServicesByTechnician(user._id);
      setServices(data);
    } catch (err) {
      console.error("Error fetching technician services:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch technician's bookings
  const fetchBookings = async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      const data = await getBookingsByTechnician(user._id);
      setBookings(data);
    } catch (err) {
      console.error("Error fetching technician bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (activeTab === "services") fetchServices();
    else fetchBookings();
  }, [activeTab, user]);

  // Payout request handler
  const handleRequestPayout = async () => {
    if (!user?._id) return alert("User not found.");
    if (!payoutAmount || Number(payoutAmount) <= 0)
      return alert("Enter a valid payout amount.");

    try {
      const res = await requestPayout({
        technicianId: user._id,
        amount: Number(payoutAmount),
      });
      alert(res.message || "Payout requested successfully!");
      setPayoutAmount("");
      fetchProfile(); // refresh wallet info
    } catch (err: any) {
      console.error("Error requesting payout:", err);
      alert(err.response?.data?.message || "Failed to request payout.");
    }
  };

  const openModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setForm({
        name: service.name,
        description: service.description,
        price: String(service.price),
        location: service.location || "",
        category: service.category || "",
      });
    } else {
      setEditingService(null);
      setForm({
        name: "",
        description: "",
        price: "",
        location: "",
        category: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingService(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveService = async () => {
    if (!form.name || !form.price || !form.description) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      if (editingService) {
        await updateService(editingService._id!, {
          ...editingService,
          name: form.name,
          description: form.description,
          price: Number(form.price),
          location: form.location,
          category: form.category,
        });
        alert("Service updated successfully!");
      } else {
        await addService({
          name: form.name,
          description: form.description,
          price: Number(form.price),
          location: form.location,
          category: form.category,
        } as Service);
        alert("New service added successfully!");
      }
      closeModal();
      fetchServices();
    } catch (err) {
      console.error(err);
      alert("Failed to save service");
    }
  };

  const handleCompleteBooking = async (bookingId: string) => {
    try {
      await completeBooking(bookingId);
      alert("Booking marked as completed!");
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert("Failed to complete booking");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-600 text-white flex flex-col p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Technician</h2>
        {/* Technician Info + Wallet + Payout */}
        {technicianInfo && (
          <div className="bg-blue-800 p-4 rounded-lg text-center mb-6">
            <p className="text-lg font-semibold">{technicianInfo.name}</p>
            <p className="text-sm text-gray-200">{technicianInfo.email}</p>

            <div className="mt-3 border-t border-blue-700 pt-3">
              <p className="text-sm text-gray-200">Wallet Balance</p>
              <p className="text-2xl font-bold">
                ₹{technicianInfo.walletBalance || 0}
              </p>
            </div>

            {/*Payout request section */}
            <div className="mt-4">
              <input
                type="number"
                placeholder="Enter amount"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                className="w-full p-2 rounded text-black mb-2"
              />
              <button
                onClick={handleRequestPayout}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded"
              >
                Request Payout
              </button>
            </div>
          </div>
        )}

        <nav className="space-y-4">
          <button
            onClick={() => setActiveTab("services")}
            className={`block w-full text-left px-3 py-2 rounded-md ${
              activeTab === "services" ? "bg-blue-800" : "hover:bg-blue-700"
            }`}
          >
            My Services
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`block w-full text-left px-3 py-2 rounded-md ${
              activeTab === "bookings" ? "bg-blue-800" : "hover:bg-blue-700"
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold text-gray-700">
                My Services
              </h3>

              <div className="flex items-center gap-3 ml-auto">
                <button
                  onClick={() => openModal()}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  + Add Service
                </button>

                <LogoutButton />
              </div>
            </div>

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
                    onButtonClick={() => openModal(s)}
                    buttonLabel="Edit"
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h3 className="text-2xl font-semibold mb-4 text-gray-700">
              My Bookings
            </h3>
            {loading ? (
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
                    <h4 className="font-semibold text-blue-700">
                      {b.serviceName || "Unnamed Service"}
                    </h4>
                    <p className="text-gray-600 text-sm mt-1">
                      Customer: {b.customerName || "N/A"}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      Date: {new Date(b.date).toLocaleDateString()} | Amount: ₹
                      {b.amount}
                    </p>
                    <p className="text-gray-700 mt-1 capitalize">
                      Status: {b.status}
                    </p>

                    {b.status !== "completed" && (
                      <button
                        onClick={() => handleCompleteBooking(b._id)}
                        className="mt-3 bg-green-500 text-white px-4 py-1.5 rounded hover:bg-green-600"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-center text-gray-800">
              {editingService ? "Edit Service" : "Add New Service"}
            </h3>
            <textarea
              name="category"
              placeholder="Category"
              value={form.category}
              onChange={handleChange}
              className="w-full mb-3 p-2 border rounded"
            />
            <input
              type="text"
              name="name"
              placeholder="Service Name"
              value={form.name}
              onChange={handleChange}
              className="w-full mb-3 p-2 border rounded"
            />
            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              className="w-full mb-3 p-2 border rounded"
            />
            <input
              type="number"
              name="price"
              placeholder="Price"
              value={form.price}
              onChange={handleChange}
              className="w-full mb-3 p-2 border rounded"
            />
            <input
              type="text"
              name="location"
              placeholder="Location (optional)"
              value={form.location}
              onChange={handleChange}
              className="w-full mb-4 p-2 border rounded"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveService}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {editingService ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
