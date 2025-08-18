// pages/teachers/index.jsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { getHomeTutors } from "../../../api/teacher.api";

const TeachersPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    subject: "",
    location: "",
    minFee: "",
    maxFee: "",
    online: false,
    experience: "",
  });

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await getHomeTutors();
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
    applyFilters();
  }, [filters, teachers]);

  const applyFilters = () => {
    let result = [...teachers];

    if (filters.subject) {
      result = result.filter((teacher) =>
        teacher.subjects.some((subject) =>
          subject.name.toLowerCase().includes(filters.subject.toLowerCase())
        )
      );
    }

    if (filters.location) {
      result = result.filter((teacher) =>
        teacher.location.toLowerCase().includes(filters.location.toLowerCase())
      );
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

    setFilteredTeachers(result);
  };

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
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tutors...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center text-red-500">
            <p className="text-xl mb-2">⚠️ Error</p>
            <p>{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className=" flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Find Your Perfect Home Tutor
            </h1>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
              Connect with qualified tutors who can help you achieve your
              learning goals
            </p>
          </div>
        </div>

        <div className="container mx-auto md:px-12 md:py-12 px-4 py-4">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="font-medium text-gray-700">
                🔍 Filter Tutors
              </span>
              <span className="text-gray-500">{showFilters ? "−" : "+"}</span>
            </button>
          </div>

          {/* Filters Section */}
          <div className={`${showFilters || "lg:block hidden"} mb-8`}>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Filter Tutors
                </h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Subject Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={filters.subject}
                    onChange={handleFilterChange}
                    placeholder="Math, Science, Quran..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* Location Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={filters.location}
                    onChange={handleFilterChange}
                    placeholder="City or Country"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* Min Fee Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Min Fee
                  </label>
                  <input
                    type="number"
                    name="minFee"
                    value={filters.minFee}
                    onChange={handleFilterChange}
                    placeholder="Minimum fee"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* Max Fee Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Max Fee
                  </label>
                  <input
                    type="number"
                    name="maxFee"
                    value={filters.maxFee}
                    onChange={handleFilterChange}
                    placeholder="Maximum fee"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* Experience Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Min Experience (years)
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={filters.experience}
                    onChange={handleFilterChange}
                    placeholder="Minimum years"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* Online Availability Filter */}
                <div className="space-y-2 flex items-end">
                  <label className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      name="online"
                      checked={filters.online}
                      onChange={handleFilterChange}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Available Online
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Available Tutors
              </h3>
              <p className="text-gray-600">
                Found {filteredTeachers.length}{" "}
                {filteredTeachers.length === 1 ? "tutor" : "tutors"}
              </p>
            </div>
          </div>

          {/* Teachers Grid */}
          {filteredTeachers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTeachers.map((teacher) => (
                <div
                  key={teacher._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start space-x-4 mb-4">
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
                      <div className="flex-grow min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {teacher.user.name}
                        </h3>
                        <p className="text-indigo-600 font-medium text-sm">
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
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
                      {teacher.profileDescription}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                          Fee
                        </p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {teacher.fee} {teacher.feeDetails}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                          Experience
                        </p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {teacher.totalExperience} years
                        </p>
                      </div>
                    </div>

                    {/* Online Availability Badge */}
                    {teacher.availableForOnline && (
                      <div className="mb-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          🌐 Available Online
                        </span>
                      </div>
                    )}

                    {/* Subjects */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
                        Subjects
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {teacher.subjects.slice(0, 3).map((subject, idx) => (
                          <span
                            key={idx}
                            className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full border border-blue-200"
                          >
                            {subject.name}
                          </span>
                        ))}
                        {teacher.subjects.length > 3 && (
                          <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                            +{teacher.subjects.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 pb-6">
                    <Link href={`/tutors/${teacher._id}`} passHref>
                      <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                        View Profile
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No tutors found
                </h3>
                <p className="text-gray-600 mb-6">
                  We couldn't find any tutors matching your criteria. Try
                  adjusting your filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TeachersPage;
