import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import type { LoginRequest } from "../api/models/userModel";
import { loginUser } from "../api/userService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { socket } from "../socket";

export default function Login() {
  const [formData, setFormData] = useState<LoginRequest>({
    email: "",
    password: "",
  });
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // // If user is already logged in, redirect immediately
  // useEffect(() => {
  //   if (user) {
  //     if (user.role === "customer")
  //       navigate("/customer/dashboard", { replace: true });
  //     else if (user.role === "technician")
  //       navigate("/technician/dashboard", { replace: true });
  //     else if (user.role === "admin")
  //       navigate("/admin/dashboard", { replace: true });
  //   }
  // }, [user, navigate]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await loginUser(formData);
      console.log("✅ Login success:", response);

      const normalizedUser = {
        _id: response.user.id,
        email: response.user.email,
        role: response.user.role as "admin" | "customer" | "technician",
        name: response.user.name || "User",
      };

      login(normalizedUser, response.token);
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(normalizedUser));

      //Register socket after login
      socket.emit("register", normalizedUser._id);

      if (normalizedUser.role === "customer")
        navigate("/customer/dashboard", { replace: true });
      else if (normalizedUser.role === "technician")
        navigate("/technician/dashboard", { replace: true });
      else if (normalizedUser.role === "admin")
        navigate("/admin/dashboard", { replace: true });
      else navigate("/login", { replace: true });
    } catch (err: any) {
      console.error("Login failed:", err);
      alert(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  // Ensure socket re-registers on page refresh
  useEffect(() => {
    if (user?._id) {
      socket.emit("register", user._id);
    }
  }, [user]);

  return (
    <div className="flex items-center justify-center h-screen w-full">
      <div className="bg-gray-200 p-8 rounded-2xl shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-gray-700 text-left">Email</label>
            <input
              type="email"
              name="email"
              onChange={handleChange}
              value={formData.email}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700 text-left">
              Password
            </label>
            <input
              type="password"
              name="password"
              onChange={handleChange}
              value={formData.password}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white py-2 rounded-lg transition cursor-pointer ${
              loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
