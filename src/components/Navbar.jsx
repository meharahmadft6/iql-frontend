"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  getCourses,
  getStudyNavigation,
  getSubjectResourcesPublic,
} from "../api/course.api";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [studySidebarOpen, setStudySidebarOpen] = useState(false);
  const [studyData, setStudyData] = useState({
    courses: [],
    currentView: "courses",
    selectedCourse: null,
    selectedSubject: null,
    selectedExamBoard: null,
    resources: [],
    loading: false,
    error: null,
  });

  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleDropdown = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  // Fetch courses data
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
        error: "Failed to load courses",
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
        }));
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setStudyData((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to load subjects",
      }));
    }
  };

  // Fetch exam boards for subject
  const fetchExamBoards = async (courseId, subjectId) => {
    setStudyData((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await getStudyNavigation({ courseId, subjectId });
      if (response.data.success) {
        setStudyData((prev) => ({
          ...prev,
          examBoards: response.data.data.examBoards,
          loading: false,
        }));
      }
    } catch (error) {
      console.error("Error fetching exam boards:", error);
      setStudyData((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to load exam boards",
      }));
    }
  };

  // Fetch resources for exam board - FIXED with proper error handling
  const fetchResources = async (courseId, subjectId, examBoard) => {
    setStudyData((prev) => ({
      ...prev,
      loading: true,
      error: null,
      resources: [],
    }));
    try {
      const response = await getSubjectResourcesPublic(
        courseId,
        subjectId,
        examBoard
      );
      if (response.data.success) {
        setStudyData((prev) => ({
          ...prev,
          resources: response.data.data.resources || [],
          loading: false,
          error: null,
        }));
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
      // Handle 404 and other errors gracefully
      if (error.response && error.response.status === 404) {
        setStudyData((prev) => ({
          ...prev,
          resources: [],
          loading: false,
        }));
      } else {
        setStudyData((prev) => ({
          ...prev,
          resources: [],
          loading: false,
          error: "Failed to load resources",
        }));
      }
    }
  };

  // Open study sidebar and fetch data
  const openStudySidebar = () => {
    setStudySidebarOpen(true);
    setSidebarExpanded(false);
    fetchCourses();
  };

  // Navigation handlers for study sidebar
  const handleCourseSelect = (course) => {
    setStudyData((prev) => ({
      ...prev,
      currentView: "subjects",
      selectedCourse: course,
      selectedSubject: null,
      selectedExamBoard: null,
      resources: [],
      error: null,
    }));
  };

  const handleSubjectSelect = (subjectExam) => {
    setStudyData((prev) => ({
      ...prev,
      currentView: "examBoards",
      selectedSubject: subjectExam,
      selectedExamBoard: null,
      resources: [],
      error: null,
    }));
    // Expand sidebar when subject is selected
    setSidebarExpanded(true);
  };

  const handleExamBoardSelect = async (examBoard) => {
    setStudyData((prev) => ({
      ...prev,
      currentView: "resources",
      selectedExamBoard: examBoard,
      loading: true,
      resources: [], // Clear previous resources immediately
      error: null,
    }));

    await fetchResources(
      studyData.selectedCourse._id,
      studyData.selectedSubject.subject._id,
      examBoard
    );
  };

  const handleBackToCourses = () => {
    setStudyData((prev) => ({
      ...prev,
      currentView: "courses",
      selectedCourse: null,
      selectedSubject: null,
      selectedExamBoard: null,
      resources: [],
      error: null,
    }));
    setSidebarExpanded(false);
  };

  const handleBackToSubjects = () => {
    setStudyData((prev) => ({
      ...prev,
      currentView: "subjects",
      selectedSubject: null,
      selectedExamBoard: null,
      resources: [],
      error: null,
    }));
    setSidebarExpanded(false);
  };

  const handleBackToExamBoards = () => {
    setStudyData((prev) => ({
      ...prev,
      currentView: "examBoards",
      selectedExamBoard: null,
      resources: [],
      error: null,
    }));
  };

  // Reset study data when sidebar closes
  const closeStudySidebar = () => {
    setStudySidebarOpen(false);
    setSidebarExpanded(false);
    setTimeout(() => {
      setStudyData({
        courses: [],
        currentView: "courses",
        selectedCourse: null,
        selectedSubject: null,
        selectedExamBoard: null,
        resources: [],
        loading: false,
        error: null,
      });
    }, 300);
  };

  return (
    <nav className="w-full bg-white font-poppins relative border-b border-gray-200">
      <div className="mx-auto bg-white px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 z-50">
          <Image
            src="/infinity.jpg"
            alt="Infinity Logo"
            width={70}
            height={70}
            className="rounded-lg"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-1 justify-center-safe relative">
          {/* Centered Links */}
          <div className="flex items-center space-x-8">
            {[
              {
                name: "Start Studying",
                href: "#",
                onClick: openStudySidebar,
              },
              {
                name: "Find Tutors",
                dropdown: [
                  { name: "Request a tutor", href: "/request-a-teacher" },
                  { name: "All Tutors", href: "/tutors" },
                  { name: "Online Tutors", href: "/tutors/online-tutors" },
                  { name: "Home Tutors", href: "/tutors/home-tutors" },
                ],
              },
              {
                name: "Find Tutor Jobs",
                dropdown: [
                  { name: "All Tutor Jobs", href: "/teaching-jobs" },
                  { name: "Home Tutor Jobs", href: "/teaching-jobs/home" },
                  {
                    name: "Online Tutor Jobs",
                    href: "/teaching-jobs/online-jobs",
                  },
                  {
                    name: "Assignment Tutor Jobs",
                    href: "/teaching-jobs/assignment-jobs",
                  },
                ],
              },
              { name: "Contact Us", href: "/contactus" },
            ].map((item) => (
              <div key={item.name} className="relative group">
                {item.href && !item.dropdown ? (
                  <button
                    onClick={item.onClick}
                    className="relative text-[15px] font-medium text-gray-700 hover:text-blue-600 transition-all duration-300 group"
                  >
                    <span className="relative z-10 block py-2">
                      {item.name}
                    </span>
                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                  </button>
                ) : item.href ? (
                  <Link
                    href={item.href}
                    className="relative text-[15px] font-medium text-gray-700 hover:text-blue-600 transition-all duration-300 group"
                  >
                    <span className="relative z-10 block py-2">
                      {item.name}
                    </span>
                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() => toggleDropdown(item.name)}
                      className="relative text-[15px] font-medium text-gray-700 hover:text-blue-600 transition-all duration-300 group flex items-center"
                    >
                      <span className="relative z-10 block py-2">
                        {item.name}
                      </span>
                      <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                      <svg
                        className="ml-1 h-4 w-4 transition-transform duration-200"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {openDropdown === item.name && (
                      <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-50 border border-gray-100 py-2">
                        {item.dropdown?.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center space-x-3">
            <Link
              href="/login"
              className="px-5 py-2 text-blue-600 font-medium rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors duration-300"
            >
              Login
            </Link>

            <Link
              href="/request-a-teacher"
              className="px-5 py-2 rounded-lg text-center bg-green-600 text-white font-medium hover:bg-green-700 transition-colors duration-300"
            >
              Request a tutor
            </Link>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center space-x-3">
          <button
            onClick={openStudySidebar}
            className="text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            aria-label="Start studying"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </button>
          <button
            onClick={toggleMobileMenu}
            className="text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  isMobileMenuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
            <button
              onClick={toggleMobileMenu}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              aria-label="Close menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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

          <div className="flex flex-col p-6 space-y-1">
            {[
              { name: "Start Studying", href: "#", onClick: openStudySidebar },
              { name: "Our Story", href: "/ourstory" },
              { name: "Services", href: "/services" },
              {
                name: "Find Tutors",
                dropdown: [
                  { name: "All Tutors", href: "/tutors/all" },
                  { name: "Online Tutors", href: "/tutors/online" },
                  { name: "Home Tutors", href: "/tutors/home" },
                ],
              },
              {
                name: "Find Tutor Jobs",
                dropdown: [
                  { name: "All Tutor Jobs", href: "/jobs/all" },
                  { name: "Online Tutor Jobs", href: "/jobs/online" },
                  { name: "Home Tutor Jobs", href: "/jobs/home" },
                ],
              },
              { name: "Research", href: "/research" },
              { name: "Contact Us", href: "/contactus" },
            ].map((item) => (
              <div
                key={item.name}
                className="border-b border-gray-100 last:border-b-0"
              >
                {item.href && !item.dropdown ? (
                  <button
                    onClick={() => {
                      if (item.onClick) item.onClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-4 text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                  >
                    {item.name}
                  </button>
                ) : item.href ? (
                  <Link
                    href={item.href}
                    className="block py-4 text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ) : (
                  <div className="py-4">
                    <button
                      onClick={() => toggleDropdown(item.name)}
                      className="flex items-center justify-between w-full text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                    >
                      {item.name}
                      <svg
                        className={`h-4 w-4 transform transition-transform duration-200 ${
                          openDropdown === item.name ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {openDropdown === item.name && (
                      <div className="pl-4 mt-3 space-y-2">
                        {item.dropdown?.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className="block py-2 text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            <div className="flex flex-col space-y-3 pt-6">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full px-4 py-3 text-center text-blue-600 font-medium rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors duration-200"
              >
                Login
              </Link>
              <Link
                href="/signup"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full px-4 py-3 text-center bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Sign Up
              </Link>
              <Link
                href="/request-a-teacher"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full px-4 py-3 text-center bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                Request a tutor
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Study Sidebar - Collapsible/Expandable */}
      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-2xl z-50 transform transition-all duration-300 ease-in-out ${
          studySidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${sidebarExpanded ? "w-full md:w-[800px]" : "w-full md:w-96"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {studyData.currentView === "courses" && "Browse Courses"}
              {studyData.currentView === "subjects" &&
                studyData.selectedCourse?.name}
              {studyData.currentView === "examBoards" &&
                `${studyData.selectedSubject?.subject?.name}`}
              {studyData.currentView === "resources" &&
                `${studyData.selectedExamBoard} - Resources`}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {studyData.currentView === "courses" &&
                "Select a course to begin"}
              {studyData.currentView === "subjects" &&
                "Choose a subject to continue"}
              {studyData.currentView === "examBoards" &&
                "Select your exam board"}
              {studyData.currentView === "resources" &&
                "Available study materials"}
            </p>
          </div>
          <button
            onClick={closeStudySidebar}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
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

        <div className="h-full overflow-y-auto bg-white">
          {studyData.loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="flex flex-col items-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-600">Loading...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Error Message */}
              {studyData.error && (
                <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-red-400 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-sm text-red-700">{studyData.error}</p>
                  </div>
                </div>
              )}

              {/* Back Navigation */}
              {studyData.currentView !== "courses" && (
                <div className="border-b border-gray-200 bg-gray-50">
                  <button
                    onClick={() => {
                      if (studyData.currentView === "subjects")
                        handleBackToCourses();
                      else if (studyData.currentView === "examBoards")
                        handleBackToSubjects();
                      else if (studyData.currentView === "resources")
                        handleBackToExamBoards();
                    }}
                    className="flex items-center px-6 py-4 text-sm text-blue-600 hover:bg-blue-50 w-full text-left transition-colors duration-200"
                  >
                    <svg
                      className="h-4 w-4 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Back to{" "}
                    {studyData.currentView === "subjects"
                      ? "All Courses"
                      : studyData.currentView === "examBoards"
                      ? studyData.selectedCourse?.name
                      : "Exam Boards"}
                  </button>
                </div>
              )}

              {/* Main Content Area */}
              <div className="flex flex-col md:flex-row h-full">
                {/* Left Panel - Always visible */}
                <div
                  className={`${
                    sidebarExpanded ? "md:w-1/3" : "w-full"
                  } border-r border-gray-200`}
                >
                  {/* Courses View */}
                  {studyData.currentView === "courses" && (
                    <div className="p-6">
                      <div className="space-y-3">
                        {studyData.courses.map((course) => (
                          <button
                            key={course._id}
                            onClick={() => handleCourseSelect(course)}
                            className="w-full text-left p-4 rounded-lg bg-white border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200 group"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                                  {course.name}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                  {course.subjectExamBoards?.length || 0}{" "}
                                  subjects available
                                </p>
                              </div>
                              <svg
                                className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors duration-200"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Subjects View */}
                  {studyData.currentView === "subjects" &&
                    studyData.selectedCourse && (
                      <div className="p-6">
                        <div className="space-y-3">
                          {studyData.selectedCourse.subjectExamBoards?.map(
                            (subjectExam, index) => (
                              <button
                                key={index}
                                onClick={() => handleSubjectSelect(subjectExam)}
                                className={`w-full text-left p-4 rounded-lg border transition-all duration-200 group ${
                                  studyData.selectedSubject?.subject?._id ===
                                  subjectExam.subject?._id
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:border-blue-300 hover:shadow-sm bg-white"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3
                                      className={`font-semibold transition-colors duration-200 ${
                                        studyData.selectedSubject?.subject
                                          ?._id === subjectExam.subject?._id
                                          ? "text-blue-600"
                                          : "text-gray-900 group-hover:text-blue-600"
                                      }`}
                                    >
                                      {subjectExam.subject?.name ||
                                        `Subject ${index + 1}`}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {subjectExam.examBoards?.length || 0} exam
                                      boards
                                    </p>
                                  </div>
                                  <svg
                                    className={`h-5 w-5 transition-colors duration-200 ${
                                      studyData.selectedSubject?.subject
                                        ?._id === subjectExam.subject?._id
                                        ? "text-blue-600"
                                        : "text-gray-400 group-hover:text-blue-600"
                                    }`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 5l7 7-7 7"
                                    />
                                  </svg>
                                </div>
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Exam Boards View */}
                  {(studyData.currentView === "examBoards" ||
                    studyData.currentView === "resources") &&
                    studyData.selectedSubject && (
                      <div className="p-6">
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {studyData.selectedSubject.subject?.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Select your exam board
                          </p>
                        </div>
                        <div className="space-y-3">
                          {studyData.selectedSubject.examBoards?.map(
                            (examBoard, index) => (
                              <button
                                key={index}
                                onClick={() => handleExamBoardSelect(examBoard)}
                                className={`w-full text-left p-4 rounded-lg border transition-all duration-200 group ${
                                  studyData.selectedExamBoard === examBoard
                                    ? "border-green-500 bg-green-50"
                                    : "border-gray-200 hover:border-green-500 hover:shadow-sm bg-white"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3
                                      className={`font-semibold transition-colors duration-200 ${
                                        studyData.selectedExamBoard ===
                                        examBoard
                                          ? "text-green-600"
                                          : "text-gray-900 group-hover:text-green-600"
                                      }`}
                                    >
                                      {examBoard}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {studyData.selectedExamBoard === examBoard
                                        ? "Viewing resources"
                                        : "Click to view resources"}
                                    </p>
                                  </div>
                                  <svg
                                    className={`h-5 w-5 transition-colors duration-200 ${
                                      studyData.selectedExamBoard === examBoard
                                        ? "text-green-600"
                                        : "text-gray-400 group-hover:text-green-600"
                                    }`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 5l7 7-7 7"
                                    />
                                  </svg>
                                </div>
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>

                {/* Right Panel - Only shown when sidebar is expanded */}
                {sidebarExpanded &&
                  (studyData.currentView === "examBoards" ||
                    studyData.currentView === "resources") && (
                    <div className="md:w-2/3">
                      <div className="p-6">
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {studyData.selectedExamBoard || "Select Exam Board"}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {studyData.selectedExamBoard
                              ? `Available study materials for ${studyData.selectedSubject?.subject?.name}`
                              : "Choose an exam board to view resources"}
                          </p>
                        </div>

                        {studyData.currentView === "resources" &&
                        studyData.selectedExamBoard ? (
                          <div className="space-y-3">
                            {studyData.resources.length > 0 ? (
                              studyData.resources.map((resource, index) => (
                                <Link
                                  key={index}
                                  href={resource.href}
                                  onClick={closeStudySidebar}
                                  className="block p-4 rounded-lg bg-white border border-gray-200 hover:border-green-500 hover:shadow-sm transition-all duration-200 group"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors duration-200">
                                        {resource.name}
                                      </h3>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {resource.count}{" "}
                                        {resource.count === 1
                                          ? "item"
                                          : "items"}{" "}
                                        available
                                      </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-sm text-green-600 font-medium">
                                        View
                                      </span>
                                      <svg
                                        className="h-4 w-4 text-green-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
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
                                </Link>
                              ))
                            ) : (
                              <div className="text-center py-8">
                                <svg
                                  className="h-12 w-12 text-gray-300 mx-auto mb-3"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1}
                                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                  />
                                </svg>
                                <h3 className="text-base font-medium text-gray-900 mb-1">
                                  No Resources Available
                                </h3>
                                <p className="text-sm text-gray-500">
                                  Study materials for this exam board are coming
                                  soon.
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <svg
                              className="h-16 w-16 text-gray-300 mx-auto mb-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              Select an Exam Board
                            </h3>
                            <p className="text-sm text-gray-500">
                              Choose an exam board from the left panel to view
                              available study resources
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
