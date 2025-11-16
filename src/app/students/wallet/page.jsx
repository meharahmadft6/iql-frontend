"use client";
import { useEffect, useState } from "react";
import { API } from "../../../api/api";
import StudentDashboardLayout from "../../layout/student/DashboardLayout";
import {
  CurrencyDollarIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShoppingCartIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  FireIcon,
  AcademicCapIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import BuyCoins from "../../../components/BuyCoins";
import { ToastContainer, useToast } from "../../../components/Toast";

const StudentWalletPage = () => {
  const [walletData, setWalletData] = useState(null);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [coinPackages, setCoinPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyCoinsModalOpen, setBuyCoinsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // "all", "purchases", "usage"

  const { toasts, removeToast, success, error, info } = useToast();

  useEffect(() => {
    fetchWalletData();
    fetchTransactionHistory();
    fetchCoinPackages();
  }, []);

  const fetchWalletData = async () => {
    try {
      const response = await API.get("/wallet");
      setWalletData(response.data.data);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      error("Failed to load wallet data");
    }
  };

  const fetchTransactionHistory = async () => {
    try {
      const response = await API.get("/wallet/transactions");
      setTransactionHistory(response.data.data || []);
    } catch (error) {
      console.error("Error fetching transaction history:", error);
    }
  };

  const fetchCoinPackages = async () => {
    try {
      const response = await API.get("/payments/packages");
      setCoinPackages(response.data.data || []);
    } catch (error) {
      console.error("Error fetching coin packages:", error);
      error("Failed to load coin packages");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentData) => {
    success(
      `${paymentData.coinsAdded.toLocaleString()} coins added to your wallet!`
    );
    fetchWalletData();
    fetchTransactionHistory();
  };

  const handleBuyCoinsClick = () => {
    if (coinPackages.length === 0) {
      error("Coin packages not loaded yet. Please try again.");
      return;
    }
    setBuyCoinsModalOpen(true);
    info("Select a package or enter custom amount");
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
      case "credited":
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case "pending":
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case "failed":
      case "cancelled":
      case "debited":
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
      case "credited":
        return "bg-green-50 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "failed":
      case "cancelled":
      case "debited":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case "purchase":
        return <ArrowDownTrayIcon className="h-5 w-5 text-blue-600" />;
      case "course_access":
      case "debit": // Map 'debit' to course_access icon
        return <AcademicCapIcon className="h-5 w-5 text-purple-600" />;
      case "premium_content":
        return <BookOpenIcon className="h-5 w-5 text-indigo-600" />;
      case "ai_tutor":
        return <FireIcon className="h-5 w-5 text-orange-600" />;
      default:
        return <CurrencyDollarIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTransactionType = (type) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const filteredTransactions = transactionHistory.filter((transaction) => {
    if (activeTab === "all") return true;
    if (activeTab === "purchases") return transaction.type === "purchase";
    if (activeTab === "usage") return transaction.type !== "purchase";
    return true;
  });

  if (loading) {
    return (
      <StudentDashboardLayout title="My Wallet">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </StudentDashboardLayout>
    );
  }

  return (
    <StudentDashboardLayout title="My Wallet">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Buy Coins Modal */}
      <BuyCoins
        isOpen={buyCoinsModalOpen}
        onClose={() => setBuyCoinsModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        coinPackages={coinPackages}
      />

      <div className="space-y-6">
        {/* Wallet Balance Card with Stats */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Wallet Balance</h1>
              <p className="text-blue-100 mt-1">
                Manage your learning coins and track usage
              </p>
              <div className="flex items-baseline space-x-2 mt-4">
                <CurrencyDollarIcon className="h-8 w-8 text-yellow-300" />
                <span className="text-4xl font-bold">
                  {walletData?.balance?.toLocaleString() || 0}
                </span>
                <span className="text-lg text-blue-100">coins</span>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-blue-100 text-sm">Total Spent</p>
                  <p className="text-lg font-semibold">
                    {walletData?.totalSpent?.toLocaleString() || 0} coins
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-blue-100 text-sm">Active Sessions</p>
                  <p className="text-lg font-semibold">
                    {walletData?.activeSessions || 0}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleBuyCoinsClick}
              className="flex items-center px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Buy Coins
            </button>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Transaction History
              </h2>

              {/* Filter Tabs */}
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                {[
                  { id: "all", label: "All" },
                  { id: "purchases", label: "Purchases" },
                  { id: "usage", label: "Usage" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.map((transaction, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        {getTransactionIcon(transaction.type)}
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {formatTransactionType(transaction.type)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                      {transaction.description || "Transaction"}
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className={`text-sm font-semibold ${
                          transaction.amount > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.amount > 0 ? "+" : ""}
                        {transaction.amount.toLocaleString()} coins
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                          transaction.status
                        )}`}
                      >
                        {getStatusIcon(transaction.status)}
                        <span className="ml-1 capitalize">
                          {transaction.status}
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <ShoppingCartIcon className="h-16 w-16 text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg font-medium">
                          No transactions found
                        </p>
                        <p className="text-gray-400 text-sm mt-2 max-w-md">
                          {activeTab === "purchases"
                            ? "Your coin purchase history will appear here"
                            : activeTab === "usage"
                            ? "Your coin usage history will appear here"
                            : "Your transaction history will appear here"}
                        </p>
                        {activeTab === "all" || activeTab === "purchases" ? (
                          <button
                            onClick={handleBuyCoinsClick}
                            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Buy Your First Coins
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={handleBuyCoinsClick}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
            >
              <PlusIcon className="h-8 w-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-gray-900">Buy Coins</span>
              <span className="text-sm text-gray-500 text-center mt-1">
                Add more coins to your wallet
              </span>
            </button>

            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors group">
              <AcademicCapIcon className="h-8 w-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-gray-900">Browse Courses</span>
              <span className="text-sm text-gray-500 text-center mt-1">
                Explore premium courses
              </span>
            </button>

            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors group">
              <BookOpenIcon className="h-8 w-8 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-gray-900">Resources</span>
              <span className="text-sm text-gray-500 text-center mt-1">
                Access study materials
              </span>
            </button>
          </div>
        </div>
      </div>
    </StudentDashboardLayout>
  );
};

export default StudentWalletPage;
