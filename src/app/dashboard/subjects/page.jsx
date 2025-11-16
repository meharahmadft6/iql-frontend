"use client";
import React, { useState, useEffect } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  X,
} from "lucide-react";
import {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../../../api/subject.api";
import Swal from "sweetalert2";

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    level: "",
  });
  const [isMobile, setIsMobile] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    level: "",
  });

  // Categories and levels from your schema
  const categories = [
    "School",
    "College",
    "University",
    "Skill",
    "Language",
    "Languages",
    "Vocational",
    "Professional",
    "Exam Preparation",
    "Hobby",
    "Sports",
    "Science",
    "Sciences",
    "Mathematics",
    "Science & Technology",
    "Technology",
    "Engineering",
    "Health",
    "Social Sciences",
    "Humanities",
    "Humanities & Social Sciences",
    "Arts",
    "Creative Arts",
    "Creative & Vocational",
    "Business",
    "Business & Economics",
    "Other",
  ];

  const levels = [
    "Beginner",
    "Intermediate",
    "Advanced",
    "Expert",
    "Proficiency",
    "Kindergarten",
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
    "Grade 7",
    "Grade 8",
    "Grade 9",
    "Grade 10",
    "Grade 11",
    "Grade 12",
    "Primary",
    "Secondary",
    "IGCSE",
    "GCSE",
    "igcse",
    "O-Level",
    "AS-Level",
    "A-Level",
    "IB Middle Years",
    "IB Diploma",
    "Certificate",
    "Diploma",
    "Associate",
    "Bachelor's",
    "Master's",
    "PhD",
    "Postdoctoral",
    "Undergraduate - Year 1",
    "Undergraduate - Year 2",
    "Undergraduate - Year 3",
    "Undergraduate - Year 4",
    "Postgraduate - Year 1",
    "Postgraduate - Year 2",
    "Entry Level",
    "Junior",
    "Mid-Level",
    "Senior",
    "Executive",
    "A1 (Beginner)",
    "A2 (Elementary)",
    "B1 (Intermediate)",
    "B2 (Upper-Intermediate)",
    "C1 (Advanced)",
    "C2 (Proficient)",
    "Introductory",
    "Foundation",
    "General",
    "Honors",
    "AP (Advanced Placement)",
    "Remedial",
    "Specialized",
    "Research",
    "Thesis",
    "Other",
  ];

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await getSubjects();
      if (response.data.success) {
        setSubjects(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch subjects",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.level.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      !filters.category ||
      subject.category.toLowerCase().includes(filters.category.toLowerCase());

    const matchesLevel =
      !filters.level ||
      subject.level.toLowerCase().includes(filters.level.toLowerCase());

    return matchesSearch && matchesCategory && matchesLevel;
  });

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      const response = await createSubject(formData);
      if (response.data.success) {
        await fetchSubjects();
        setShowCreateModal(false);
        setFormData({ name: "", category: "", level: "" });
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Subject created successfully",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Error creating subject:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to create subject",
      });
    }
  };

  const handleEditSubject = async (e) => {
    e.preventDefault();
    try {
      // You'll need to add updateSubject to your API
      const response = await updateSubject(selectedSubject._id, formData);
      if (response.data.success) {
        await fetchSubjects();
        setShowCreateModal(false);
        setFormData({ name: "", category: "", level: "" });
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Subject Updated successfully",
          timer: 2000,
          showConfirmButton: false,
        });
      }

      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating subject:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update subject",
      });
    }
  };

  const handleDeleteSubject = async (subjectId, subjectName) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `This will permanently delete "${subjectName}"`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        // You'll need to add deleteSubject to your API
        await deleteSubject(subjectId);
        await fetchSubjects();
        Swal.fire({
          icon: "succes",
          title: "Delete Subject",
          text: "The Subject has been Deleted Successfully ",
        });
      } catch (error) {
        console.error("Error deleting subject:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete subject",
        });
      }
    }
  };

  const openEditModal = (subject) => {
    setSelectedSubject(subject);
    setFormData({
      name: subject.name,
      category: subject.category,
      level: subject.level,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({ name: "", category: "", level: "" });
    setSelectedSubject(null);
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
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              Subjects Management
            </h1>
            <p className="text-gray-600">
              {filteredSubjects.length} subjects found
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Add Subject
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search subjects by name, category, or level"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col md:flex-row items-center gap-2">
              <select
                className="w-full md:w-auto border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={filters.category}
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value })
                }
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                className="w-full md:w-auto border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={filters.level}
                onChange={(e) =>
                  setFilters({ ...filters, level: e.target.value })
                }
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
        </div>

        {/* Subjects List */}
        {isMobile ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {filteredSubjects.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No subjects found matching your criteria
              </div>
            ) : (
              filteredSubjects.map((subject) => (
                <div
                  key={subject._id}
                  className="p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <BookOpen className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {subject.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {subject.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(subject)}
                        className="p-1 text-gray-500 hover:text-blue-600"
                        title="Edit Subject"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteSubject(subject._id, subject.name)
                        }
                        className="p-1 text-gray-500 hover:text-red-600"
                        title="Delete Subject"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="font-medium">Level</p>
                      <p className="text-gray-600">{subject.level}</p>
                    </div>
                    <div>
                      <p className="font-medium">Created</p>
                      <p className="text-gray-600">
                        {new Date(subject.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-12 bg-gray-50 p-4 border-b border-gray-200 font-medium text-gray-700">
              <div className="col-span-4">Subject</div>
              <div className="col-span-3">Category</div>
              <div className="col-span-2">Level</div>
              <div className="col-span-2">Created</div>
              <div className="col-span-1">Actions</div>
            </div>

            {filteredSubjects.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No subjects found matching your criteria
              </div>
            ) : (
              filteredSubjects.map((subject) => (
                <div
                  key={subject._id}
                  className="grid grid-cols-12 items-center p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <BookOpen className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {subject.name}
                      </h3>
                    </div>
                  </div>
                  <div className="col-span-3">
                    <p className="text-gray-800">{subject.category}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-800">{subject.level}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-800">
                      {new Date(subject.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="col-span-1 flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditModal(subject)}
                      className="p-1 text-gray-500 hover:text-blue-600"
                      title="Edit Subject"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteSubject(subject._id, subject.name)
                      }
                      className="p-1 text-gray-500 hover:text-red-600"
                      title="Delete Subject"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Create Subject Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">
                  Create New Subject
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleCreateSubject} className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter subject name"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Level
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={formData.level}
                    onChange={(e) =>
                      setFormData({ ...formData, level: e.target.value })
                    }
                  >
                    <option value="">Select Level</option>
                    {levels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Subject
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Subject Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">
                  Edit Subject
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleEditSubject} className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter subject name"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Level
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={formData.level}
                    onChange={(e) =>
                      setFormData({ ...formData, level: e.target.value })
                    }
                  >
                    <option value="">Select Level</option>
                    {levels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Update Subject
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SubjectsPage;
