import { API } from "./api";

export const getSubjects = () => API.get("/subjects");
export const createSubject = (data) => API.post("/subjects", data);
export const updateSubject = (id, data) => API.put(`/subjects/${id}`, data);
export const deleteSubject = (id) => API.delete(`/subjects/${id}`);
export const createBulkSubjects = (data) => API.post("/subjects/bulk", data);
