import { useState } from "react";

interface Service {
  _id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [formData, setFormData] = useState<Service>({
    name: "",
    description: "",
    price: 0,
    category: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      if (editingId) {
        setServices((prev) =>
          prev.map((s) =>
            s._id === editingId ? { ...formData, _id: editingId } : s
          )
        );
        alert("Service updated!");
      } else {
        const newService = { ...formData, _id: Date.now().toString() };
        setServices((prev) => [...prev, newService]);
        alert("Service added!");
      }
      setFormData({ name: "", description: "", price: 0, category: "" });
      setEditingId(null);
      setLoading(false);
    }, 800);
  };

  const handleEdit = (service: Service) => {
    setEditingId(service._id!);
    setFormData(service);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">
          {editingId ? "Edit Service" : "Add New Service"}
        </h2>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10"
        >
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Service Name"
            className="border rounded-lg p-3 w-full"
            required
          />
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Category"
            className="border rounded-lg p-3 w-full"
            required
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            className="border rounded-lg p-3 md:col-span-2"
            required
          />
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Price"
            className="border rounded-lg p-3 w-full"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`md:col-span-2 text-white py-2 rounded-lg transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading
              ? "Saving..."
              : editingId
              ? "Update Service"
              : "Add Service"}
          </button>
        </form>

        {/* Services list */}
        <h3 className="text-2xl font-semibold mb-4 text-gray-700">
          Available Services
        </h3>
        {services.length === 0 ? (
          <p className="text-gray-500 text-center">No services found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {services.map((s) => (
              <div
                key={s._id}
                className="p-5 border rounded-xl shadow hover:shadow-lg transition bg-gray-50 flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-lg font-semibold text-blue-700">
                    {s.name}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">{s.description}</p>
                  <p className="text-sm mt-2 text-gray-500">
                    ₹{s.price} | {s.category}
                  </p>
                </div>
                <button
                  onClick={() => handleEdit(s)}
                  className="mt-4 bg-yellow-500 text-white py-1.5 rounded-lg hover:bg-yellow-600"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
