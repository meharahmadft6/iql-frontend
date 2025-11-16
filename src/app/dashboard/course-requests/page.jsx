"use client";
import React, { useState, useEffect } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  User,
  Mail,
  Calendar,
  TrendingUp,
  BarChart3,
  Download,
  RefreshCw,
  Eye,
  MessageSquare,
} from "lucide-react";

import {
  getPendingAccessRequests,
  reviewAccessRequest,
  getAccessRequestStats,
} from "../../../api/courseAccess.api";
import Swal from "sweetalert2";

const CourseRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "pending",
    course: "",
    subject: "",
  });
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchRequests();
    fetchStatistics();
  }, [pagination.page, filters.status]);

  const fetchRequests = async () => {
    try {
      const response = await getPendingAccessRequests(
        pagination.page,
        pagination.limit
      );
      if (response.data.success) {
        setRequests(response.data.data);
        setPagination((prev) => ({
          ...prev,
          total: response.data.total,
          pages: response.data.pages,
          currentPage: response.data.currentPage,
        }));
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load access requests",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await getAccessRequestStats();
      if (response.data.success) {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  const handleReviewRequest = async (requestId, status) => {
    setActionLoading(requestId);

    try {
      const { value: reviewNotes } = await Swal.fire({
        title: `${status === "approved" ? "Approve" : "Reject"} Request`,
        input: "textarea",
        inputLabel: "Review Notes (Optional)",
        inputPlaceholder: "Add any notes for the student...",
        inputAttributes: {
          "aria-label": "Type your review notes here",
        },
        showCancelButton: true,
        confirmButtonText: `${
          status === "approved" ? "Approve" : "Reject"
        } Request`,
        confirmButtonColor: status === "approved" ? "#10b981" : "#ef4444",
        cancelButtonText: "Cancel",
        inputValidator: (value) => {
          if (status === "rejected" && (!value || value.trim().length < 5)) {
            return "Please provide a reason for rejection (minimum 5 characters)";
          }
        },
      });

      if (reviewNotes !== undefined) {
        const response = await reviewAccessRequest(
          requestId,
          status,
          reviewNotes
        );

        if (response.data.success) {
          Swal.fire({
            icon: "success",
            title: `Request ${
              status === "approved" ? "Approved" : "Rejected"
            }!`,
            text: `The access request has been ${status} successfully.`,
            confirmButtonColor: "#10b981",
          });

          // Refresh data
          fetchRequests();
          fetchStatistics();
        }
      }
    } catch (error) {
      console.error("Error reviewing request:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to process request",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const toggleExpandRequest = (requestId) => {
    setExpandedRequest(expandedRequest === requestId ? null : requestId);
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
        label: "Pending",
      },
      approved: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        label: "Approved",
      },
      rejected: {
        color: "bg-red-100 text-red-800",
        icon: XCircle,
        label: "Rejected",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        <IconComponent size={12} className="mr-1" />
        {config.label}
      </span>
    );
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.student?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      request.course?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filters.status === "all" || request.status === filters.status;

    return matchesSearch && matchesStatus;
  });

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
              Course Access Requests
            </h1>
            <p className="text-gray-600">
              Manage student requests for course access
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchRequests}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Requests
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistics.totalRequests}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Pending Requests
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {statistics.pendingRequests}
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-1">
                <span className="text-sm text-gray-500">
                  {(
                    (statistics.pendingRequests / statistics.totalRequests) *
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
                    Approved Requests
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {statistics.approvedRequests}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-1">
                <span className="text-sm text-gray-500">
                  {(
                    (statistics.approvedRequests / statistics.totalRequests) *
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
                    Rejected Requests
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {statistics.rejectedRequests}
                  </p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="mt-1">
                <span className="text-sm text-gray-500">
                  {(
                    (statistics.rejectedRequests / statistics.totalRequests) *
                    100
                  ).toFixed(1)}
                  % of total
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by student name, email, course, or subject"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <button className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50">
                <Filter size={16} />
                <span>More Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-12 bg-gray-50 p-4 border-b border-gray-200 font-medium text-gray-700">
            <div className="col-span-3">Student & Course</div>
            <div className="col-span-2">Exam Board</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Requested</div>
            <div className="col-span-3 text-center">Actions</div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No access requests found</p>
              <p className="text-sm">
                All requests are processed or no requests match your criteria
              </p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div
                key={request._id}
                className="border-b border-gray-200 last:border-b-0"
              >
                {/* Main Row */}
                <div className="grid grid-cols-12 items-center p-4 hover:bg-gray-50 transition-colors">
                  <div className="col-span-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 h-10 w-10 rounded-full flex items-center justify-center text-blue-600 font-medium">
                        {request.student?.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {request.student?.name || "Unknown Student"}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <BookOpen size={12} />
                          {request.course?.name} - {request.subject?.name}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {request.examBoard}
                    </span>
                  </div>
                  <div className="col-span-2">
                    {getStatusBadge(request.status)}
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm text-gray-600">
                      {formatDate(request.requestedAt)}
                    </div>
                  </div>
                  <div className="col-span-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => toggleExpandRequest(request._id)}
                        className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <Eye size={14} />
                        Details
                        {expandedRequest === request._id ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </button>

                      {request.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleReviewRequest(request._id, "approved")
                            }
                            disabled={actionLoading === request._id}
                            className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                          >
                            <CheckCircle size={14} />
                            {actionLoading === request._id
                              ? "Processing..."
                              : "Approve"}
                          </button>
                          <button
                            onClick={() =>
                              handleReviewRequest(request._id, "rejected")
                            }
                            disabled={actionLoading === request._id}
                            className="flex items-center gap-1 px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                          >
                            <XCircle size={14} />
                            {actionLoading === request._id
                              ? "Processing..."
                              : "Reject"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedRequest === request._id && (
                  <div className="bg-gray-50 p-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <User size={16} />
                          Student Information
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Name:</span>
                            <span className="font-medium">
                              {request.student?.name}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium flex items-center gap-1">
                              <Mail size={12} />
                              {request.student?.email}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Requested:</span>
                            <span className="font-medium">
                              {formatDate(request.requestedAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <BookOpen size={16} />
                          Course Details
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Course:</span>
                            <span className="font-medium">
                              {request.course?.name}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subject:</span>
                            <span className="font-medium">
                              {request.subject?.name}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Exam Board:</span>
                            <span className="font-medium">
                              {request.examBoard}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-2">
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <MessageSquare size={16} />
                          Student's Request Message
                        </h4>
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {request.reviewNotes ||
                              "No additional notes provided by the student."}
                          </p>
                        </div>
                      </div>

                      {request.reviewedAt && (
                        <div className="lg:col-span-2">
                          <h4 className="font-medium text-gray-900 mb-3">
                            Admin Review
                          </h4>
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <span
                                className={`font-medium ${
                                  request.status === "approved"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {request.status === "approved"
                                  ? "Approved"
                                  : "Rejected"}
                              </span>
                              <span className="text-sm text-gray-500">
                                {formatDate(request.reviewedAt)}
                              </span>
                            </div>
                            {request.adminNotes && (
                              <p className="text-gray-700 mt-2">
                                {request.adminNotes}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CourseRequestsPage;
