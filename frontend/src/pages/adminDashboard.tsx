import { useEffect, useState } from "react";
import {
  approvePayout,
  getAdminEarnings,
  getMostBookedCategory,
  getPendingPayouts,
} from "../api/adminService";
import LogoutButton from "../components/logout";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "approvals">(
    "overview"
  );
  const [analytics, setAnalytics] = useState({
    totalAmount: 0,
    adminEarnings: 0,
    technicianEarnings: 0,
    mostBookedCategory: "N/A",
  });
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const earningsRes = await getAdminEarnings();
      const catRes = await getMostBookedCategory();

      setAnalytics({
        totalAmount: earningsRes.totalAmount ?? 0,
        adminEarnings: earningsRes.adminEarnings ?? 0,
        technicianEarnings: earningsRes.technicianEarnings ?? 0,
        mostBookedCategory: catRes?.topCategory?.category ?? "N/A",
      });
    } catch (err: any) {
      setError(err.message || "Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  // Fetch pending payouts
  const fetchPayouts = async () => {
    try {
      const res = await getPendingPayouts();
      setPayouts(res || []);
    } catch (err: any) {
      console.error("Failed to load payouts:", err);
    }
  };

  // Approve payout
  const handleApprove = async (id: string) => {
    try {
      await approvePayout(id);
      alert("Payout approved successfully");
      fetchPayouts();
    } catch (err: any) {
      alert("Failed to approve payout: " + err.message);
    }
  };

  useEffect(() => {
    if (activeTab === "overview") {
      fetchAnalytics();
    } else if (activeTab === "approvals") {
      fetchPayouts();
    }
  }, [activeTab]);

  if (loading && activeTab === "overview") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-600 text-lg">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-700 text-white flex flex-col p-6">
        <h2 className="text-2xl font-bold mb-8 text-center">Admin</h2>

        <nav className="space-y-3">
          <button
            onClick={() => setActiveTab("overview")}
            className={`block w-full text-left px-3 py-2 rounded-md capitalize ${
              activeTab === "overview" ? "bg-blue-900" : "hover:bg-blue-800"
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => setActiveTab("approvals")}
            className={`block w-full text-left px-3 py-2 rounded-md capitalize ${
              activeTab === "approvals" ? "bg-blue-900" : "hover:bg-blue-800"
            }`}
          >
            Pending Approvals
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Overview Section */}
        {activeTab === "overview" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-gray-700">
                Analytics Overview
              </h3>

              <div className="flex items-center gap-3 ml-auto">
                <LogoutButton />
              </div>
            </div>
            {error && <p className="text-red-500 mb-3">{error}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white shadow rounded-lg p-6 text-center">
                <h4 className="text-gray-500 text-sm mb-2">Total Revenue</h4>
                <p className="text-2xl font-bold text-green-600">
                  ₹{analytics.totalAmount.toLocaleString()}
                </p>
              </div>

              <div className="bg-white shadow rounded-lg p-6 text-center">
                <h4 className="text-gray-500 text-sm mb-2">
                  Admin Earnings (20%)
                </h4>
                <p className="text-2xl font-bold text-blue-600">
                  ₹{analytics.adminEarnings.toLocaleString()}
                </p>
              </div>

              <div className="bg-white shadow rounded-lg p-6 text-center">
                <h4 className="text-gray-500 text-sm mb-2">
                  Technician Earnings (80%)
                </h4>
                <p className="text-2xl font-bold text-indigo-600">
                  ₹{analytics.technicianEarnings.toLocaleString()}
                </p>
              </div>

              <div className="bg-white shadow rounded-lg p-6 text-center">
                <h4 className="text-gray-500 text-sm mb-2">
                  Most Booked Category
                </h4>
                <p className="text-xl font-semibold text-purple-600">
                  {analytics.mostBookedCategory}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pending Approvals Section */}
        {activeTab === "approvals" && (
          <div>
            <h3 className="text-2xl font-semibold mb-6 text-gray-700">
              Pending Payout Approvals
            </h3>

            {payouts.length === 0 ? (
              <p className="text-gray-600">No pending requests.</p>
            ) : (
              <table className="w-full bg-white shadow rounded-lg">
                <thead className="bg-gray-200 text-gray-700">
                  <tr>
                    <th className="p-3 text-left">Amount</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p) => (
                    <tr key={p._id} className="border-t">
                      <td className="p-3">₹{p.amount}</td>
                      <td className="p-3 capitalize">{p.status}</td>
                      <td className="p-3">
                        {p.status === "pending" && (
                          <button
                            onClick={() => handleApprove(p._id)}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
