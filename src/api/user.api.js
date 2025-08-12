import { API } from "./api";
export const getCurrentUser = () => API.get("auth/me");
export const forgotPassword = (email) =>
  API.post("auth/forgotpassword", { email });
export const resetPassword = (resetToken, newPassword) =>
  API.put(`auth/reset-password/${resetToken}`, { newPassword });
