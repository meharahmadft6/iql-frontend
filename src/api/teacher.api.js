// api/teacher.api.js
import { API } from "./api";

// Existing teacher APIs
export const getCurrentTeacher = () => API.get("/teachers/me");
export const getAllPublicTeacherProfiles = () => API.get("/teachers/public");
export const getHomeTutors = () => API.get("/teachers/home-tutors");
export const getOnlineTeachers = () => API.get("/teachers/online-teachers");
export const getHomeworkHelpers = () => API.get("/teachers/homework-helpers");
export const getFilteredTeachers = (params) =>
  API.get("/teachers/filter", { params });
export const getPublicTeacherProfile = (id) =>
  API.get(`/teachers/public/${id}`);
export const getAllTeachers = () => API.get("/teachers/all");
export const approveTeacher = (teacherId, isApproved) =>
  API.patch(`/teachers/approve/${teacherId}`, { isApproved });
export const getTeacherById = (id) => API.get(`/teachers/${id}`);
export const createTeacherProfile = (formData) =>
  API.post("/teachers", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
export const updateTeacherProfile = (id, formData) =>
  API.put(`/teachers/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
export const getTeacherJobs = () => API.get("/teachers/jobs");
export const getTeacherApplications = () => API.get("/teachers/applications");
export const applyForJob = (jobId, applicationData) =>
  API.post(`/teachers/jobs/${jobId}/apply`, applicationData);
export const getTeacherMessages = () => API.get("/teachers/messages");
export const getWalletDetails = () => API.get("/teachers/wallet");
export const purchaseCoins = (coinPackage) =>
  API.post("/teachers/wallet/purchase", coinPackage);

// Contact & Review APIs
export const initiateContact = (teacherId, data) =>
  API.post(`/contact/${teacherId}`, data);

export const getContactStatus = (teacherId) => API.get(`/contact/${teacherId}`);

export const createReview = (teacherId, data) =>
  API.post(`/contact/${teacherId}/reviews`, data);

export const getTeacherReviews = (teacherId) =>
  API.get(`/contact/${teacherId}/reviews`);

// Additional contact management APIs for teachers
export const getTeacherContacts = () => API.get("/contact/teacher/contacts");

// Additional review management APIs
export const getReview = (reviewId) => API.get(`/reviews/${reviewId}`);

export const updateReview = (reviewId, data) =>
  API.put(`/reviews/${reviewId}`, data);

export const deleteReview = (reviewId) => API.delete(`/reviews/${reviewId}`);

// Get all reviews (with pagination/filtering)
export const getAllReviews = (params) => API.get("/reviews", { params });
