import axios from "axios";

export const baseURL = `https://43.205.214.209/api/`;
// export const baseURL = `http://localhost:5000/api`;

export const API = axios.create({
  baseURL: baseURL,
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getDashboardData = () => API.get(`/dashboard`);
