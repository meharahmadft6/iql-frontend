import { API } from "./api";

// Apply to a post (needs postId)
export const applyToPost = (postId) =>
  API.post(`/applications/apply/${postId}`);

// Get contact info (needs applicationId)
export const getContactInformation = (applicationId) =>
  API.get(`/applications/contact/${applicationId}`);

// ✅ Check application status (needs postId)
export const checkApplicationStatusFromApi = (postId) =>
  API.get(`/applications/check/${postId}`);
