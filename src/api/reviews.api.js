import { API } from "./api";

// Get all reviews for the current student
export const getStudentReviews = () => API.get("/reviews/my-reviews");

// Get reviews for a specific teacher
export const getTeacherReviews = (teacherId) =>
  API.get(`/teachers/${teacherId}/reviews`);

// Create a new review
export const createReview = (reviewData) => API.post("/reviews", reviewData);

// Update a review
export const updateReview = (reviewId, reviewData) =>
  API.put(`/reviews/${reviewId}`, reviewData);

// Delete a review
export const deleteReview = (reviewId) => API.delete(`/reviews/${reviewId}`);
