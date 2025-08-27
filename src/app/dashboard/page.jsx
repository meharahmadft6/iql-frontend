"use client";
import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  BookOpen,
  UserCheck,
  Award,
  DollarSign,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { getCurrentUser } from "../../api/user.api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "../layout/DashboardLayout";

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
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
    localStorage.removeItem("userData"); 
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
            <Link href="/login">
              <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Go to Login
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

  const DashboardContent = () => (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-full">
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
                    <TrendingUp size={12} className="mr-1" strokeWidth={3} />
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-full ${stat.color} flex-shrink-0`}>
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

      {/* Additional Content Sections */}
      <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Performance Chart Placeholder */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Performance Overview
          </h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Chart will be displayed here
          </div>
        </div>

        {/* Top Courses */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Top Performing Courses
          </h3>
          <div className="space-y-4">
            {[
              {
                name: "Advanced React Development",
                students: 156,
                rating: 4.8,
              },
              { name: "Python for Data Science", students: 203, rating: 4.9 },
              { name: "Digital Marketing Basics", students: 89, rating: 4.7 },
              { name: "UI/UX Design Fundamentals", students: 134, rating: 4.6 },
            ].map((course, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-800 text-sm">
                    {course.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    {course.students} students
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-500">⭐</span>
                  <span className="text-sm font-medium text-gray-700">
                    {course.rating}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      <DashboardContent />
    </DashboardLayout>
  );
};

export default AdminDashboard;
