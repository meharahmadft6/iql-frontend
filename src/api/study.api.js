// api/study.api.js
import { API } from "./api";

export const getExamQuestions = (courseId, subjectId, examBoard) =>
  API.get(`/study/${courseId}/${subjectId}/${examBoard}/exam-questions`);
export const getRevisionNotes = (courseId, subjectId, examBoard) =>
  API.get(`/study/${courseId}/${subjectId}/${examBoard}/revision-notes`);
export const getPastPapers = (courseId, subjectId, examBoard) =>
  API.get(`/study/${courseId}/${subjectId}/${examBoard}/past-papers`);
