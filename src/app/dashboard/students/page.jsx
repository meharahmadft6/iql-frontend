"use client";
import React, { useState, useEffect } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import {
  Users,
  Search,
  Filter,
  ChevronRight,
  UserCheck,
  UserX,
  BookOpen,
  TrendingUp,
  BarChart3,
  Calendar,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { getAllStudents } from "../../../api/student.api";

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    isVerified: null,
    postCount: "",
  });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await getAllStudents();
        if (response.data.success) {
          setStudents(response.data.data.students.data);
          setStatistics(response.data.data.statistics);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesVerification =
      filters.isVerified === null || student.isVerified === filters.isVerified;

    const matchesPostCount = () => {
      if (!filters.postCount) return true;
      const postCount = student.postCount || 0;
      switch (filters.postCount) {
        case "0":
          return postCount === 0;
        case "1-5":
          return postCount >= 1 && postCount <= 5;
        case "6-15":
          return postCount >= 6 && postCount <= 15;
        case "15+":
          return postCount > 15;
        default:
          return true;
      }
    };

    return matchesSearch && matchesVerification && matchesPostCount();
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getActivityLevel = (postCount) => {
    if (postCount === 0) return { label: "Inactive", color: "text-gray-500" };
    if (postCount <= 5) return { label: "Low", color: "text-yellow-600" };
    if (postCount <= 15) return { label: "Medium", color: "text-blue-600" };
    return { label: "High", color: "text-green-600" };
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              Students Management
            </h1>
            <p className="text-gray-600">
              {filteredStudents.length} students found
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Students
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistics.totalStudents}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Verified Students
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {statistics.verifiedStudents}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-1">
                <span className="text-sm text-gray-500">
                  {(
                    (statistics.verifiedStudents / statistics.totalStudents) *
                    100
                  ).toFixed(1)}
                  % of total
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Unverified Students
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {statistics.unverifiedStudents}
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <UserX className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-1">
                <span className="text-sm text-gray-500">
                  {(
                    (statistics.unverifiedStudents / statistics.totalStudents) *
                    100
                  ).toFixed(1)}
                  % of total
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Posts
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {statistics.totalPosts}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-1">
                <span className="text-sm text-gray-500">
                  Avg:{" "}
                  {(statistics.totalPosts / statistics.totalStudents).toFixed(
                    1
                  )}{" "}
                  per student
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Most Active Students */}
        {statistics && statistics.mostActiveStudents && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-800">
                Most Active Students
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {statistics.mostActiveStudents
                .slice(0, 6)
                .map((student, index) => (
                  <div
                    key={student.userId}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 h-8 w-8 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          {student.name}
                        </p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">
                        {student.postCount}
                      </p>
                      <p className="text-xs text-gray-500">posts</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search students by name or email"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col md:flex-row items-center gap-2">
              <select
                className="w-full md:w-auto border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={filters.isVerified}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    isVerified:
                      e.target.value === "null"
                        ? null
                        : e.target.value === "true",
                  })
                }
              >
                <option value="null">All Verification Status</option>
                <option value="true">Verified</option>
                <option value="false">Not Verified</option>
              </select>
              <select
                className="w-full md:w-auto border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={filters.postCount}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    postCount: e.target.value,
                  })
                }
              >
                <option value="">All Activity Levels</option>
                <option value="0">No Posts (0)</option>
                <option value="1-5">Low Activity (1-5 posts)</option>
                <option value="6-15">Medium Activity (6-15 posts)</option>
                <option value="15+">High Activity (15+ posts)</option>
              </select>
              <button className="w-full md:w-auto flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50">
                <Filter size={16} />
                <span>More Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Students Table/List */}
        {isMobile ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {filteredStudents.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Users size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No students found matching your criteria</p>
              </div>
            ) : (
              filteredStudents.map((student) => {
                const activity = getActivityLevel(student.postCount || 0);
                return (
                  <div
                    key={student._id}
                    className="p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 h-10 w-10 rounded-full flex items-center justify-center text-blue-600 font-medium">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <Link
                            href={`/dashboard/students/${student._id}`}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {student.name}
                          </Link>
                          <p className="text-sm text-gray-500">
                            {student.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            student.isVerified
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {student.isVerified ? "Verified" : "Unverified"}
                        </span>
                        <Link
                          href={`/dashboard/students/${student._id}`}
                          className="p-1 text-gray-500 hover:text-blue-600"
                          title="View Details"
                        >
                          <ChevronRight size={16} />
                        </Link>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="font-medium">Posts</p>
                        <p className="text-gray-600">
                          {student.postCount || 0}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Activity</p>
                        <p className={activity.color}>{activity.label}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="font-medium">Joined</p>
                        <p className="text-gray-600">
                          {formatDate(student.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-12 bg-gray-50 p-4 border-b border-gray-200 font-medium text-gray-700">
              <div className="col-span-4">Student</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Posts</div>
              <div className="col-span-2">Activity Level</div>
              <div className="col-span-1">Joined</div>
              <div className="col-span-1">Actions</div>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Users size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No students found matching your criteria</p>
              </div>
            ) : (
              filteredStudents.map((student) => {
                const activity = getActivityLevel(student.postCount || 0);
                return (
                  <div
                    key={student._id}
                    className="grid grid-cols-12 items-center p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="bg-blue-100 h-10 w-10 rounded-full flex items-center justify-center text-blue-600 font-medium">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-blue-600 hover:underline">
                          {student.name}
                        </div>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          student.isVerified
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {student.isVerified ? (
                          <>
                            <UserCheck size={12} className="mr-1" />
                            Verified
                          </>
                        ) : (
                          <>
                            <UserX size={12} className="mr-1" />
                            Unverified
                          </>
                        )}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <BookOpen size={14} className="text-gray-400" />
                        <span className="font-medium">
                          {student.postCount || 0}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className={`font-medium ${activity.color}`}>
                        {activity.label}
                      </span>
                    </div>
                    <div className="col-span-1">
                      <span className="text-sm text-gray-600">
                        {formatDate(student.createdAt)}
                      </span>
                    </div>
                    <div className="col-span-1 flex items-center justify-end">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentsPage;
