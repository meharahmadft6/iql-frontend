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
