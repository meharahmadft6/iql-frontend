"use client";
import { useState, useEffect } from "react";
import StudentDashboardLayout from "../../layout/student/DashboardLayout";
import {
  StarIcon,
  UserCircleIcon,
  AcademicCapIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { getStudentReviews } from "../../../api/reviews.api";

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await getStudentReviews();
      setReviews(response.data.data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setMessage({ type: "error", text: "Failed to load reviews" });
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-5 w-5 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <StudentDashboardLayout title="My Reviews">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </StudentDashboardLayout>
    );
  }

  return (
    <StudentDashboardLayout title="My Reviews">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Reviews</h1>
            <p className="mt-2 text-sm text-gray-700">
              View all reviews you've submitted for teachers
            </p>
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div
            className={`mb-6 rounded-md p-4 ${
              message.type === "success"
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <p
              className={`text-sm font-medium ${
                message.type === "success" ? "text-green-800" : "text-red-800"
              }`}
            >
              {message.text}
            </p>
          </div>
        )}

        {/* Reviews Grid */}
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No reviews yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              You haven't submitted any reviews yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {review.title}
                      </h3>

                      <div className="flex items-center mb-3">
                        <div className="flex">{renderStars(review.rating)}</div>
                        <span className="ml-2 text-sm text-gray-500">
                          {review.rating}/5
                        </span>
                      </div>

                      <p className="text-gray-600 mb-4">{review.text}</p>

                      <div className="flex items-center text-sm text-gray-500">
                        <UserCircleIcon className="h-4 w-4 mr-1" />
                        <span className="font-medium">
                          {review.teacher.user?.name || "Teacher"}
                        </span>
                        {review.teacher.speciality && (
                          <>
                            <span className="mx-2">•</span>
                            <AcademicCapIcon className="h-4 w-4 mr-1" />
                            <span>{review.teacher.speciality}</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center text-sm text-gray-500 mt-2">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        <span>Reviewed on {formatDate(review.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StudentDashboardLayout>
  );
};

export default ReviewsPage;
