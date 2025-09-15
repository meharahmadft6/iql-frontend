import { API } from "./api";
export const getAllStudents = () => API.get("/students/admin");
