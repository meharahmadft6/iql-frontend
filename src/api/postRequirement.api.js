import { API } from "./api";

export const createPostRequirement = (formData, config = {}) =>
  API.post("/post-requirement", formData, {
    ...config,
    headers: {
      ...(config.headers || {}), // merge any custom headers
    },
  });
export const updatePostRequirement = (id, formData) =>
  API.put(`/post-requiremnet/${id}`, formData, {
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
export const getPostRequirementById = (id) =>
  API.get(`/post-requirement/${id}`);
