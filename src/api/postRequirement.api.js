import { API } from "./api";

export const createPostRequirement = (formData, config = {}) =>
  API.post("/post-requirement", formData, {
    ...config,
    headers: {
      ...(config.headers || {}), // merge any custom headers
    },
  });
export const updatePostRequirement = (id, formData) =>
  API.put(`/post-requirement/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getStudentPostRequirements = () => {
  // Get user token from localStorage or context
  const token = localStorage.getItem("token"); // or however you store the auth token

  return API.get("/post-requirement/my-posts", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};
export const getAllPostRequirements = (page = 1, limit = 15) =>
  API.get(`/post-requirement?page=${page}&limit=${limit}`);
export const getAllHomePostRequirements = (page = 1, limit = 15) =>
  API.get(`/post-requirement/home-teaching-jobs?page=${page}&limit=${limit}`);
export const getAllOnlinePostRequirements = (page = 1, limit = 15) =>
  API.get(`/post-requirement/online-teaching-jobs?page=${page}&limit=${limit}`);
export const getAllAssignmentPostRequirements = (page = 1, limit = 15) =>
  API.get(`/post-requirement/assignment-help?page=${page}&limit=${limit}`);

export const getPostRequirementById = (id) =>
  API.get(`/post-requirement/${id}`);
