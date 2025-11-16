// pages/courses/[id]/CourseDetailPage.js
"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "../../../layout/DashboardLayout";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  StickyNote,
  Calendar,
  Settings,
  Edit3,
  Plus,
} from "lucide-react";
import {
  getCourse,
  getBatchResourcesByCourse,
} from "../../../../api/course.api";
import Swal from "sweetalert2";
import Link from "next/link";

const CourseDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id;

  const [course, setCourse] = useState(null);
  const [allResources, setAllResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const [courseRes, resourcesRes] = await Promise.all([
        getCourse(courseId),
        getBatchResourcesByCourse(courseId),
      ]);

      if (courseRes.data.success) {
        console.log("Course data:", courseRes.data.data.course);
        setCourse(courseRes.data.data.course);
      }

      if (resourcesRes.data.success) {
        console.log("Resources data:", resourcesRes.data.data);
        setAllResources(resourcesRes.data.data);
      }
    } catch (error) {
      console.error("Error fetching course data:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load course data",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get all unique exam boards from all subjects
  const getAllExamBoards = () => {
    if (!course?.subjectExamBoards) return [];

    const allBoards = new Set();
    course.subjectExamBoards.forEach((seb) => {
      if (seb.examBoards && Array.isArray(seb.examBoards)) {
        seb.examBoards.forEach((board) => allBoards.add(board));
      }
    });

    return Array.from(allBoards);
  };

  // Get exam boards for a specific subject
  const getExamBoardsForSubject = (subjectId) => {
    if (!course?.subjectExamBoards) return [];

    const subjectExamBoard = course.subjectExamBoards.find(
      (seb) =>
        (seb.subject._id === subjectId || seb.subject === subjectId) &&
        seb.examBoards &&
        Array.isArray(seb.examBoards)
    );

    return subjectExamBoard?.examBoards || [];
  };

  // Get resources for a specific subject and exam board
  const getResources = (subjectId, examBoard) => {
    return allResources.find(
      (resource) =>
        (resource.subject._id === subjectId ||
          resource.subject === subjectId) &&
        resource.examBoard === examBoard
    );
  };

  // Get resource stats
  const getResourceStats = (subjectId, examBoard) => {
    const resource = getResources(subjectId, examBoard);

    if (!resource) {
      return { total: 6, enabled: 0, exists: false };
    }

    const enabledResources = Object.values(resource.resources).filter(
      (resourceType) => resourceType.isEnabled
    ).length;

    return {
      total: Object.keys(resource.resources).length,
      enabled: enabledResources,
      exists: true,
    };
  };

  // Calculate course statistics
  const getCourseStats = () => {
    if (!course)
      return { totalSubjects: 0, totalExamBoards: 0, totalResources: 0 };

    const totalSubjects = course.subjectExamBoards?.length || 0;
    const totalExamBoards = getAllExamBoards().length;
    const totalResources = allResources.length;

    return { totalSubjects, totalExamBoards, totalResources };
  };

  // Get subject name for display
  const getSubjectName = (subjectExamBoard) => {
    if (typeof subjectExamBoard.subject === "object") {
      return subjectExamBoard.subject.name;
    }
    return subjectExamBoard.subjectName || "Loading...";
  };

  // Get subject details
  const getSubjectDetails = (subjectExamBoard) => {
    if (typeof subjectExamBoard.subject === "object") {
      return {
        name: subjectExamBoard.subject.name,
        category: subjectExamBoard.subject.category,
        level: subjectExamBoard.subject.level,
      };
    }
    return {
      name: subjectExamBoard.subjectName || "Loading...",
      category: "Unknown",
      level: "Unknown",
    };
  };

  // Encode exam board for URL (handles spaces and special characters)
  const encodeExamBoard = (examBoard) => {
    return encodeURIComponent(examBoard);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Course not found</h1>
          <button
            onClick={() => router.push("/dashboard/courses")}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Back to Courses
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const stats = getCourseStats();
  const allExamBoards = getAllExamBoards();

  console.log("Course:", course);
  console.log("All exam boards:", allExamBoards);
  console.log("Subject exam boards:", course.subjectExamBoards);

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard/courses")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                {course.name}
              </h1>
              <p className="text-gray-600 mt-1">{course.description}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {course.level}
                </span>
                {allExamBoards.slice(0, 3).map((board) => (
                  <span
                    key={board}
                    className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                  >
                    {board}
                  </span>
                ))}
                {allExamBoards.length > 3 && (
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    +{allExamBoards.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Course Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Subjects</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalSubjects}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <BookOpen className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Exam Boards</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalExamBoards}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <FileText className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resources</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalResources}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Settings className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Created</p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {new Date(course.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <Calendar className="text-orange-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Subjects and Resources */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Subjects & Resources
                </h2>
                <p className="text-gray-600 mt-1">
                  Manage resources for each subject and exam board combination
                </p>
              </div>
              <button
                onClick={fetchCourseData}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Refresh Data
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {course.subjectExamBoards?.map((subjectExamBoard) => {
              const subjectDetails = getSubjectDetails(subjectExamBoard);
              const subjectExamBoards = getExamBoardsForSubject(
                typeof subjectExamBoard.subject === "object"
                  ? subjectExamBoard.subject._id
                  : subjectExamBoard.subject
              );

              console.log(
                `Subject: ${subjectDetails.name}, Exam Boards:`,
                subjectExamBoards
              );

              return (
                <div
                  key={subjectExamBoard._id || subjectExamBoard.subject}
                  className="p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {subjectDetails.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {subjectDetails.category} • {subjectDetails.level}
                      </p>
                    </div>
                  </div>

                  {/* Exam Boards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subjectExamBoards.map((examBoard) => {
                      const subjectId =
                        typeof subjectExamBoard.subject === "object"
                          ? subjectExamBoard.subject._id
                          : subjectExamBoard.subject;

                      const stats = getResourceStats(subjectId, examBoard);
                      const resourceExists = getResources(subjectId, examBoard);
                      const encodedExamBoard = encodeExamBoard(examBoard);

                      console.log(
                        `Exam Board: ${examBoard}, Encoded: ${encodedExamBoard}`
                      );

                      return (
                        <div
                          key={`${subjectId}-${examBoard}`}
                          className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-medium text-gray-900">
                              {examBoard}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                stats.enabled > 0
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {stats.enabled}/{stats.total} resources
                            </span>
                          </div>

                          <div className="space-y-2 mb-4">
                            <Link
                              href={`/dashboard/courses/${courseId}/resources/${subjectId}/${encodedExamBoard}/exam-questions`}
                              className="flex items-center justify-between p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                              <span>Exam Questions</span>
                              <Edit3 size={16} />
                            </Link>

                            <Link
                              href={`/dashboard/courses/${courseId}/resources/${subjectId}/${encodedExamBoard}/revision-notes`}
                              className="flex items-center justify-between p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                              <span>Revision Notes</span>
                              <StickyNote size={16} />
                            </Link>

                            <Link
                              href={`/dashboard/courses/${courseId}/resources/${subjectId}/${encodedExamBoard}/past-papers`}
                              className="flex items-center justify-between p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                              <span>Past Papers</span>
                              <FileText size={16} />
                            </Link>
                          </div>

                          <Link
                            href={`/dashboard/courses/${courseId}/resources/${subjectId}/${encodedExamBoard}`}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <Settings size={16} />
                            Manage All Resources
                          </Link>

                          {!resourceExists && (
                            <div className="mt-2 text-xs text-gray-500 text-center">
                              No resources created yet
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CourseDetailPage;
