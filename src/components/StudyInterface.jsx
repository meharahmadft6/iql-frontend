"use client";
import { useState, useEffect } from "react";
import {
  getCourses,
  getStudyNavigation,
  getSubjectResourcesPublic,
} from "../api/course.api";
import {
  checkCourseAccess,
  requestCourseAccess,
} from "../api/courseAccess.api";
import Swal from "sweetalert2";

const StudyInterface = () => {
  const [studyData, setStudyData] = useState({
    courses: [],
    currentStep: "courses",
    selectedCourse: null,
    selectedSubject: null,
    selectedExamBoard: null,
    resources: [],
    loading: false,
    error: null,
    accessStatus: {},
  });

  // Modal state
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch initial courses
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setStudyData((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await getCourses();
      if (response.data.success) {
        setStudyData((prev) => ({
          ...prev,
          courses: response.data.data,
          loading: false,
        }));
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setStudyData((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to load courses. Please try again.",
      }));
    }
  };

  const fetchSubjects = async (courseId) => {
    setStudyData((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await getStudyNavigation({ courseId });
      if (response.data.success) {
        setStudyData((prev) => ({
          ...prev,
          subjects: response.data.data.subjects,
          loading: false,
          currentStep: "subjects",
        }));
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setStudyData((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to load subjects. Please try again.",
      }));
    }
  };

  const fetchExamBoards = async (courseId, subjectId) => {
    setStudyData((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await getStudyNavigation({ courseId, subjectId });
      if (response.data.success) {
        setStudyData((prev) => ({
          ...prev,
          examBoards: response.data.data.examBoards,
          loading: false,
          currentStep: "examBoards",
        }));
      }
    } catch (error) {
      console.error("Error fetching exam boards:", error);
      setStudyData((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to load exam boards. Please try again.",
      }));
    }
  };

  const fetchResources = async (courseId, subjectId, examBoard) => {
    setStudyData((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await getSubjectResourcesPublic(
        courseId,
        subjectId,
        examBoard
      );
      if (response.data.success) {
        let accessStatus = {};
        try {
          const accessResponse = await checkCourseAccess(
            courseId,
            subjectId,
            examBoard
          );
          accessStatus = accessResponse.data.data;
        } catch (accessError) {
          console.error("Error checking access:", accessError);
          accessStatus = {
            hasAccess: false,
            pendingRequest: false,
            requestStatus: "none",
          };
        }

        setStudyData((prev) => ({
          ...prev,
          resources: response.data.data.resources,
          accessStatus: accessStatus,
          loading: false,
          currentStep: "resources",
        }));
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
      setStudyData((prev) => ({
        ...prev,
        resources: [],
        loading: false,
        currentStep: "resources",
        error: null,
      }));
    }
  };

  // Helper function to map API resource types to frontend resource types
  const getResourceTypeFromApi = (apiType) => {
    const typeMap = {
      examQuestions: "exam-questions",
      revisionNotes: "revision-notes",
      pastPapers: "past-papers",
    };

    return typeMap[apiType] || apiType;
  };

  // Navigation handlers
  const handleCourseSelect = (course) => {
    setStudyData((prev) => ({
      ...prev,
      selectedCourse: course,
      selectedSubject: null,
      selectedExamBoard: null,
      resources: [],
      accessStatus: {},
    }));
    fetchSubjects(course._id);
  };

  const handleSubjectSelect = (subjectExam) => {
    setStudyData((prev) => ({
      ...prev,
      selectedSubject: subjectExam,
      selectedExamBoard: null,
      resources: [],
      accessStatus: {},
    }));
    fetchExamBoards(studyData.selectedCourse._id, subjectExam.subject._id);
  };

  const handleExamBoardSelect = (examBoard) => {
    setStudyData((prev) => ({
      ...prev,
      selectedExamBoard: examBoard,
    }));
    fetchResources(
      studyData.selectedCourse._id,
      studyData.selectedSubject.subject._id,
      examBoard
    );
  };

  // Open access request modal
  const handleOpenAccessModal = () => {
    setShowAccessModal(true);
    setReviewNotes(""); // Reset notes when opening modal
  };

  // Close access request modal
  const handleCloseAccessModal = () => {
    setShowAccessModal(false);
    setReviewNotes("");
    setIsSubmitting(false);
  };

  // Handle access request submission
  const handleRequestAccess = async () => {
    if (!reviewNotes.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Review Notes Required",
        text: "Please provide some information about why you need access to this course. This helps us process your request faster.",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    if (reviewNotes.trim().length < 20) {
      Swal.fire({
        icon: "warning",
        title: "More Details Needed",
        text: "Please provide at least 20 characters in your review notes to help us understand your requirements better.",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await requestCourseAccess({
        courseId: studyData.selectedCourse._id,
        subjectId: studyData.selectedSubject.subject._id,
        examBoard: studyData.selectedExamBoard,
        reviewNotes: reviewNotes.trim(),
      });

      if (response.data.success) {
        // Update access status
        setStudyData((prev) => ({
          ...prev,
          accessStatus: {
            ...prev.accessStatus,
            pendingRequest: true,
            requestStatus: "pending",
          },
        }));

        handleCloseAccessModal();

        // Success SweetAlert
        Swal.fire({
          icon: "success",
          title: "Access Request Submitted!",
          html: `
            <div class="text-left">
              <p class="mb-3">Your request for <strong>${studyData.selectedSubject?.subject?.name} - ${studyData.selectedExamBoard}</strong> has been submitted successfully.</p>
              <p class="text-sm text-gray-600">Our admin team will review your application and contact you if needed. You'll receive a notification once your request is processed.</p>
            </div>
          `,
          confirmButtonColor: "#10b981",
          confirmButtonText: "Got it!",
        });
      }
    } catch (error) {
      console.error("Error requesting access:", error);

      let errorMessage = "Failed to submit access request. Please try again.";

      if (
        error.response?.data?.message === "Access request already submitted"
      ) {
        errorMessage =
          "You have already submitted an access request for this course. Our team is reviewing your application.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      // Error SweetAlert
      Swal.fire({
        icon: "error",
        title: "Request Failed",
        text: errorMessage,
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    switch (studyData.currentStep) {
      case "subjects":
        setStudyData((prev) => ({
          ...prev,
          currentStep: "courses",
          selectedCourse: null,
          subjects: [],
          accessStatus: {},
        }));
        break;
      case "examBoards":
        setStudyData((prev) => ({
          ...prev,
          currentStep: "subjects",
          selectedSubject: null,
          examBoards: [],
          accessStatus: {},
        }));
        break;
      case "resources":
        setStudyData((prev) => ({
          ...prev,
          currentStep: "examBoards",
          selectedExamBoard: null,
          resources: [],
          accessStatus: {},
        }));
        break;
      default:
        break;
    }
  };

  const handleReset = () => {
    setStudyData({
      courses: studyData.courses,
      currentStep: "courses",
      selectedCourse: null,
      selectedSubject: null,
      selectedExamBoard: null,
      resources: [],
      loading: false,
      error: null,
      accessStatus: {},
    });
  };

  // Progress steps configuration
  const steps = [
    { key: "courses", label: "Select Course", number: 1 },
    { key: "subjects", label: "Choose Subject", number: 2 },
    { key: "examBoards", label: "Pick Exam Board", number: 3 },
    { key: "resources", label: "Study Materials", number: 4 },
  ];

  // Get current step index for progress calculation
  const currentStepIndex = steps.findIndex(
    (step) => step.key === studyData.currentStep
  );

  return (
    <div className="min-h-screen py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-4">
        {/* Enhanced Header */}
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Start Studying
          </h1>
          <p className="text-base text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Discover courses, explore subjects, and access study materials
            tailored to your educational journey
          </p>
        </div>

        {/* Error Message */}
        {studyData.error && (
          <div className="mb-8 bg-red-50 border-l-4 border-red-400 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-red-400 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="text-lg font-medium text-red-800">Error</h3>
                <p className="text-red-700 mt-1">{studyData.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Main Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Enhanced Navigation Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {studyData.currentStep === "courses" && " Browse Courses"}
                  {studyData.currentStep === "subjects" &&
                    ` ${studyData.selectedCourse?.name}`}
                  {studyData.currentStep === "examBoards" &&
                    ` ${studyData.selectedSubject?.subject?.name}`}
                  {studyData.currentStep === "resources" &&
                    ` ${studyData.selectedExamBoard} Resources`}
                </h2>
                <p className="text-blue-100 text-lg">
                  {studyData.currentStep === "courses" &&
                    "Select a course to begin your learning journey"}
                  {studyData.currentStep === "subjects" &&
                    "Choose your subject to explore study materials"}
                  {studyData.currentStep === "examBoards" &&
                    "Select your exam board for tailored resources"}
                  {studyData.currentStep === "resources" &&
                    "Access study materials and resources"}
                </p>
              </div>

              {/* Enhanced Back Button */}
              {studyData.currentStep !== "courses" && (
                <button
                  onClick={handleBack}
                  className="flex items-center px-6 py-3 text-white bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/30"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <span className="font-semibold">Back</span>
                </button>
              )}
            </div>
          </div>

          {/* Enhanced Content Area */}
          <div className="p-8">
            {studyData.loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                  <p className="text-gray-600 text-lg font-medium">
                    Loading content...
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Enhanced Courses View */}
                {studyData.currentStep === "courses" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {studyData.courses.map((course) => (
                      <div
                        key={course._id}
                        onClick={() => handleCourseSelect(course)}
                        className="group cursor-pointer bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-8 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                      >
                        <div className="flex items-start justify-between mb-6">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-300 shadow-lg">
                            <svg
                              className="w-8 h-8 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                              />
                            </svg>
                          </div>
                          <span className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                            {course.subjectExamBoards?.length || 0} subjects
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 mb-4 leading-tight">
                          {course.name}
                        </h3>
                        <p className="text-gray-600 text-lg leading-relaxed mb-6">
                          Explore comprehensive study materials and resources
                          for {course.name}
                        </p>
                        <div className="flex items-center text-blue-600 font-semibold text-lg">
                          Explore Subjects
                          <svg
                            className="w-5 h-5 ml-2 transform group-hover:translate-x-2 transition-transform duration-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Enhanced Subjects View */}
                {studyData.currentStep === "subjects" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {studyData.selectedCourse?.subjectExamBoards?.map(
                      (subjectExam, index) => (
                        <div
                          key={index}
                          onClick={() => handleSubjectSelect(subjectExam)}
                          className="group cursor-pointer bg-gradient-to-br from-white to-green-50 border-2 border-gray-200 rounded-2xl p-8 hover:border-green-400 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                        >
                          <div className="flex items-start justify-between mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center group-hover:from-green-600 group-hover:to-green-700 transition-all duration-300 shadow-lg">
                              <svg
                                className="w-8 h-8 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                              </svg>
                            </div>
                            <span className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                              {subjectExam.examBoards?.length || 0} exam boards
                            </span>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300 mb-4 leading-tight">
                            {subjectExam.subject?.name ||
                              `Subject ${index + 1}`}
                          </h3>
                          <p className="text-gray-600 text-lg leading-relaxed mb-6">
                            Access study materials for{" "}
                            {subjectExam.subject?.name} across various exam
                            boards
                          </p>
                          <div className="flex items-center text-green-600 font-semibold text-lg">
                            View Exam Boards
                            <svg
                              className="w-5 h-5 ml-2 transform group-hover:translate-x-2 transition-transform duration-300"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* Enhanced Exam Boards View */}
                {studyData.currentStep === "examBoards" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {studyData.selectedSubject?.examBoards?.map(
                      (examBoard, index) => (
                        <div
                          key={index}
                          onClick={() => handleExamBoardSelect(examBoard)}
                          className="group cursor-pointer bg-gradient-to-br from-white to-purple-50 border-2 border-gray-200 rounded-2xl p-8 hover:border-purple-400 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                        >
                          <div className="flex items-start justify-between mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:from-purple-600 group-hover:to-purple-700 transition-all duration-300 shadow-lg">
                              <svg
                                className="w-8 h-8 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </div>
                            <span className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 text-sm font-semibold rounded-full">
                              Exam Board
                            </span>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-300 mb-4 leading-tight">
                            {examBoard}
                          </h3>
                          <p className="text-gray-600 text-lg leading-relaxed mb-6">
                            Explore study resources and materials specifically
                            for {examBoard}
                          </p>
                          <div className="flex items-center text-purple-600 font-semibold text-lg">
                            View Resources
                            <svg
                              className="w-5 h-5 ml-2 transform group-hover:translate-x-2 transition-transform duration-300"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* Enhanced Resources View */}
                {studyData.currentStep === "resources" && (
                  <div className="space-y-8">
                    {/* Enhanced Header Section */}
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-8 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-3xl font-bold text-gray-900 mb-3">
                            {studyData.selectedSubject?.subject?.name} -{" "}
                            {studyData.selectedExamBoard}
                          </h3>
                          <p className="text-gray-600 text-lg">
                            Choose your study materials and resources
                          </p>
                        </div>
                        {/* Access Status Badge */}
                        {studyData.accessStatus && (
                          <div
                            className={`px-4 py-2 text-center rounded-full text-sm font-semibold ${
                              studyData.accessStatus.hasAccess
                                ? "bg-green-100 text-green-800"
                                : studyData.accessStatus.pendingRequest
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {studyData.accessStatus.hasAccess
                              ? "✓ Access Granted"
                              : studyData.accessStatus.pendingRequest
                              ? " Pending Approval"
                              : "Request Access Required"}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Access Request Section (if no access) */}
                    {!studyData.accessStatus?.hasAccess &&
                      !studyData.accessStatus?.pendingRequest && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
                          <div className="text-center">
                            <h4 className="text-xl font-bold text-blue-900 mb-3">
                              Request Course Access
                            </h4>
                            <p className="text-blue-700 mb-4">
                              You need admin approval to access study materials
                              for{" "}
                              <strong>
                                {studyData.selectedSubject?.subject?.name}
                              </strong>{" "}
                              with{" "}
                              <strong>{studyData.selectedExamBoard}</strong>.
                            </p>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-left">
                              <div className="flex items-start">
                                <svg
                                  className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <div>
                                  <p className="text-yellow-800 font-medium text-sm">
                                    Pro Tip: Write a detailed request
                                  </p>
                                  <p className="text-yellow-700 text-sm mt-1">
                                    Include your goals, study timeline, and why
                                    you need access. Detailed requests are
                                    processed faster and have higher approval
                                    rates.
                                  </p>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={handleOpenAccessModal}
                              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 font-semibold"
                            >
                              Request Access
                            </button>
                          </div>
                        </div>
                      )}

                    {/* Show resources if available and access granted */}
                    {studyData.accessStatus?.hasAccess &&
                    studyData.resources.length > 0 ? (
                      <>
                        {/* Enhanced Resources Grid - Only show available resources */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                          {studyData.resources.map((resource, index) => (
                            <ResourceCard
                              key={index}
                              resource={resource}
                              courseId={studyData.selectedCourse._id}
                              subjectId={studyData.selectedSubject.subject._id}
                              examBoard={studyData.selectedExamBoard}
                              resourceType={getResourceTypeFromApi(
                                resource.type
                              )}
                              hasAccess={studyData.accessStatus?.hasAccess}
                            />
                          ))}
                        </div>

                        {/* Additional Information Section */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6">
                          <div className="text-center">
                            <h4 className="text-xl font-bold text-green-900 mb-3">
                              Available Study Resources
                            </h4>
                            <p className="text-green-700">
                              You have access to {studyData.resources.length}{" "}
                              type(s) of study materials for{" "}
                              <strong>
                                {studyData.selectedSubject?.subject?.name}
                              </strong>{" "}
                              with{" "}
                              <strong>{studyData.selectedExamBoard}</strong>.
                            </p>
                          </div>
                        </div>
                      </>
                    ) : studyData.accessStatus?.hasAccess &&
                      studyData.resources.length === 0 ? (
                      <>
                        {/* Success Message for Resources in Progress */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                              <svg
                                className="w-6 h-6 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-green-800 mb-1">
                                Great News! Resources Are Coming Soon
                              </h4>
                              <p className="text-green-700">
                                Our educational team is actively developing
                                comprehensive study materials for{" "}
                                <strong>
                                  {studyData.selectedSubject?.subject?.name}
                                </strong>{" "}
                                with{" "}
                                <strong>{studyData.selectedExamBoard}</strong>.
                                Check back regularly for updates!
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* What to Expect Section */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
                          <div className="text-center">
                            <h4 className="text-xl font-bold text-blue-900 mb-3">
                              What to Expect Soon
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                              <div className="text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                  <svg
                                    className="w-8 h-8 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                  </svg>
                                </div>
                                <h5 className="font-semibold text-blue-800 mb-1">
                                  Exam Questions
                                </h5>
                                <p className="text-blue-700 text-sm">
                                  Interactive practice questions with detailed
                                  solutions
                                </p>
                              </div>
                              <div className="text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                  <svg
                                    className="w-8 h-8 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                  </svg>
                                </div>
                                <h5 className="font-semibold text-green-800 mb-1">
                                  Revision Notes
                                </h5>
                                <p className="text-green-700 text-sm">
                                  Comprehensive topic summaries and key concepts
                                </p>
                              </div>
                              <div className="text-center">
                                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                  <svg
                                    className="w-8 h-8 text-purple-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                  </svg>
                                </div>
                                <h5 className="font-semibold text-purple-800 mb-1">
                                  Past Papers
                                </h5>
                                <p className="text-purple-700 text-sm">
                                  Real exam papers with mark schemes and
                                  solutions
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      studyData.accessStatus?.pendingRequest && (
                        /* Pending Request Message */
                        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-2xl p-6">
                          <div className="text-center">
                            <h4 className="text-xl font-bold text-yellow-900 mb-3">
                              Access Request Pending
                            </h4>
                            <p className="text-yellow-700">
                              Your access request for{" "}
                              <strong>
                                {studyData.selectedSubject?.subject?.name}
                              </strong>{" "}
                              with{" "}
                              <strong>{studyData.selectedExamBoard}</strong> is
                              under review. You'll be able to access the study
                              materials once approved.
                            </p>
                          </div>
                        </div>
                      )
                    )}

                    {/* Navigation Options */}
                    <div className="flex justify-center space-x-4 pt-6">
                      <button
                        onClick={handleBack}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 font-semibold"
                      >
                        Back to Exam Boards
                      </button>
                      <button
                        onClick={handleReset}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold"
                      >
                        Choose Different Course
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Access Request Modal */}
      {showAccessModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Request Course Access
                </h3>
                <button
                  onClick={handleCloseAccessModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isSubmitting}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Course Details
                  </h4>
                  <p className="text-blue-800 text-sm">
                    <strong>Course:</strong> {studyData.selectedCourse?.name}
                  </p>
                  <p className="text-blue-800 text-sm">
                    <strong>Subject:</strong>{" "}
                    {studyData.selectedSubject?.subject?.name}
                  </p>
                  <p className="text-blue-800 text-sm">
                    <strong>Exam Board:</strong> {studyData.selectedExamBoard}
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <p className="text-yellow-800 font-medium text-sm mb-1">
                        Increase Your Approval Chances
                      </p>
                      <p className="text-yellow-700 text-xs">
                        Please provide a clear and detailed message outlining
                        your educational goals, study timeline, and reasons for
                        requesting access to these materials. Also include your
                        preferred contact information (such as email or phone
                        number) so we can reach out if needed. Your personal
                        details will remain confidential and will only be used
                        for communication related to your request.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="reviewNotes"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Your Message to Admin *
                  </label>
                  <textarea
                    id="reviewNotes"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Please describe your educational goals, study timeline, and why you need access to these materials. Detailed requests are processed faster..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={6}
                    disabled={isSubmitting}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Minimum 20 characters required</span>
                    <span>{reviewNotes.length}/500</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleCloseAccessModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestAccess}
                  disabled={isSubmitting || reviewNotes.trim().length < 20}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ResourceCard component remains the same as before
const ResourceCard = ({
  resource,
  courseId,
  subjectId,
  examBoard,
  resourceType,
  hasAccess,
}) => {
  const handleResourceClick = () => {
    if (!hasAccess) {
      return;
    }

    const encodedExamBoard = encodeURIComponent(examBoard);
    const routes = {
      "exam-questions": `/students/study/exam-questions/${courseId}/${subjectId}/${encodedExamBoard}`,
      "revision-notes": `/students/study/revision-notes/${courseId}/${subjectId}/${encodedExamBoard}`,
      "past-papers": `/students/study/past-papers/${courseId}/${subjectId}/${encodedExamBoard}`,
    };

    const resourceUrl = routes[resourceType] || routes["exam-questions"];
    window.location.href = resourceUrl;
  };

  // Get resource-specific icons and descriptions
  const getResourceConfig = (type) => {
    const config = {
      "exam-questions": {
        icon: (
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        ),
        gradient: "from-orange-500 to-orange-600",
        bgGradient: "from-orange-100 to-orange-50",
        border: "border-orange-200",
        text: "text-orange-600",
        badge: "bg-orange-100 text-orange-800",
      },
      "revision-notes": {
        icon: (
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        ),
        gradient: "from-blue-500 to-blue-600",
        bgGradient: "from-blue-100 to-blue-50",
        border: "border-blue-200",
        text: "text-blue-600",
        badge: "bg-blue-100 text-blue-800",
      },
      "past-papers": {
        icon: (
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        ),
        gradient: "from-green-500 to-green-600",
        bgGradient: "from-green-100 to-green-50",
        border: "border-green-200",
        text: "text-green-600",
        badge: "bg-green-100 text-green-800",
      },
    };

    return config[type] || config["exam-questions"];
  };

  const config = getResourceConfig(resourceType);
  const displayName = resource.name || "Study Resource";
  const itemCount = resource.count || 0;

  return (
    <div
      onClick={handleResourceClick}
      className={`group cursor-pointer bg-gradient-to-br from-white ${
        config.bgGradient
      } border-2 ${
        hasAccess ? "border-gray-200 hover:" + config.border : "border-gray-300"
      } rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
        !hasAccess ? "opacity-75 cursor-not-allowed" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-6">
        <div
          className={`w-16 h-16 bg-gradient-to-br ${
            hasAccess ? config.gradient : "from-gray-400 to-gray-500"
          } rounded-2xl flex items-center justify-center group-hover:${
            hasAccess
              ? config.gradient.replace("500", "600").replace("600", "700")
              : "from-gray-500 to-gray-600"
          } transition-all duration-300 shadow-lg`}
        >
          {config.icon}
        </div>
        <span
          className={`inline-flex items-center px-4 py-2 ${
            hasAccess ? config.badge : "bg-gray-100 text-gray-800"
          } text-sm font-semibold rounded-full`}
        >
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
      </div>
      <h3
        className={`text-2xl font-bold ${
          hasAccess ? "text-gray-900" : "text-gray-600"
        } group-hover:${
          hasAccess ? config.text : "text-gray-700"
        } transition-colors duration-300 mb-4 leading-tight`}
      >
        {displayName}
        {hasAccess && (
          <span className="ml-2 text-sm text-green-600 font-normal">
            ✓ Access
          </span>
        )}
      </h3>
      <p className="text-gray-600 text-lg leading-relaxed mb-6">
        {resource.description ||
          `Comprehensive ${displayName.toLowerCase()} for ${examBoard}`}
      </p>
      <div
        className={`flex items-center ${
          hasAccess ? config.text : "text-gray-500"
        } font-semibold text-lg`}
      >
        {hasAccess ? (
          <>
            Explore Resources
            <svg
              className="w-5 h-5 ml-2 transform group-hover:translate-x-2 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </>
        ) : (
          <>
            Access Required
            <svg
              className="w-5 h-5 ml-2 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </>
        )}
      </div>
    </div>
  );
};

export default StudyInterface;
