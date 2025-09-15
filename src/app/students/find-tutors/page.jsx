// pages/teachers/index.jsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import StudentDashboardLayout from "../../layout/student/DashboardLayout";
import { getAllPublicTeacherProfiles } from "../../../api/teacher.api";

const TeachersPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await getAllPublicTeacherProfiles();
        setTeachers(res.data.data);
        setFilteredTeachers(res.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch teachers");
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  useEffect(() => {
    applySearch();
  }, [searchTerm, teachers]);

  const applySearch = () => {
    if (!searchTerm.trim()) {
      setFilteredTeachers(teachers);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const result = teachers.filter((teacher) => {
      // Search in location
      const locationMatch = teacher.location
        ?.toLowerCase()
        .includes(searchLower);

      // Search in subjects
      const subjectMatch = teacher.subjects?.some((subject) =>
        subject.name.toLowerCase().includes(searchLower)
      );

      // Search in teacher name
      const nameMatch = teacher.user?.name.toLowerCase().includes(searchLower);

      // Search in specialty
      const specialtyMatch = teacher.speciality
        ?.toLowerCase()
        .includes(searchLower);

      return locationMatch || subjectMatch || nameMatch || specialtyMatch;
    });

    setFilteredTeachers(result);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  if (loading) {
    return (
      <StudentDashboardLayout title="All Tutors">
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading teachers...</p>
          </div>
        </div>
      </StudentDashboardLayout>
    );
  }

  if (error) {
    return (
      <StudentDashboardLayout title="All Tutors">
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center text-red-500">
            <p className="text-xl mb-2">⚠️ Error</p>
            <p>{error}</p>
          </div>
        </div>
      </StudentDashboardLayout>
    );
  }

  return (
    <StudentDashboardLayout title="All Tutors">
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        {/* <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8 sm:py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">
              All Teachers
            </h1>
            <p className="text-base sm:text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
              Find qualified teachers for personalized learning experiences
            </p>
          </div>
        </div> */}

        {/* Search Section */}
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="max-w-8xl mx-auto mb-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by subject, location, or teacher name..."
                className="w-full pl-12 pr-12 py-4 text-base border border-gray-300 rounded-xl  transition-all duration-200 shadow-sm bg-white"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-black transition-colors"
                >
                  <svg
                    className="h-5 w-5"
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
              )}
            </div>
          </div>

          {/* Results Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1">
                  {searchTerm ? "Search Results" : "All Available Teachers"}
                </h3>
                <p className="text-gray-600">
                  {searchTerm
                    ? `Found ${filteredTeachers.length}`
                    : `Showing ${filteredTeachers.length}`}{" "}
                  {filteredTeachers.length === 1 ? "teacher" : "teachers"}
                  {searchTerm && ` for "${searchTerm}"`}
                </p>
              </div>
            </div>
          </div>

          {/* Teachers Grid */}
          {filteredTeachers.length > 0 ? (
            <div className="grid grid-cols-1  gap-4 sm:gap-6">
              {filteredTeachers.map((teacher) => (
                <div
                  key={teacher._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
                >
                  {/* Card Content */}
                  <div className="p-4 sm:p-6">
                    {/* Header */}
                    <div className="flex items-start space-x-3 sm:space-x-4 mb-4 ">
                      <div className="flex-grow min-w-0">
                        <Link
                          href={`/students/find-tutors/${teacher._id}`}
                          passHref
                        >
                          <h3 className="text-3xl font-semibold text-blue-800 truncate hover:underline cursor-pointer">
                            {teacher.user.name}
                          </h3>
                        </Link>
                        <p className="text-indigo-600 font-medium text-xs sm:text-sm mt-3">
                          {teacher.speciality}
                        </p>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            📍 {teacher.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 mb-4 leading-relaxed">
                      {teacher.profileDescription}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                          Fee Details
                        </p>
                        <p className="text-xs sm:text-sm font-semibold text-gray-900 mt-1">
                          {teacher.feeDetails}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                          Experience
                        </p>
                        <p className="text-xs sm:text-sm font-semibold text-gray-900 mt-1">
                          {teacher.totalExperience} years
                        </p>
                      </div>
                    </div>

                    {/* Online Availability Badge */}
                    {teacher.availableForOnline && (
                      <div className="mb-4">
                        <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
                          Available Online
                        </span>
                      </div>
                    )}

                    {/* Subjects */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
                        Subjects
                      </p>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {teacher.subjects.slice(0, 3).map((subject, idx) => (
                          <span
                            key={idx}
                            className="bg-blue-50 text-blue-700 text-xs px-2 sm:px-3 py-1 rounded-full border border-blue-200"
                          >
                            {subject.name}
                          </span>
                        ))}
                        {teacher.subjects.length > 3 && (
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 sm:px-3 py-1 rounded-full">
                            +{teacher.subjects.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16">
              <div className="max-w-md mx-auto px-4">
                <div className="text-4xl sm:text-6xl mb-4">🔍</div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  No teachers found
                </h3>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                  {searchTerm
                    ? `We couldn't find any teachers matching "${searchTerm}". Try a different search term.`
                    : "No teachers are currently available."}
                </p>
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="bg-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </StudentDashboardLayout>
  );
};

export default TeachersPage;
