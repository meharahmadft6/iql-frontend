import { API } from "./api";
export const getCurrentUser = () => API.get("auth/me");
