"use client";
import { useEffect, useState } from "react";
import { API } from "../../../api/api";
import DashboardLayout from "../../layout/teacher/DashboardLayout";
import {
  CurrencyDollarIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShoppingCartIcon,
  ArrowLeftIcon,
  FireIcon,
  TrophyIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { ToastContainer, useToast } from "../../../components/Toast";

const TeacherWalletPage = () => {
  const [walletData, setWalletData] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSpent: 0,
    totalCoinsPurchased: 0,
    successfulPayments: 0,
  });

  const { toasts, removeToast, error } = useToast();

  useEffect(() => {
    fetchWalletData();
    fetchPaymentHistory();
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

  const fetchPaymentHistory = async () => {
    try {
      const response = await API.get("/payments/history");
      const payments = response.data.data || [];
      setPaymentHistory(payments);

      // Calculate stats
      const statsData = {
        totalSpent: 0,
        totalCoinsPurchased: 0,
        successfulPayments: 0,
      };

      payments.forEach((payment) => {
        if (payment.status === "completed") {
          statsData.totalSpent += payment.amount;
          statsData.totalCoinsPurchased += payment.coins;
          statsData.successfulPayments++;
        }
      });

      setStats(statsData);
    } catch (error) {
      console.error("Error fetching payment history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case "pending":
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case "failed":
      case "cancelled":
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-50 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "failed":
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(dateString);
  };

  if (loading) {
    return (
      <DashboardLayout title="My Wallet">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Wallet">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="space-y-6">
        {/* Header with Balance and Quick Stats */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg text-white p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-semibold">Wallet Balance</h1>
              <p className="text-blue-100 mt-1">
                Your teaching currency for platform features
              </p>
              <div className="flex items-baseline space-x-2 mt-4">
                <CurrencyDollarIcon className="h-8 w-8 text-white" />
                <span className="text-3xl font-bold">
                  {walletData?.balance?.toLocaleString() || 0}
                </span>
                <span className="text-lg text-blue-100">coins</span>
              </div>
            </div>
            <Link
              href="/teachers/wallet/buy-coins"
              className="flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium shadow-sm"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Buy Coins
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrophyIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-xl font-bold text-gray-900">
                  ${stats.totalSpent.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <SparklesIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Coins</p>
                <p className="text-xl font-bold text-gray-900">
                  {stats.totalCoinsPurchased.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FireIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Transactions
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {stats.successfulPayments}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Transaction History
            </h2>
            <span className="text-sm text-gray-500">
              {paymentHistory.filter((p) => p.status === "completed").length}{" "}
              completed
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date & Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Coins
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paymentHistory.map((payment, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">
                        {formatDate(payment.createdAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {getTimeAgo(payment.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">
                        ${payment.amount}
                      </div>
                      <div className="text-xs text-gray-500">
                        {payment.currency}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <span className="text-sm font-semibold text-green-600">
                          +{payment.coins.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                          payment.status
                        )}`}
                      >
                        {getStatusIcon(payment.status)}
                        <span className="ml-1 capitalize">
                          {payment.status}
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
                {paymentHistory.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <ShoppingCartIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg font-medium">
                        No transactions yet
                      </p>
                      <p className="text-gray-400 text-sm mt-2">
                        Your purchase history will appear here
                      </p>
                      <Link
                        href="/teachers/wallet/buy-coins"
                        className="mt-4 inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Buy Your First Coins
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherWalletPage;
