// api/course.api.js
import { API } from "./api";

export const getCourses = () => API.get("/courses");
export const createCourse = (data) => API.post("/courses", data);
export const updateCourse = (id, data) => API.put(`/courses/${id}`, data);
export const deleteCourse = (id) => API.delete(`/courses/${id}`);
export const getCourse = (id) => API.get(`/courses/${id}`);
export const getStudyNavigation = (params = {}) => {
  const queryParams = new URLSearchParams();

  if (params.courseId) queryParams.append("courseId", params.courseId);
  if (params.subjectId) queryParams.append("subjectId", params.subjectId);

  const queryString = queryParams.toString();
  const url = `/study/navigation${queryString ? `?${queryString}` : ""}`;

  return API.get(url);
};

export const getSubjectResourcesPublic = (courseId, subjectId, examBoard) => {
  return API.get(
    `/study/resources/${courseId}/${subjectId}/${encodeURIComponent(examBoard)}`
  );
};
// Subject Resources API
export const upsertSubjectResources = (data) =>
  API.post("/subject-resources", data);
export const getSubjectResources = (subjectId, courseId, examBoard) =>
  API.get(`/subject-resources/${subjectId}/${courseId}/${examBoard}`);
export const addMCQ = (
  subjectId,
  courseId,
  examBoard,
  topic,
  subSection,
  data
) =>
  API.post(
    `/subject-resources/${subjectId}/${courseId}/${examBoard}/mcqs/${topic}/${subSection}`,
    data
  );
export const addRevisionNote = (subjectId, courseId, examBoard, data) =>
  API.post(
    `/subject-resources/${subjectId}/${courseId}/${examBoard}/revision-notes`,
    data
  );

export const updateRevisionNote = async (
  subjectId,
  courseId,
  examBoard,
  noteIndex,
  noteData
) => {
  const response = await API.put(
    `/subject-resources/${subjectId}/${courseId}/${examBoard}/revision-notes/${noteIndex}`,
    noteData
  );
  return response.data;
};

// Delete revision note
export const deleteRevisionNote = async (
  subjectId,
  courseId,
  examBoard,
  noteIndex
) => {
  const response = await API.delete(
    `/subject-resources/${subjectId}/${courseId}/${examBoard}/revision-notes/${noteIndex}`
  );
  return response.data;
};
export const addPastPaper = (subjectId, courseId, examBoard, data) =>
  API.post(
    `/subject-resources/${subjectId}/${courseId}/${examBoard}/past-papers`,
    data
  );
export const toggleResourceType = (
  subjectId,
  courseId,
  examBoard,
  resourceType,
  data
) =>
  API.patch(
    `/subject-resources/${subjectId}/${courseId}/${examBoard}/toggle/${resourceType}`,
    data
  );
export const getSubjects = () => API.get("/subjects");
// api/course.api.js - Add these functions
export const getBatchResourcesByCourse = (courseId) =>
  API.get(`/subject-resources/course/${courseId}`);

export const createSubjectResources = (data) =>
  API.post("/subject-resources", data);

export const updateSubjectResources = (id, data) =>
  API.put(`/subject-resources/${id}`, data);
// api/course.api.js
export const addMultipleMCQs = async (
  subjectId,
  courseId,
  examBoard,
  topic,
  subSection,
  data
) => {
  const response = await API.post(
    `/subject-resources/${subjectId}/${courseId}/${examBoard}/mcqs-bulk/${topic}/${subSection}`,
    data
  );
  return response;
};

export const bulkImportMCQs = async (subjectId, courseId, examBoard, data) => {
  const response = await API.post(
    `/subject-resources/${subjectId}/${courseId}/${examBoard}/mcqs-bulk-import`,
    data
  );
  return response;
};
// Add these to your api/course.api.js
export const updateMCQ = (
  subjectId,
  courseId,
  examBoard,
  topic,
  subSection,
  mcqIndex,
  data
) =>
  API.put(
    `/subject-resources/${subjectId}/${courseId}/${examBoard}/mcqs/${topic}/${subSection}/${mcqIndex}`,
    data
  );

export const deleteMCQ = (
  subjectId,
  courseId,
  examBoard,
  topic,
  subSection,
  mcqIndex
) =>
  API.delete(
    `/subject-resources/${subjectId}/${courseId}/${examBoard}/mcqs/${topic}/${subSection}/${mcqIndex}`
  );
// routes/subjectResources.js - Add these routes
export const updatePastPaper = (
  subjectId,
  courseId,
  examBoard,
  paperIndex,
  data
) =>
  API.put(
    `/subject-resources/${subjectId}/${courseId}/${examBoard}/past-papers/${paperIndex}`,
    data
  );

export const deletePastPaper = (subjectId, courseId, examBoard, paperIndex) =>
  API.delete(
    `/subject-resources/${subjectId}/${courseId}/${examBoard}/past-papers/${paperIndex}`
  );

// S3 Upload
export const uploadToS3 = (formData) =>
  API.post("/upload/s3", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
