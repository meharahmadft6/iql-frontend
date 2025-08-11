// src/api/teacher.api.js
import { API } from "./api";

export const getAllTeachers = () => API.get("/teachers/all");
export const approveTeacher = (teacherId, isApproved) =>
  API.patch(`/teachers/approve/${teacherId}`, isApproved);
export const getTeacherById = (id) => API.get(`/teachers/${id}`);
export const createTeacherProfile = (formData) =>
  API.post("/teachers", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
