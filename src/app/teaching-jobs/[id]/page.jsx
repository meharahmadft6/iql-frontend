"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { getPostRequirementById } from "../../../api/postRequirement.api.js";
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
} from "lucide-react";
import Swal from "sweetalert2";
export default function PostDetailPage() {
  const router = useRouter();
  const { id } = useParams();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchPost(id);
    }
  }, [id]);
  const fetchPost = async (postId) => {
    try {
      setLoading(true);
      const response = await getPostRequirementById(postId);

      if (response.data.success) {
        setPost(response.data.data); // API should already return the single post
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

  const handleAction = (action) => {
    Swal.fire({
      title: "Login Required",
      text: "Please login first to continue.",
      icon: "warning",
      confirmButtonText: "Login",
    }).then((result) => {
      if (result.isConfirmed) {
        router.push("/login");
      }
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
      <Navbar>
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </Navbar>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Post Details
                </h1>
                <div className="flex items-center gap-3">
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
                  <span className="text-sm text-gray-500">
                    Created {formatDate(post.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                {/* Message Button */}
                <button
                  onClick={() => handleAction("message")}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message
                </button>

                {/* View Phone Button */}
                <button
                  onClick={() => handleAction("phone")}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  View Phone Number
                </button>
              </div>{" "}
            </div>
          </div>

          {/* Main Content */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Post Image */}
              {post.imageUrl && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <img
                    src={post.imageUrl}
                    alt="Post requirement"
                    className="w-full h-64 sm:h-80 object-cover"
                  />
                </div>
              )}

              {/* Description */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Description
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {post.description}
                </p>
              </div>

              {/* Subjects */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Subjects Required
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {post.subjects.map((subject) => (
                    <div
                      key={subject._id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-200 transition-colors"
                    >
                      <h3 className="font-semibold text-gray-900">
                        {subject.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Level: {subject.level}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* User Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Student Information
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-gray-700">{post.user.name}</span>
                    {post.user.isVerified && (
                      <CheckCircle className="w-4 h-4 ml-2 text-green-500" />
                    )}
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-gray-700">{post.user.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-gray-700">
                      {post.phone.countryCode} {post.phone.number}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Quick Info */}
            <div className="space-y-6">
              {/* Quick Details */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
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
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Location
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {post.location}
                </p>
              </div>

              {/* Actions */}

              {/* Post Statistics */}
              <div className="bg-white rounded-lg shadow-sm p-6">
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
      <Footer />
    </>
  );
}
