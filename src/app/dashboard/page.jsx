"use client";
import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  Home,
  Users,
  BookOpen,
  GraduationCap,
  BarChart3,
  Settings,
  Bell,
  Search,
  TrendingUp,
  UserCheck,
  Award,
  DollarSign,
  LogOut,
} from "lucide-react";
import { getCurrentUser } from "../../api/user.api";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setAuthorized(false);
          setLoading(false);
          return;
        }

        const response = await getCurrentUser();
        const userData = response?.data?.data;

        if (userData?.role === "admin") {
          setUser(userData);
          setAuthorized(true);
        } else {
          console.log("User is not admin");
        }
      } catch (error) {
        console.error(
          "Auth check failed:",
          error.response?.data || error.message
        );
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-6">
              You don't have admin privileges to access this dashboard.
            </p>
            <Link href={"/login"}>
              <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Go to Login
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { icon: Home, label: "Dashboard", active: true },
    { icon: Users, label: "Teachers", count: 45 },
    { icon: GraduationCap, label: "Students", count: 1240 },
    { icon: BookOpen, label: "Courses", count: 28 },
    { icon: BarChart3, label: "Analytics" },
    { icon: Bell, label: "Notifications", count: 3 },
    { icon: Settings, label: "Settings" },
  ];

  const stats = [
    {
      title: "Total Students",
      value: "1,240",
      change: "+12%",
      changeType: "positive",
      icon: GraduationCap,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Active Teachers",
      value: "45",
      change: "+8%",
      changeType: "positive",
      icon: UserCheck,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Total Courses",
      value: "28",
      change: "+3%",
      changeType: "positive",
      icon: BookOpen,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Revenue",
      value: "$24,580",
      change: "+15%",
      changeType: "positive",
      icon: DollarSign,
      color: "bg-yellow-100 text-yellow-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:flex lg:flex-col`}
      >
        {/* Enhanced Logo Section */}
        <div className="flex flex-col items-center justify-center px-4 border-b border-gray-200">
          <div className="relative w-40 h-40 mb-4">
            {" "}
            {/* Increased size */}
            <Image
              src="/infinity.jpg"
              alt="Infinity Quotient Logo"
              fill
              className="rounded-xl object-contain"
              priority
            />
          </div>
        </div>

        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        >
          <X size={20} />
        </button>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {sidebarItems.map((item, index) => (
            <div
              key={index}
              className={`mb-2 group ${
                item.active ? "bg-blue-50" : ""
              } rounded-lg transition-all duration-200 hover:bg-gray-50`}
            >
              <a
                href="#"
                className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  item.active
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center">
                  <item.icon
                    size={20}
                    className={`mr-3 ${
                      item.active ? "text-blue-600" : "text-gray-400"
                    }`}
                  />
                  {item.label}
                </div>
                {item.count && (
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      item.active
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </a>
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header with Logout */}
        <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 mr-2"
              >
                <Menu size={20} />
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">
                Dashboard
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative hidden sm:block">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button className="relative p-2 text-gray-400 hover:text-gray-600">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </button>

              {/* User Dropdown with Logout */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {user?.name?.charAt(0) || "A"}
                    </span>
                  </div>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <div className="font-medium truncate">{user?.name}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut size={16} className="mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto bg-gray-50">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Welcome back, {user?.name}!
            </h2>
            <p className="text-gray-600">
              Here's what's happening with your platform today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-800 mb-3">
                      {stat.value}
                    </p>
                    <div className="flex items-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          stat.changeType === "positive"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        <TrendingUp
                          size={12}
                          className="mr-1"
                          strokeWidth={3}
                        />
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`p-3 rounded-full ${stat.color} flex-shrink-0`}
                  >
                    <stat.icon size={20} className="opacity-80" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Dashboard Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Recent Activities */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Recent Activities
              </h3>
              {/* Placeholder for activities */}
              <div className="text-center py-10 text-gray-400">
                Activity feed will appear here
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                  <span>Add New Course</span>
                  <BookOpen size={18} />
                </button>
                <button className="w-full flex items-center justify-between p-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                  <span>Invite Teacher</span>
                  <UserCheck size={18} />
                </button>
                <button className="w-full flex items-center justify-between p-3 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors">
                  <span>Generate Report</span>
                  <BarChart3 size={18} />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default AdminDashboard;
