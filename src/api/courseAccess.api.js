import { API } from "./api";

// Check course access
export const checkCourseAccess = (courseId, subjectId, examBoard) =>
  API.get(`/course-access/check-access/${courseId}/${subjectId}/${examBoard}`);

// Request course access with review notes
export const requestCourseAccess = (requestData) =>
  API.post(`/course-access/request`, requestData);

// Get student's access requests
export const getStudentAccessRequests = () =>
  API.get(`/course-access/my-requests`);
export const getPendingAccessRequests = (page = 1, limit = 10) =>
  API.get(`/course-access/pending?page=${page}&limit=${limit}`);

// Review access request (approve/reject)
export const reviewAccessRequest = (requestId, status, reviewNotes = "") =>
  API.patch(`/course-access/${requestId}/review`, {
    status,
    reviewNotes,
  });

// Get all access requests with filters
export const getAllAccessRequests = (filters = {}) =>
  API.get(`/course-access/all`, { params: filters });

// Get access request statistics
export const getAccessRequestStats = () => API.get(`/course-access/stats`);
