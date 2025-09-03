"use client";
import { useState, useEffect } from "react";
import StudentDashboardLayout from "../../layout/student/DashboardLayout";
import { getStudentPostRequirements } from "../../../api/postRequirement.api.js";
import {
  Edit,
  Trash2,
  Eye,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  BookOpen,
  MessageCircle,
  UserCheck,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function MyPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await getStudentPostRequirements();
      if (response.data.success) {
        setPosts(response.data.data);
      } else {
        setError("Failed to fetch posts");
      }
    } catch (err) {
      setError("Error loading posts");
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        // Add your delete API call here
        // await deletePost(postId);
        setPosts(posts.filter((post) => post._id !== postId));
      } catch (err) {
        console.error("Error deleting post:", err);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatBudget = (budget) => {
    return `${budget.currency} ${budget.amount.toLocaleString()} (${
      budget.frequency
    })`;
  };

  if (loading) {
    return (
      <StudentDashboardLayout>
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl shadow-sm p-6 h-48"
                  >
                    <div className="flex h-full space-x-6">
                      <div className="w-1/4 h-full bg-gray-200 rounded-lg"></div>
                      <div className="flex-1 space-y-4">
                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </StudentDashboardLayout>
    );
  }

  if (error) {
    return (
      <StudentDashboardLayout>
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchPosts}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </StudentDashboardLayout>
    );
  }

  return (
    <StudentDashboardLayout>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Posts
              </h1>
              <p className="text-gray-600">
                Manage your tutoring requirement posts ({posts.length} total)
              </p>
            </div>

            <Link
              href="/students/myposts/create"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto text-center"
            >
              Create Post
            </Link>
          </div>

          {/* Posts List */}
          {posts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
                <Edit className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No posts yet
              </h3>
              <p className="text-gray-600 mb-6">
                You haven't created any tutoring requirement posts yet.
              </p>
              <Link
                href="/student/create-post"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create First Post
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <div
                  key={post._id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Image Section */}
                    <div className="md:w-2/5 lg:w-1/4 relative">
                      {post.imageUrl ? (
                        <img
                          src={post.imageUrl}
                          alt="Post requirement"
                          className="w-full h-48 md:h-full object-fit-cover"
                        />
                      ) : (
                        <div className="w-full h-48 md:h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-blue-400" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            post.isVerified
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {post.isVerified ? (
                            <>
                              <UserCheck className="w-3 h-3 mr-1" /> Verified
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 mr-1" /> Pending
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 p-6">
                      <div className="flex flex-col h-full">
                        {/* Header with title and actions */}
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 line-clamp-1">
                              {post.serviceType} - {post.employmentType}
                            </h3>
                            <div className="flex items-center mt-1 text-sm text-gray-500">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>{formatDate(post.createdAt)}</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Link
                              href={`/students/myposts/${post._id}`}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-5 h-5" />
                            </Link>
                            <Link
                              href={`/students/myposts/create?id=${post._id}`}
                            >
                              <button
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit Post"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                            </Link>
                            <button
                              onClick={() => handleDelete(post._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Post"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-700 mb-4 line-clamp-2">
                          {post.description}
                        </p>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          {/* Budget */}
                          <div className="flex items-center">
                            <div className="bg-blue-50 p-2 rounded-lg mr-3">
                              <DollarSign className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Budget</p>
                              <p className="text-sm font-medium text-gray-900">
                                {formatBudget(post.budget)}
                              </p>
                            </div>
                          </div>

                          {/* Location */}
                          <div className="flex items-center">
                            <div className="bg-purple-50 p-2 rounded-lg mr-3">
                              <MapPin className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Location</p>
                              <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                {post.location}
                              </p>
                            </div>
                          </div>

                          {/* Meeting Options */}
                          <div className="flex items-center">
                            <div className="bg-green-50 p-2 rounded-lg mr-3">
                              <Zap className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Meeting</p>
                              <p className="text-sm font-medium text-gray-900">
                                {post.meetingOptions.join(", ")}
                              </p>
                            </div>
                          </div>

                          {/* Languages */}
                          <div className="flex items-center">
                            <div className="bg-amber-50 p-2 rounded-lg mr-3">
                              <MessageCircle className="w-4 h-4 text-amber-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Languages</p>
                              <p className="text-sm font-medium text-gray-900">
                                {post.languages.join(", ")}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Subjects and Footer */}
                        <div className="mt-auto pt-4 border-t border-gray-100">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                                Subjects:
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {post.subjects.slice(0, 3).map((subject) => (
                                  <span
                                    key={subject._id}
                                    className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"
                                  >
                                    {subject.name} ({subject.level})
                                  </span>
                                ))}
                                {post.subjects.length > 3 && (
                                  <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                                    +{post.subjects.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                            <Link
                              href={`/students/myposts/${post._id}`}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors flex items-center"
                            >
                              View Details <Eye className="w-4 h-4 ml-1" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </StudentDashboardLayout>
  );
}
