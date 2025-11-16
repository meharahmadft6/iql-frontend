import { API } from "./api";

// Get student dashboard overview
export const getStudentDashboard = () => API.get("/dashboard");

// Get detailed student statistics
export const getStudentStats = () => API.get("/dashboard/stats");

// Get wallet information
export const getWallet = () => API.get("/wallet");

// Get transaction history
export const getTransactionHistory = () => API.get("/wallet/transactions");
