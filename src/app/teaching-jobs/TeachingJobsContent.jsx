"use client";
import { useState, useEffect, useCallback, Suspense, useRef } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  MapPin,
  Clock,
  DollarSign,
  BookOpen,
  Users,
  Globe,
  Coins,
  Home,
  Calendar,
  User,
  MessageCircle,
  Eye,
  RefreshCw,
  AlertTriangle,
  SortAsc,
  ChevronLeft,
  ChevronRight,
  X,
  Crosshair,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

import { getAllPostRequirements } from "../../api/postRequirement.api";
import { getSubjects } from "../../api/subject.api"; // Import subjects API

// Create a separate component for the main content
const PostRequirementsContent = () => {
  const [allPosts, setAllPosts] = useState([]);
  const [displayedPosts, setDisplayedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("list");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pagination, setPagination] = useState({});

  // Suggestions state
  const [subjects, setSubjects] = useState([]);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [subjectSuggestions, setSubjectSuggestions] = useState([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [showSubjectSuggestions, setShowSubjectSuggestions] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);

  const subjectInputRef = useRef(null);
  const locationInputRef = useRef(null);
  const GEOAPIFY_KEY = "216ee53519b343a5be36cba1a2fa6ed6";

  const [filters, setFilters] = useState({
    subject: "",
    location: "",
    minBudget: "",
    maxBudget: "",
    serviceType: "",
    employmentType: "",
    meetingOptions: "",
    language: "",
  });

  // Fetch subjects on component mount
  useEffect(() => {
    const fetchSubjects = async () => {
      setIsLoadingSubjects(true);
      try {
        const response = await getSubjects();
        if (response.data.success) {
          setSubjects(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
      } finally {
        setIsLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, []);

  // Filter subjects based on input
  useEffect(() => {
    if (filters.subject.length > 1) {
      const searchTerm = filters.subject.toLowerCase();
      const filtered = subjects.filter(
        (subj) =>
          subj.name.toLowerCase().includes(searchTerm) ||
          subj.category.toLowerCase().includes(searchTerm) ||
          subj.level.toLowerCase().includes(searchTerm)
      );
      setSubjectSuggestions(filtered);
    } else {
      setSubjectSuggestions([]);
    }
  }, [filters.subject, subjects]);

  // Fetch location suggestions from Geoapify
  const fetchLocationSuggestions = async (query) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
          query
        )}&apiKey=${GEOAPIFY_KEY}&limit=5`
      );
      const data = await response.json();
      setLocationSuggestions(data.features || []);
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    setIsGeolocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${GEOAPIFY_KEY}`
            );
            const data = await response.json();
            if (data.features && data.features.length > 0) {
              setFilters((prev) => ({
                ...prev,
                location: data.features[0].properties.formatted,
              }));
            }
            setIsGeolocating(false);
          } catch (error) {
            console.error("Error getting location:", error);
            setIsGeolocating(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setIsGeolocating(false);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
      setIsGeolocating(false);
    }
  };

  useEffect(() => {
    if (filters.location.length > 1) {
      const timer = setTimeout(() => {
        fetchLocationSuggestions(filters.location);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [filters.location]);

  // Fetch all post requirements with pagination
  const fetchAllPosts = async (page = 1, limit = 15) => {
    try {
      setLoading(true);
      const res = await getAllPostRequirements(page, limit);

      const postsData = res.data.data || [];
      setAllPosts(postsData);
      setDisplayedPosts(postsData);
      setTotalItems(res.data.total || 0);
      setTotalPages(res.data.totalPages || 0);
      setPagination(res.data.pagination || {});
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch post requirements"
      );
      setAllPosts([]);
      setDisplayedPosts([]);
      setTotalItems(0);
      setTotalPages(0);
      setPagination({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPosts(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  // Apply filters
  const applyFilters = useCallback(() => {
    let result = Array.isArray(allPosts) ? [...allPosts] : [];

    if (filters.subject) {
      const searchTerm = filters.subject.toLowerCase();
      result = result.filter((post) =>
        (post.subjects || []).some((subject) =>
          subject.name.toLowerCase().includes(searchTerm)
        )
      );
    }

    if (filters.location) {
      const searchLocation = filters.location.toLowerCase();
      result = result.filter((post) => {
        if (!post.location) return false;
        return post.location.toLowerCase().includes(searchLocation);
      });
    }

    if (filters.minBudget) {
      result = result.filter(
        (post) => post.budget?.amount >= Number(filters.minBudget)
      );
    }

    if (filters.maxBudget) {
      result = result.filter(
        (post) => post.budget?.amount <= Number(filters.maxBudget)
      );
    }

    if (filters.serviceType) {
      result = result.filter((post) =>
        post.serviceType
          ?.toLowerCase()
          .includes(filters.serviceType.toLowerCase())
      );
    }

    if (filters.employmentType) {
      result = result.filter((post) =>
        post.employmentType
          ?.toLowerCase()
          .includes(filters.employmentType.toLowerCase())
      );
    }

    if (filters.meetingOptions) {
      result = result.filter((post) =>
        (post.meetingOptions || []).some((option) =>
          option.toLowerCase().includes(filters.meetingOptions.toLowerCase())
        )
      );
    }

    if (filters.language) {
      result = result.filter((post) =>
        (post.languages || []).some((lang) =>
          lang.toLowerCase().includes(filters.language.toLowerCase())
        )
      );
    }

    setDisplayedPosts(result);
  }, [allPosts, filters]);

  useEffect(() => {
    applyFilters();
  }, [filters, applyFilters]);

  // Sorting functionality
  const sortPosts = useCallback((posts, sortBy) => {
    const sorted = [...posts].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case "oldest":
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case "budget_low":
          return (a.budget?.amount || 0) - (b.budget?.amount || 0);
        case "budget_high":
          return (b.budget?.amount || 0) - (a.budget?.amount || 0);
        case "name":
          return (a.user?.name || "").localeCompare(b.user?.name || "");
        default:
          return 0;
      }
    });
    return sorted;
  }, []);

  useEffect(() => {
    if (Array.isArray(displayedPosts)) {
      setDisplayedPosts((prev) => sortPosts(prev, sortBy));
    }
  }, [sortBy, sortPosts]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      subject: "",
      location: "",
      minBudget: "",
      maxBudget: "",
      serviceType: "",
      employmentType: "",
      meetingOptions: "",
      language: "",
    });
    setDisplayedPosts(allPosts);
  };

  // Clear individual field
  const clearSubject = () => {
    setFilters((prev) => ({ ...prev, subject: "" }));
    setSubjectSuggestions([]);
    subjectInputRef.current?.focus();
  };

  const clearLocation = () => {
    setFilters((prev) => ({ ...prev, location: "" }));
    setLocationSuggestions([]);
    locationInputRef.current?.focus();
  };

  // Pagination component
  const PaginationControls = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-8 px-4 py-3 bg-white rounded-lg shadow-sm border border-gray-200 gap-4">
        {/* Results Info */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700 justify-center md:justify-start">
          <span>Showing </span>
          <span className="font-medium">
            {(currentPage - 1) * itemsPerPage + 1}
          </span>
          <span> to </span>
          <span className="font-medium">
            {Math.min(currentPage * itemsPerPage, totalItems)}
          </span>
          <span> of </span>
          <span className="font-medium">{totalItems}</span>
          <span> results</span>
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center ">
          {/* Per Page Dropdown */}
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm hidden lg:block"
          >
            <option value="10">10 per page</option>
            <option value="15">15 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
          </select>

          {/* Page Numbers */}
          <div className="flex flex-wrap items-center gap-1 justify-center">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 4) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-8 h-8 rounded-md text-sm ${
                    currentPage === pageNum
                      ? "bg-indigo-600 text-white"
                      : "border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <span className="px-1">...</span>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  className="w-8 h-8 rounded-md border border-gray-300 text-sm hover:bg-gray-50"
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg font-medium">
              Loading post requirements...
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Please wait while we fetch the latest requirements
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8">
            <AlertTriangle className="text-red-500 w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Posts Not Available Right Now
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
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
              Find Teaching Opportunities
            </h1>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-8 leading-relaxed">
              Browse student requirements and connect with learners who need
              your expertise. Find the perfect teaching opportunity that matches
              your skills.
            </p>

            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="bg-white text-black bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{totalItems} students requirements found</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 lg:px-12">
        {/* Enhanced Action Bar with Suggestions */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex flex-col gap-6">
            {/* Primary Search Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Subject Search with Suggestions */}
              <div className="relative">
                <label
                  htmlFor="subject"
                  className="block text-sm font-semibold text-gray-800 mb-2"
                >
                  Search by Subject
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    ref={subjectInputRef}
                    type="text"
                    name="subject"
                    value={filters.subject}
                    onChange={(e) => {
                      handleFilterChange(e);
                      setShowSubjectSuggestions(true);
                    }}
                    onFocus={() => setShowSubjectSuggestions(true)}
                    onBlur={() =>
                      setTimeout(() => setShowSubjectSuggestions(false), 200)
                    }
                    placeholder="e.g. Mathematics, Python, Guitar, IGCSE, A-Level"
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-gray-500"
                    autoComplete="off"
                  />
                  {filters.subject && (
                    <button
                      type="button"
                      onClick={clearSubject}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                  {showSubjectSuggestions && subjectSuggestions.length > 0 && (
                    <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {subjectSuggestions.map((suggestion) => (
                        <li
                          key={suggestion._id}
                          className="px-4 py-3 hover:bg-indigo-50 cursor-pointer text-gray-800 border-b border-gray-100 last:border-b-0"
                          onClick={() => {
                            setFilters((prev) => ({
                              ...prev,
                              subject: suggestion.name,
                            }));
                            setShowSubjectSuggestions(false);
                          }}
                        >
                          <div className="font-medium">{suggestion.name}</div>
                          <div className="text-sm text-gray-600 flex justify-between mt-1">
                            <span>{suggestion.category}</span>
                            <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded">
                              {suggestion.level}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Location Search with Suggestions */}
              <div className="relative">
                <div className="flex justify-between items-center mb-2">
                  <label
                    htmlFor="location"
                    className="block text-sm font-semibold text-gray-800"
                  >
                    Search by Location
                  </label>
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="text-xs flex items-center text-indigo-700 hover:underline"
                    disabled={isGeolocating}
                  >
                    <Crosshair className="mr-1 h-3 w-3" />
                    {isGeolocating ? "Detecting..." : "Use my location"}
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    ref={locationInputRef}
                    type="text"
                    name="location"
                    value={filters.location}
                    onChange={(e) => {
                      handleFilterChange(e);
                      setShowLocationSuggestions(true);
                    }}
                    onFocus={() => setShowLocationSuggestions(true)}
                    onBlur={() =>
                      setTimeout(() => setShowLocationSuggestions(false), 200)
                    }
                    placeholder="City or Postal Code"
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-gray-500"
                    autoComplete="off"
                  />
                  {filters.location && (
                    <button
                      type="button"
                      onClick={clearLocation}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                  {showLocationSuggestions &&
                    locationSuggestions.length > 0 && (
                      <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {locationSuggestions.map((suggestion) => (
                          <li
                            key={suggestion.properties.place_id}
                            className="px-4 py-3 hover:bg-indigo-50 cursor-pointer text-gray-800 border-b border-gray-100 last:border-b-0"
                            onClick={() => {
                              setFilters((prev) => ({
                                ...prev,
                                location: suggestion.properties.formatted,
                              }));
                              setShowLocationSuggestions(false);
                            }}
                          >
                            {suggestion.properties.formatted}
                          </li>
                        ))}
                      </ul>
                    )}
                </div>
              </div>
            </div>

            {/* Secondary Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
              {/* Clear Filters */}
              <div className="flex items-center gap-3">
                {(filters.subject ||
                  filters.location ||
                  filters.minBudget ||
                  filters.maxBudget) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>

              {/* Right Side Controls */}
              <div className="flex items-center gap-4">
                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="budget_high">Budget: High to Low</option>
                  <option value="budget_low">Budget: Low to High</option>
                  <option value="name">Sort by Name</option>
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
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 transition-colors ${
                      viewMode === "list"
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {displayedPosts && displayedPosts.length > 0 ? (
          <>
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {displayedPosts.map((post) => (
                <PostCard key={post._id} post={post} viewMode={viewMode} />
              ))}
            </div>

            {/* Pagination Controls */}
            <PaginationControls />
          </>
        ) : (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <Search className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                No requirements found
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                We couldn't find any post requirements matching your criteria.
                Try adjusting your filters or browse all available requirements.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={clearFilters}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Clear Filters
                </button>
                <button
                  onClick={() => fetchAllPosts(currentPage, itemsPerPage)}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Refresh
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
        <p className="text-gray-600 text-lg font-medium">
          Loading post requirements...
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Please wait while we fetch the latest requirements
        </p>
      </div>
    </div>
  </div>
);

// Main component with Suspense boundary
const PostRequirementsPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <Suspense fallback={<LoadingFallback />}>
        <PostRequirementsContent />
      </Suspense>
      <Footer />
    </div>
  );
};

// Post Card Component
const PostCard = ({ post, viewMode }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getMeetingIcon = (option) => {
    switch (option.toLowerCase()) {
      case "online":
        return <Globe className="w-3 h-3" />;
      case "at my place":
        return <Home className="w-3 h-3" />;
      default:
        return <MapPin className="w-3 h-3" />;
    }
  };

  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 p-6">
        <div className="flex flex-col gap-4">
          {/* Title */}
          <Link href={`/teaching-jobs/${post._id}`} className="flex-1">
            <h3 className="text-lg md:text-2xl font-sans text-black hover:underline cursor-pointer">
              {post.subjects?.length > 0
                ? `Online ${post.subjects
                    .map((s) => s.name)
                    .slice(0, 2) // limit to first 2 subjects
                    .join(" & ")} teacher needed in ${
                    post.location
                      ?.split(",") // split into array
                      .slice(0, 3) // take street, area, city, postal code
                      .map((part) => part.trim()) // clean spaces
                      .join(" ") || "your area"
                  }`
                : "Teacher needed"}
            </h3>
          </Link>
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {post.subjects?.slice(0, 2).map((subject, idx) => (
              <span
                key={idx}
                className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full border border-blue-200"
              >
                {subject.name}
              </span>
            ))}
            {post.meetingOptions?.slice(0, 2).map((option, idx) => (
              <span
                key={idx}
                className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full flex items-center gap-1"
              >
                {getMeetingIcon(option)}
                {option}
              </span>
            ))}
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm line-clamp-2">
            {post.description}
          </p>

          {/* Meta Info Row */}
          <div className="flex flex-wrap items-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatDate(post.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(post.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Coins className="w-4 h-4" />
              <span>{post.budget?.amount || 0} coins</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <MapPin className="w-3 h-3" />
              <span className="truncate">
                {post.location?.length > 50
                  ? post.location.slice(0, 50) + "..."
                  : post.location}
              </span>
            </div>
          </div>

          {/* Budget & Employment */}
          <div className="flex items-center justify-between mt-2">
            <p className="text-gray-900 font-semibold">
              {post.budget?.currency || "$"} {post.budget?.amount || 0}/
              {post.budget?.frequency || "session"}
            </p>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              {post.employmentType}
            </p>
          </div>

          {/* Actions */}
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-grow min-w-0">
            <h3 className="text-lg md:text-xl font-bold text-black mb-3">
              {post.subjects?.length > 0
                ? `Online ${post.subjects
                    .map((s) => s.name)
                    .slice(0, 2) // limit to first 2 subjects
                    .join(" & ")} teacher needed in ${
                    post.location
                      ?.split(",") // split into array
                      .slice(1, 3) // take street, area, city, postal code
                      .map((part) => part.trim()) // clean spaces
                      .join(" ") || "your area"
                  }`
                : "Teacher needed"}
            </h3>
            <p className="text-indigo-600 font-semibold text-sm mb-2">
              {post.serviceType}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{post.location}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
          {post.description}
        </p>

        {/* Subjects */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {post.subjects?.slice(0, 2).map((subject, idx) => (
              <span
                key={idx}
                className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full border border-blue-200 font-medium"
              >
                {subject.name} - {subject.level}
              </span>
            ))}
            {post.subjects?.length > 2 && (
              <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">
                +{post.subjects.length - 2} more
              </span>
            )}
          </div>
        </div>

        {/* Meeting Options */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {post.meetingOptions?.slice(0, 2).map((option, idx) => (
              <span
                key={idx}
                className="bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full flex items-center gap-1"
              >
                {getMeetingIcon(option)}
                {option}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 group-hover:from-indigo-50 group-hover:to-indigo-100 transition-colors">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
              Budget
            </p>
            <p className="text-sm font-bold text-gray-900">
              {post.budget?.currency || "$"}{" "}
              {post.budget?.amount?.toLocaleString() || 0}
            </p>
            <p className="text-xs text-gray-600">
              {post.budget?.frequency || "session"}
            </p>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 group-hover:from-purple-50 group-hover:to-purple-100 transition-colors">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
              Type
            </p>
            <p className="text-sm font-bold text-gray-900">
              {post.employmentType}
            </p>
            <p className="text-xs text-gray-600">
              {formatDate(post.createdAt)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link href={`/teaching-jobs/${post._id}`} className="flex-1">
            <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5  flex items-center justify-center gap-2">
              <Eye className="w-4 h-4" />
              View Details
            </button>
          </Link>
          <button className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center">
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostRequirementsPage;
