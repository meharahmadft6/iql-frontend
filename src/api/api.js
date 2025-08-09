import axios from "axios";

export const baseURL = `https://iql-env.eba-mbt8mk3z.ap-south-1.elasticbeanstalk.com`;
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
