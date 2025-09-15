import { API } from "./api";
export const getCurrentUser = () => API.get("auth/me");
export const forgotPassword = (email) =>
  API.post("auth/forgotpassword", { email });
export const resetPassword = (resetToken, newPassword) =>
  API.put(`auth/reset-password/${resetToken}`, { newPassword });
export const verifyEmail = (token) => API.get(`auth/verify-email/${token}`);
// Update user profile
export const updateProfile = (data) => API.put("auth/updatedetails", data);

// Request verification email
export const requestVerificationEmail = () =>
  API.post("auth/resend-verification");
