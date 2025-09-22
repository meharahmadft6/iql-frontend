"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPostRequirementById } from "../../../../api/postRequirement.api.js";
import {
  applyToPost,
  getContactInformation,
  checkApplicationStatusFromApi,
} from "../../../../api/teacherApplications.api.js";

import DashboardLayout from "../../../layout/teacher/DashboardLayout";

import {
  MapPin,
  DollarSign,
  Clock,
  User,
  Mail,
  MessageSquare,
  Phone,
  Globe,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Loader,
  Shield,
  Award,
  Calendar,
} from "lucide-react";
import Swal from "sweetalert2";

export default function PostDetailPage() {
  const router = useRouter();
  const { id } = useParams();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [fetchingContact, setFetchingContact] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [contactInfo, setContactInfo] = useState(null);
  const [error, setError] = useState(null);
  const [applicationId, setApplicationId] = useState(null);
  const [applicationChecked, setApplicationChecked] = useState(false);

  const checkApplicationStatusFromServer = async (postId) => {
    try {
      const response = await checkApplicationStatusFromApi(postId);
      const payload = response?.data ? response.data : response;

      if (payload?.success && payload?.data) {
        setApplicationStatus(payload.data.status);
        setApplicationId(payload.data._id);

        // If application is accepted, automatically fetch contact info
        if (payload.data.status === "accepted") {
          await handleGetContact(true);
        }
      } else if (
        payload?.success === false &&
        payload?.message === "No application found for this post"
      ) {
        // Clear any existing application status if no application found
        setApplicationStatus(null);
        setApplicationId(null);
        setContactInfo(null);

        // Also clear from localStorage if exists
        const appliedPosts = JSON.parse(
          localStorage.getItem("appliedPosts") || "{}"
        );
        if (appliedPosts[postId]) {
          delete appliedPosts[postId];
          localStorage.setItem("appliedPosts", JSON.stringify(appliedPosts));
        }
      }
    } catch (error) {
      console.error("Error checking application status from server:", error);
      // If it's a "not found" error, clear application status
      if (
        error.response?.data?.message === "No application found for this post"
      ) {
        setApplicationStatus(null);
        setApplicationId(null);
        setContactInfo(null);
      }
    } finally {
      setApplicationChecked(true);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPost(id);
      checkApplicationStatusFromServer(id);
    }
  }, [id]);

  const fetchPost = async (postId) => {
    try {
      setLoading(true);
      const response = await getPostRequirementById(postId);

      if (response.data.success) {
        setPost(response.data.data);
      } else {
        setError("Failed to fetch post");
      }
    } catch (err) {
      setError("Error loading post");
      console.error("Error fetching post:", err);
    } finally {
      setLoading(false);
    }
  };

  const startAutoAcceptCountdown = (postId, appId) => {
    // Mark that we've started the auto-accept process
    const appliedPosts = JSON.parse(
      localStorage.getItem("appliedPosts") || "{}"
    );
    appliedPosts[postId] = {
      status: "pending",
      applicationId: appId,
      autoAcceptStarted: true,
    };
    localStorage.setItem("appliedPosts", JSON.stringify(appliedPosts));

    // Show countdown timer
    let timeLeft = 5;

    Swal.fire({
      title: "Application Submitted!",
      html: `Your application has been submitted successfully.<br>Contact information will be available in <b>${timeLeft}</b> seconds.`,
      icon: "success",
      timer: 5000,
      timerProgressBar: true,
      showConfirmButton: false,
      allowOutsideClick: false,

      didOpen: () => {
        const timerInterval = setInterval(() => {
          timeLeft -= 1;
          if (Swal.isVisible()) {
            Swal.getHtmlContainer().querySelector("b").textContent = timeLeft;
          }
        }, 1000);

        // Clear interval when alert closes
        Swal.stopTimer; // not needed here but good to know
        Swal.getPopup().addEventListener("swal:cleanup", () => {
          clearInterval(timerInterval);
        });
      },

      willClose: () => {
        // This fires after timer finishes
        handleAutoAccept(postId, appId);
      },
    });
  };
  const handleAutoAccept = async (postId, appId) => {
    try {
      // Update application status to accepted
      const appliedPosts = JSON.parse(
        localStorage.getItem("appliedPosts") || "{}"
      );
      appliedPosts[postId].status = "accepted";
      localStorage.setItem("appliedPosts", JSON.stringify(appliedPosts));

      setApplicationStatus("accepted");
      setApplicationId(appId);

      // Automatically fetch and show contact information
      await handleGetContact(true);

      // Show success message
      Swal.fire({
        title: "Application Accepted!",
        text: "You can now contact the student",
        icon: "success",
        confirmButtonText: "Great!",
      });
    } catch (error) {
      console.error("Error in auto accept:", error);
    }
  };

  const handleApply = async () => {
    if (!post) return;

    try {
      setApplying(true);

      const result = await Swal.fire({
        title: "Apply for this Post?",
        text: `This will cost you coins from your wallet. Do you want to proceed?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, apply now!",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        const response = await applyToPost(post._id);

        if (response.data.success) {
          // Store application status in localStorage
          const appliedPosts = JSON.parse(
            localStorage.getItem("appliedPosts") || "{}"
          );
          appliedPosts[post._id] = {
            status: "pending",
            applicationId: response.data.data._id,
            autoAcceptStarted: false,
          };
          localStorage.setItem("appliedPosts", JSON.stringify(appliedPosts));

          setApplicationStatus("pending");
          setApplicationId(response.data.data._id);

          // Start the auto-accept countdown
          startAutoAcceptCountdown(post._id, response.data.data._id);
        }
      }
    } catch (error) {
      console.error("Application error:", error);

      let errorMessage = "Failed to apply to this post";
      if (
        error.response?.data?.message ===
        "You have already applied to this post"
      ) {
        // If already applied, check the current status
        await checkApplicationStatusFromServer(post._id);
        errorMessage = "You have already applied to this post";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      await Swal.fire({
        title: "Application Failed",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setApplying(false);
    }
  };

  const handleGetContact = async (isAuto = false) => {
    if (!post || !applicationId) return;

    try {
      setFetchingContact(true);

      const response = await getContactInformation(applicationId);

      if (response.data.success) {
        setContactInfo(response.data.data.student);

        if (!isAuto) {
          await Swal.fire({
            title: "Contact Information",
            html: `
              <div class="text-left">
                <p><strong>Name:</strong> ${response.data.data.student.name}</p>
                <p><strong>Email:</strong> ${response.data.data.student.email}</p>
                <p><strong>Phone:</strong> ${response.data.data.student.phone.countryCode} ${response.data.data.student.phone.number}</p>
              </div>
            `,
            icon: "success",
            confirmButtonText: "OK",
          });
        }
      }
    } catch (error) {
      console.error("Contact fetch error:", error);

      let errorMessage = "Failed to fetch contact information";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      if (!isAuto) {
        await Swal.fire({
          title: "Failed to Retrieve Contact",
          text: errorMessage,
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } finally {
      setFetchingContact(false);
    }
  };

  const handleShowPhone = async () => {
    if (!contactInfo) {
      await handleGetContact(false);
      return;
    }

    await Swal.fire({
      title: "Phone Number",
      html: `
        <div class="text-center">
          <p class="text-lg font-semibold">${contactInfo.phone.countryCode} ${contactInfo.phone.number}</p>
        </div>
      `,
      icon: "info",
      confirmButtonText: "OK",
    });
  };

  const handleMessageStudent = async () => {
    if (!contactInfo) {
      await handleGetContact(false);
      return;
    }

    // Implement your messaging logic here
    // For now, just show the contact info
    await Swal.fire({
      title: "Contact Student",
      html: `
        <div class="text-left">
          <p><strong>Name:</strong> ${contactInfo.name}</p>
          <p><strong>Email:</strong> ${contactInfo.email}</p>
          <p><strong>Phone:</strong> ${contactInfo.phone.countryCode} ${contactInfo.phone.number}</p>
        </div>
        <p class="mt-4">You can contact the student using the information above.</p>
      `,
      icon: "info",
      confirmButtonText: "OK",
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatBudget = (budget) => {
    return `${budget.currency} ${budget.amount.toLocaleString()} (${
      budget.frequency
    })`;
  };

  if (loading) {
    return (
      <DashboardLayout title="Post Requirement Details">
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                  <div className="h-64 bg-gray-200 rounded-lg"></div>
                  <div className="h-48 bg-gray-200 rounded-lg"></div>
                  <div className="h-64 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="space-y-6">
                  <div className="h-64 bg-gray-200 rounded-lg"></div>
                  <div className="h-48 bg-gray-200 rounded-lg"></div>
                  <div className="h-40 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !post) {
    return (
      <DashboardLayout title="Post Requirement Details">
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => router.push("/teacher/dashboard")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Post Requirement Details">
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <button
                  onClick={() => router.back()}
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4"
                >
                  &larr; Back to posts
                </button>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Teaching Opportunity
                </h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      post.isVerified
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {post.isVerified ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1" /> Verified
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 mr-1" /> Pending
                        Verification
                      </>
                    )}
                  </span>
                  <span className="text-sm text-gray-500 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Posted {formatDate(post.createdAt)}
                  </span>
                </div>
              </div>

              {/* Application Status Buttons */}
              {applicationChecked && (
                <div className="flex gap-2 flex-wrap">
                  {applicationStatus === "accepted" ? (
                    <>
                      <button
                        onClick={handleMessageStudent}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Message Student
                      </button>

                      <button
                        onClick={handleShowPhone}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        View Phone
                      </button>
                    </>
                  ) : applicationStatus === "pending" ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                      <p className="text-blue-700 text-sm font-medium flex items-center">
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Application Pending
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={handleApply}
                      disabled={applying}
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {applying ? (
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Award className="w-4 h-4 mr-2" />
                      )}
                      {applying ? "Applying..." : "Apply Now"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Post Image */}
              {post.imageUrl && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                  <img
                    src={post.imageUrl}
                    alt="Post requirement"
                    className="w-full h-64 sm:h-80 object-cover"
                  />
                </div>
              )}

              {/* Description */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-indigo-600" />
                  Description
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {post.description}
                </p>
              </div>

              {/* Subjects */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-indigo-600" />
                  Subjects Required
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {post.subjects.map((subject) => (
                    <div
                      key={subject._id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors bg-gray-50"
                    >
                      <h3 className="font-semibold text-gray-900">
                        {subject.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Level:{" "}
                        <span className="font-medium">{subject.level}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* User Information */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-indigo-600" />
                  Student Information
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-gray-700 font-medium">
                      {contactInfo ? contactInfo.name : post.user.name}
                    </span>
                    {post.user.isVerified && (
                      <CheckCircle className="w-4 h-4 ml-2 text-green-500" />
                    )}
                  </div>

                  {/* Show email only if teacher has applied and is accepted */}
                  {applicationStatus === "accepted" && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-3 text-gray-400" />
                      <span className="text-gray-700">
                        {contactInfo ? contactInfo.email : post.user.email}
                      </span>
                    </div>
                  )}

                  {/* Show phone only if contact info has been fetched */}
                  {contactInfo && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-3 text-gray-400" />
                      <span className="text-gray-700">
                        {contactInfo.phone.countryCode}{" "}
                        {contactInfo.phone.number}
                      </span>
                    </div>
                  )}

                  {/* Show message based on application status */}
                  {!applicationStatus && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-blue-700 text-sm">
                        Apply to this post to view student contact information
                      </p>
                    </div>
                  )}

                  {applicationStatus === "pending" && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-yellow-700 text-sm">
                        Your application is being processed. Contact information
                        will be available soon.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Quick Info */}
            <div className="space-y-6">
              {/* Quick Details */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-indigo-600" />
                  Quick Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service Type
                    </label>
                    <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                      {post.serviceType}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employment Type
                    </label>
                    <span className="inline-block bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
                      {post.employmentType}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Budget
                    </label>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1 text-gray-400" />
                      <span className="font-semibold text-gray-900">
                        {formatBudget(post.budget)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meeting Preference
                    </label>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-gray-400" />
                      <span className="text-gray-900">
                        {post.meetingOptions.join(", ")}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Languages
                    </label>
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 mr-1 text-gray-400" />
                      <span className="text-gray-900">
                        {post.languages.join(", ")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-indigo-600" />
                  Location
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {post.location}
                </p>
              </div>

              {/* Post Statistics */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Post Statistics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span
                      className={`text-sm font-medium ${
                        post.isVerified ? "text-green-600" : "text-yellow-600"
                      }`}
                    >
                      {post.isVerified ? "Verified" : "Pending"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Created:</span>
                    <span className="text-sm text-gray-900">
                      {formatDate(post.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Subjects:</span>
                    <span className="text-sm text-gray-900">
                      {post.subjects.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
