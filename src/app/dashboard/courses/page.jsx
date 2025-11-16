// pages/courses/CoursesPage.js
"use client";
import React, { useState, useEffect } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import {
  BookOpen,
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  Users,
  FileText,
  BarChart3,
  Calendar,
  X,
} from "lucide-react";
import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getSubjects,
} from "../../../api/course.api";
import Swal from "sweetalert2";
import Link from "next/link";

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [filterLevel, setFilterLevel] = useState("");

  const [courseForm, setCourseForm] = useState({
    name: "",
    description: "",
    level: "",
    thumbnail: "",
    subjectExamBoards: [], // Array of { subject: '', subjectName: '', examBoards: [] }
  });

  const examBoards = [
    "AQA",
    "Edexcel",
    "OCR",
    "WJEC",
    "Cambridge (CIE)",
    "WJEC Eduqas",
    "Edexcel International",
    "Oxford AQA",
    "Other",
  ];

  const levels = [
    "Primary",
    "Secondary",
    "IGCSE",
    "O-Level",
    "AS-Level",
    "A-Level",
    "IB Middle Years",
    "IB Diploma",
    "Undergraduate - Year 1",
    "Undergraduate - Year 2",
    "Undergraduate - Year 3",
    "Undergraduate - Year 4",
    "Other",
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesRes, subjectsRes] = await Promise.all([
        getCourses(),
        getSubjects(),
      ]);

      if (coursesRes.data.success) {
        setCourses(coursesRes.data.data);
      }
      if (subjectsRes.data.success) {
        setSubjects(subjectsRes.data.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch data",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = !filterLevel || course.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  // Calculate total subjects and exam boards for stats
  const getCourseStats = (course) => {
    const totalSubjects = course.subjectExamBoards?.length || 0;
    const totalExamBoards = new Set(
      course.subjectExamBoards?.flatMap((seb) => seb.examBoards) || []
    ).size;

    return { totalSubjects, totalExamBoards };
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      // Validate that at least one subject with exam boards is selected
      if (courseForm.subjectExamBoards.length === 0) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Please add at least one subject with exam boards",
        });
        return;
      }

      // Validate that each subject has at least one exam board
      const invalidSubjects = courseForm.subjectExamBoards.filter(
        (seb) => seb.examBoards.length === 0
      );

      if (invalidSubjects.length > 0) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Each subject must have at least one exam board selected",
        });
        return;
      }

      const response = await createCourse(courseForm);
      if (response.data.success) {
        await fetchData();
        setShowCreateModal(false);
        resetCourseForm();
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Course created successfully",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Error creating course:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to create course",
      });
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      if (courseForm.subjectExamBoards.length === 0) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Please add at least one subject with exam boards",
        });
        return;
      }

      // Validate that each subject has at least one exam board
      const invalidSubjects = courseForm.subjectExamBoards.filter(
        (seb) => seb.examBoards.length === 0
      );

      if (invalidSubjects.length > 0) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Each subject must have at least one exam board selected",
        });
        return;
      }

      const response = await updateCourse(selectedCourse._id, courseForm);
      if (response.data.success) {
        await fetchData();
        setShowEditModal(false);
        resetCourseForm();
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Course updated successfully",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Error updating course:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update course",
      });
    }
  };

  const handleDeleteCourse = async (courseId, courseName) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `This will permanently delete "${courseName}" and all its resources`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteCourse(courseId);
        await fetchData();
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Course deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting course:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete course",
        });
      }
    }
  };

  const resetCourseForm = () => {
    setCourseForm({
      name: "",
      description: "",
      level: "",
      thumbnail: "",
      subjectExamBoards: [],
    });
    setSelectedCourse(null);
  };

  const openEditModal = (course) => {
    setSelectedCourse(course);
    setCourseForm({
      name: course.name,
      description: course.description,
      level: course.level,
      thumbnail: course.thumbnail || "",
      subjectExamBoards:
        course.subjectExamBoards?.map((seb) => ({
          subject: seb.subject._id || seb.subject,
          subjectName: seb.subject.name || seb.subjectName,
          examBoards: seb.examBoards || [],
        })) || [],
    });
    setShowEditModal(true);
  };

  // Add a new subject with exam boards
  const addSubjectWithExamBoards = (subjectId) => {
    if (courseForm.subjectExamBoards.find((seb) => seb.subject === subjectId)) {
      Swal.fire({
        icon: "warning",
        title: "Subject Already Added",
        text: "This subject is already in the course",
      });
      return;
    }

    const subject = subjects.find((s) => s._id === subjectId);
    setCourseForm((prev) => ({
      ...prev,
      subjectExamBoards: [
        ...prev.subjectExamBoards,
        {
          subject: subjectId,
          subjectName: subject.name,
          examBoards: [],
        },
      ],
    }));
  };

  // Remove a subject
  const removeSubject = (subjectId) => {
    setCourseForm((prev) => ({
      ...prev,
      subjectExamBoards: prev.subjectExamBoards.filter(
        (seb) => seb.subject !== subjectId
      ),
    }));
  };

  // Toggle exam board for a subject
  const toggleExamBoard = (subjectId, examBoard) => {
    setCourseForm((prev) => ({
      ...prev,
      subjectExamBoards: prev.subjectExamBoards.map((seb) => {
        if (seb.subject === subjectId) {
          const currentBoards = seb.examBoards;
          if (currentBoards.includes(examBoard)) {
            return {
              ...seb,
              examBoards: currentBoards.filter((b) => b !== examBoard),
            };
          } else {
            return {
              ...seb,
              examBoards: [...currentBoards, examBoard],
            };
          }
        }
        return seb;
      }),
    }));
  };

  // Get available subjects (not already added)
  const getAvailableSubjects = () => {
    const addedSubjectIds = courseForm.subjectExamBoards.map(
      (seb) => seb.subject
    );
    return subjects.filter((subject) => !addedSubjectIds.includes(subject._id));
  };

  // Get subject name for display
  const getSubjectName = (subjectExamBoard) => {
    if (typeof subjectExamBoard.subject === "object") {
      return subjectExamBoard.subject.name;
    }
    return subjectExamBoard.subjectName || "Loading...";
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

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Courses Management
            </h1>
            <p className="text-gray-600 mt-2">
              Create and manage educational courses with subjects and resources
            </p>
          </div>
          <button
            onClick={() => {
              resetCourseForm();
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25"
          >
            <Plus size={20} />
            Create New Course
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Courses
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {courses.length}
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
                <p className="text-sm font-medium text-gray-600">
                  Total Subjects
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {subjects.length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Users className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Courses
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {courses.filter((c) => c.isActive !== false).length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <BarChart3 className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Exam Boards</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {
                    [
                      ...new Set(
                        courses.flatMap(
                          (c) =>
                            c.subjectExamBoards?.flatMap(
                              (seb) => seb.examBoards
                            ) || []
                        )
                      ),
                    ].length
                  }
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <Calendar className="text-orange-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search courses by name or description..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="lg:w-64 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
            >
              <option value="">All Levels</option>
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No courses found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterLevel
                  ? "Try adjusting your search criteria"
                  : "Get started by creating your first course"}
              </p>
              {!searchTerm && !filterLevel && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Create Course
                </button>
              )}
            </div>
          ) : (
            filteredCourses.map((course) => {
              const stats = getCourseStats(course);
              return (
                <div
                  key={course._id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden group"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                          <BookOpen className="text-blue-600" size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                            {course.name}
                          </h3>
                          <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full mt-1">
                            {course.level}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="space-y-3 mb-4">
                      <div className="text-sm text-gray-600">
                        <strong>{stats.totalSubjects}</strong> subjects •{" "}
                        <strong>{stats.totalExamBoards}</strong> exam boards
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {course.subjectExamBoards
                          ?.slice(0, 3)
                          .map((seb, index) => (
                            <span
                              key={index}
                              className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full"
                            >
                              {getSubjectName(seb)}
                            </span>
                          ))}
                        {course.subjectExamBoards?.length > 3 && (
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                            +{course.subjectExamBoards.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-sm text-gray-500">
                        {stats.totalSubjects} subjects
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/courses/${course._id}`}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          Manage
                          <ChevronRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openEditModal(course)}
                        className="text-gray-500 hover:text-blue-600 transition-colors p-1"
                        title="Edit Course"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteCourse(course._id, course.name)
                        }
                        className="text-gray-500 hover:text-red-600 transition-colors p-1"
                        title="Delete Course"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="text-xs text-gray-500">
                      Created {new Date(course.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Create/Edit Course Modal */}
        {(showCreateModal || showEditModal) && (
          <CourseModal
            title={showCreateModal ? "Create New Course" : "Edit Course"}
            formData={courseForm}
            setFormData={setCourseForm}
            onSubmit={showCreateModal ? handleCreateCourse : handleUpdateCourse}
            onClose={() => {
              setShowCreateModal(false);
              setShowEditModal(false);
              resetCourseForm();
            }}
            subjects={subjects}
            examBoards={examBoards}
            levels={levels}
            isEdit={showEditModal}
            // New functions for subject-exam board management
            addSubjectWithExamBoards={addSubjectWithExamBoards}
            removeSubject={removeSubject}
            toggleExamBoard={toggleExamBoard}
            getAvailableSubjects={getAvailableSubjects}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

// Enhanced Course Modal Component with Subject-Exam Board Management
const CourseModal = ({
  title,
  formData,
  setFormData,
  onSubmit,
  onClose,
  subjects,
  examBoards,
  levels,
  isEdit = false,
  addSubjectWithExamBoards,
  removeSubject,
  toggleExamBoard,
  getAvailableSubjects,
}) => {
  const [subjectSearch, setSubjectSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const filteredSubjects = getAvailableSubjects().filter(
    (subject) =>
      subject.name.toLowerCase().includes(subjectSearch.toLowerCase()) ||
      subject.category.toLowerCase().includes(subjectSearch.toLowerCase())
  );

  const handleAddSubject = () => {
    if (selectedSubject) {
      addSubjectWithExamBoards(selectedSubject);
      setSelectedSubject("");
      setSubjectSearch("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white sticky top-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {isEdit
                ? "Update course information"
                : "Fill in the course details"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={onSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., GCSE Mathematics, A-Level Physics"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Level *
                  </label>
                  <select
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={formData.level}
                    onChange={(e) =>
                      setFormData({ ...formData, level: e.target.value })
                    }
                  >
                    <option value="">Select Education Level</option>
                    {levels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe the course content, objectives, and target audience..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thumbnail URL (Optional)
                  </label>
                  <input
                    type="url"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={formData.thumbnail}
                    onChange={(e) =>
                      setFormData({ ...formData, thumbnail: e.target.value })
                    }
                    placeholder="https://example.com/course-image.jpg"
                  />
                </div>
              </div>

              {/* Right Column - Subjects & Exam Boards */}
              <div className="space-y-6">
                {/* Add Subject Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Add Subjects *
                  </label>
                  <div className="border border-gray-300 rounded-xl overflow-hidden">
                    <div className="p-3 border-b border-gray-200 bg-gray-50">
                      <div className="relative">
                        <Search
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={16}
                        />
                        <input
                          type="text"
                          placeholder="Search subjects to add..."
                          className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                          value={subjectSearch}
                          onChange={(e) => setSubjectSearch(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="max-h-32 overflow-y-auto">
                      {filteredSubjects.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          {subjectSearch
                            ? "No subjects found"
                            : "No subjects available to add"}
                        </div>
                      ) : (
                        filteredSubjects.map((subject) => (
                          <div
                            key={subject._id}
                            className={`flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                              selectedSubject === subject._id
                                ? "bg-blue-50 border-blue-200"
                                : ""
                            }`}
                            onClick={() => setSelectedSubject(subject._id)}
                          >
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 text-sm">
                                {subject.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {subject.category} • {subject.level}
                              </div>
                            </div>
                            <div
                              className={`w-5 h-5 border-2 rounded ${
                                selectedSubject === subject._id
                                  ? "bg-blue-600 border-blue-600"
                                  : "border-gray-300"
                              }`}
                            >
                              {selectedSubject === subject._id && (
                                <div className="w-full h-full flex items-center justify-center text-white text-xs">
                                  ✓
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSubject}
                    disabled={!selectedSubject}
                    className="w-full mt-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    Add Selected Subject
                  </button>
                </div>

                {/* Selected Subjects with Exam Boards */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Selected Subjects & Exam Boards
                  </label>
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {formData.subjectExamBoards.length === 0 ? (
                      <div className="text-center text-gray-500 text-sm py-4">
                        No subjects added yet
                      </div>
                    ) : (
                      formData.subjectExamBoards.map((seb) => {
                        const subject = subjects.find(
                          (s) => s._id === seb.subject
                        );
                        return (
                          <div
                            key={seb.subject}
                            className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="font-medium text-gray-900 text-sm">
                                  {subject?.name || seb.subjectName}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  {subject?.category} • {subject?.level}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeSubject(seb.subject)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                              >
                                <X size={16} />
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              {examBoards.map((board) => (
                                <div
                                  key={board}
                                  className={`flex items-center p-2 border rounded-lg cursor-pointer transition-all text-sm ${
                                    seb.examBoards.includes(board)
                                      ? "border-blue-500 bg-blue-50 text-blue-700"
                                      : "border-gray-300 hover:border-gray-400"
                                  }`}
                                  onClick={() =>
                                    toggleExamBoard(seb.subject, board)
                                  }
                                >
                                  <div
                                    className={`w-4 h-4 border-2 rounded mr-2 ${
                                      seb.examBoards.includes(board)
                                        ? "bg-blue-500 border-blue-500"
                                        : "border-gray-400"
                                    }`}
                                  >
                                    {seb.examBoards.includes(board) && (
                                      <div className="w-full h-full flex items-center justify-center text-white text-xs">
                                        ✓
                                      </div>
                                    )}
                                  </div>
                                  <span className="font-medium">{board}</span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                              {seb.examBoards.length} exam board(s) selected
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-500/25"
              >
                {isEdit ? "Update Course" : "Create Course"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
