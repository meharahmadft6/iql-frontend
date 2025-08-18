"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  getAllPublicTeacherProfiles,
  getFilteredTeachers,
} from "../../api/teacher.api";
import { useSearchParams } from "next/navigation";

// Create a separate component that uses useSearchParams
const TeachersContent = () => {
  const searchParams = useSearchParams();
  const [allTeachers, setAllTeachers] = useState([]); // Store original data
  const [displayedTeachers, setDisplayedTeachers] = useState([]); // What we show
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilterMode, setActiveFilterMode] = useState("all"); // 'all', 'url', 'filters'
  const [sortBy, setSortBy] = useState("name"); // New sorting functionality
  const [viewMode, setViewMode] = useState("grid"); // grid or list view

  const [filters, setFilters] = useState({
    subject: "",
    location: "",
    minFee: "",
    maxFee: "",
    online: false,
    experience: "",
  });

  // Initialize filters and fetch data based on URL params
  useEffect(() => {
    const urlSubject = searchParams.get("subject");
    const urlLocation = searchParams.get("location");

    if (urlSubject || urlLocation) {
      // Set filters from URL and fetch filtered data
      const urlFilters = {
        subject: urlSubject || "",
        location: urlLocation || "",
        minFee: "",
        maxFee: "",
        online: false,
        experience: "",
      };
      setFilters(urlFilters);
      setActiveFilterMode("url");
      fetchFilteredTeachers(urlSubject, urlLocation);
    } else {
      // Fetch all teachers
      setActiveFilterMode("all");
      fetchAllTeachers();
    }
  }, [searchParams]);

  const fetchAllTeachers = async () => {
    try {
      setLoading(true);
      const res = await getAllPublicTeacherProfiles();
      const teachersData = res.data.data;
      setAllTeachers(teachersData);
      setDisplayedTeachers(teachersData);
      setActiveFilterMode("all");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch teachers");
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredTeachers = async (
    subject,
    location,
    additionalFilters = {}
  ) => {
    try {
      setLoading(true);
      const params = { ...additionalFilters };
      if (subject) params.subject = subject;
      if (location) params.location = location;

      const res = await getFilteredTeachers(params);
      const teachersData = res.data.data;
      setAllTeachers(teachersData);
      setDisplayedTeachers(teachersData);
      setActiveFilterMode("url");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch teachers");
    } finally {
      setLoading(false);
    }
  };

  // Apply local filters (only when not in URL mode)
  const applyLocalFilters = useCallback(() => {
    if (activeFilterMode === "url") return; // Don't apply local filters in URL mode

    let result = [...allTeachers];

    const normalizeSubject = (name) => {
      if (!name) return "";
      return name
        .toLowerCase()
        .replace("mathematics", "math")
        .replace("maths", "math")
        .trim();
    };

    if (filters.subject) {
      const searchTerm = normalizeSubject(filters.subject);
      result = result.filter((teacher) =>
        (teacher.subjects || []).some((subject) => {
          const subjectName = normalizeSubject(subject?.name);
          return (
            subjectName.includes(searchTerm) || searchTerm.includes(subjectName)
          );
        })
      );
    }

    if (filters.location) {
      const searchLocation = filters.location.toLowerCase();
      result = result.filter((teacher) => {
        if (!teacher.location) return false;
        const teacherLocation = teacher.location.toLowerCase();
        return (
          teacherLocation.includes(searchLocation) ||
          searchLocation.includes(teacherLocation)
        );
      });
    }

    if (filters.minFee) {
      result = result.filter(
        (teacher) => teacher.fee >= Number(filters.minFee)
      );
    }

    if (filters.maxFee) {
      result = result.filter(
        (teacher) => teacher.fee <= Number(filters.maxFee)
      );
    }

    if (filters.online) {
      result = result.filter((teacher) => teacher.availableForOnline);
    }

    if (filters.experience) {
      result = result.filter(
        (teacher) => teacher.totalExperience >= Number(filters.experience)
      );
    }

    setDisplayedTeachers(result);
    setActiveFilterMode("filters");
  }, [allTeachers, filters, activeFilterMode]);

  // Apply local filters when filters change
  useEffect(() => {
    if (activeFilterMode !== "url") {
      applyLocalFilters();
    }
  }, [filters, applyLocalFilters, activeFilterMode]);

  // Sorting functionality
  const sortTeachers = useCallback((teachers, sortBy) => {
    const sorted = [...teachers].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.user.name.localeCompare(b.user.name);
        case "fee_low":
          return (a.fee || 0) - (b.fee || 0);
        case "fee_high":
          return (b.fee || 0) - (a.fee || 0);
        case "experience":
          return (b.totalExperience || 0) - (a.totalExperience || 0);
        default:
          return 0;
      }
    });
    return sorted;
  }, []);

  // Apply sorting when sortBy changes
  useEffect(() => {
    setDisplayedTeachers((prev) => sortTeachers(prev, sortBy));
  }, [sortBy, sortTeachers]);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      subject: "",
      location: "",
      minFee: "",
      maxFee: "",
      online: false,
      experience: "",
    });
    setActiveFilterMode("all");
    setDisplayedTeachers(allTeachers);
  };

  const resetToAll = () => {
    clearFilters();
    fetchAllTeachers();
    // Clear URL params if needed
    window.history.replaceState({}, "", window.location.pathname);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg font-medium">
              Loading tutors...
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Please wait while we fetch the best tutors for you
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <main className="flex-grow">
      {/* Enhanced Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Find Your Perfect Tutor
            </h1>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-8 leading-relaxed">
              Connect with qualified, experienced tutors who can help you
              achieve your learning goals and excel in your studies
            </p>

            {/* Filter Mode Indicator */}
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-2 text-black">
                {activeFilterMode === "url" && " Showing results from search"}
                {activeFilterMode === "filters" && " Custom filtered results"}
                {activeFilterMode === "all" && " All available tutors"}
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-2 text-black">
                📊 {displayedTeachers.length} tutors found
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 lg:px-12">
        {/* Action Bar */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left Side - Filter Toggle & Mode Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
              >
                🔍 Filters {showFilters ? "−" : "+"}
              </button>

              {activeFilterMode !== "all" && (
                <button
                  onClick={resetToAll}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  👥 Show All Tutors
                </button>
              )}
            </div>

            {/* Right Side - View Controls */}
            <div className="flex items-center gap-4">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="name">Sort by Name</option>
                <option value="fee_low">Fee: Low to High</option>
                <option value="fee_high">Fee: High to Low</option>
                <option value="experience">Most Experienced</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 transition-colors ${
                    viewMode === "grid"
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  ⊞
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 transition-colors ${
                    viewMode === "list"
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  ☰
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className={`${showFilters ? "block" : "hidden"} lg:block mb-8`}>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                🎯 Filter Tutors
              </h2>
              <div className="flex gap-2">
                {activeFilterMode !== "all" && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-600 hover:text-gray-800 font-medium bg-gray-100 px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  📚 Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={filters.subject}
                  onChange={handleFilterChange}
                  disabled={activeFilterMode === "url"}
                  placeholder="Math, Science, English..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  📍 Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  disabled={activeFilterMode === "url"}
                  placeholder="City, Country..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  💰 Min Fee
                </label>
                <input
                  type="number"
                  name="minFee"
                  value={filters.minFee}
                  onChange={handleFilterChange}
                  disabled={activeFilterMode === "url"}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  💰 Max Fee
                </label>
                <input
                  type="number"
                  name="maxFee"
                  value={filters.maxFee}
                  onChange={handleFilterChange}
                  disabled={activeFilterMode === "url"}
                  placeholder="∞"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  🎓 Min Experience
                </label>
                <input
                  type="number"
                  name="experience"
                  value={filters.experience}
                  onChange={handleFilterChange}
                  disabled={activeFilterMode === "url"}
                  placeholder="Years"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div className="space-y-2 flex items-end">
                <label className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    name="online"
                    checked={filters.online}
                    onChange={handleFilterChange}
                    disabled={activeFilterMode === "url"}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:opacity-50"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    🌐 Online Available
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {displayedTeachers.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {displayedTeachers.map((teacher) => (
              <TeacherCard
                key={teacher._id}
                teacher={teacher}
                viewMode={viewMode}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="text-8xl mb-6">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                No tutors found
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                We couldn't find any tutors matching your criteria. Try
                adjusting your filters or browse all available tutors.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={clearFilters}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Clear Filters
                </button>
                <button
                  onClick={resetToAll}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  View All Tutors
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex flex-col bg-gray-50">
    <div className="flex-grow flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-6"></div>
        <p className="text-gray-600 text-lg font-medium">Loading tutors...</p>
        <p className="text-gray-500 text-sm mt-2">
          Please wait while we fetch the best tutors for you
        </p>
      </div>
    </div>
  </div>
);

// Main component with Suspense boundary
const TeachersPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <Suspense fallback={<LoadingFallback />}>
        <TeachersContent />
      </Suspense>

      <Footer />
    </div>
  );
};

// Enhanced Teacher Card Component
const TeacherCard = ({ teacher, viewMode }) => {
  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Profile Section */}
          <div className="flex items-start gap-4 md:w-1/3">
            <div className="flex-shrink-0">
              {teacher.profilePhotoUrl ? (
                <img
                  src={teacher.profilePhotoUrl}
                  alt={teacher.user.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                  {teacher.user.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-grow">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {teacher.user.name}
              </h3>
              <p className="text-indigo-600 font-semibold mb-2">
                {teacher.speciality}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>📍 {teacher.location}</span>
                {teacher.availableForOnline && (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                    🌐 Online
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="md:w-1/3">
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {teacher.profileDescription}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {teacher.subjects.slice(0, 4).map((subject, idx) => (
                <span
                  key={idx}
                  className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full border border-blue-200"
                >
                  {subject.name}
                </span>
              ))}
              {teacher.subjects.length > 4 && (
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  +{teacher.subjects.length - 4}
                </span>
              )}
            </div>
          </div>

          {/* Stats & Action Section */}
          <div className="md:w-1/3">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">
                  {teacher.fee} {teacher.feeDetails}
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Fee
                </p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">
                  {teacher.totalExperience} years
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Experience
                </p>
              </div>
            </div>

            <Link href={`/tutors/${teacher._id}`} passHref>
              <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg">
                View Profile →
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Grid view (original card design, enhanced)
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0">
            {teacher.profilePhotoUrl ? (
              <img
                src={teacher.profilePhotoUrl}
                alt={teacher.user.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 group-hover:border-indigo-200 transition-colors"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl group-hover:from-indigo-600 group-hover:to-purple-700 transition-colors">
                {teacher.user.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-grow min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-indigo-900 transition-colors">
              {teacher.user.name}
            </h3>
            <p className="text-indigo-600 font-semibold text-sm mb-2">
              {teacher.speciality}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                📍 {teacher.location}
              </span>
              {teacher.availableForOnline && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                  🌐 Online
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
          {teacher.profileDescription}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 group-hover:from-indigo-50 group-hover:to-indigo-100 transition-colors">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
              Fee
            </p>
            <p className="text-sm font-bold text-gray-900">
              {teacher.fee} {teacher.feeDetails}
            </p>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 group-hover:from-purple-50 group-hover:to-purple-100 transition-colors">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
              Experience
            </p>
            <p className="text-sm font-bold text-gray-900">
              {teacher.totalExperience} years
            </p>
          </div>
        </div>

        {/* Subjects */}
        <div className="mb-6">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
            Subjects
          </p>
          <div className="flex flex-wrap gap-2">
            {teacher.subjects.slice(0, 3).map((subject, idx) => (
              <span
                key={idx}
                className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full border border-blue-200 font-medium"
              >
                {subject.name}
              </span>
            ))}
            {teacher.subjects.length > 3 && (
              <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">
                +{teacher.subjects.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <Link href={`/tutors/${teacher._id}`} passHref>
          <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 group-hover:scale-105">
            View Full Profile →
          </button>
        </Link>
      </div>
    </div>
  );
};

export default TeachersPage;
