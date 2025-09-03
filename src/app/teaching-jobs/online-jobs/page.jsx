"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
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
} from "lucide-react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { getAllOnlinePostRequirements } from "../../../api/postRequirement.api";

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
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pagination, setPagination] = useState({});

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

  // Fetch all post requirements with pagination
  const fetchAllPosts = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const res = await getAllOnlinePostRequirements(page, limit);

      const postsData = res.data.data || [];
      setAllPosts(postsData);
      setDisplayedPosts(postsData);
      setTotalItems(res.data.total || 0);
      setTotalPages(res.data.totalPages || 0);
      setPagination(res.data.pagination || {});

      console.log("Pagination data:", res.data.pagination);
      console.log("Total items:", res.data.total);
      console.log("Total pages:", res.data.totalPages);
      console.log("Current page:", page);
      console.log("Items per page:", limit);
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
      window.scrollTo(0, 0); // Scroll to top when page changes
    }
  };

  // Apply filters
  const applyFilters = useCallback(() => {
    // Ensure allPosts is an array before spreading
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

  // Pagination component
  const PaginationControls = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-8 px-4 py-3 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-700">
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

        <div className="flex items-center gap-2">
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
          >
            <option value="10">10 per page</option>
            <option value="15">15 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
          </select>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show pages around current page
              let pageNum;
              if (totalPages <= 5) {
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
              Find Online Tutor Jobs
            </h1>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-8 leading-relaxed">
              Explore teaching opportunities tailored to your expertise. Connect
              with students looking for help in subjects you specialize in and
              start tutoring online with ease.
            </p>

            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="bg-white text-black bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{totalItems} students requests available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 lg:px-12">
        {/* Action Bar */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left Side - Search Filters */}
            <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 w-full lg:w-auto">
              {/* Subject Search */}
              <input
                type="text"
                name="subject"
                value={filters.subject}
                onChange={handleFilterChange}
                placeholder="Search by Subject"
                className="w-full sm:w-48 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />

              {/* Location Search */}
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="Search by Location"
                className="w-full sm:w-48 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />

              {/* Clear Filters Button (optional) */}
              {(filters.subject || filters.location) && (
                <button
                  onClick={clearFilters}
                  className="text-sm px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 hover:bg-gray-200"
                >
                  Clear
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
                  <Grid3X3 className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 transition-colors ${
                    viewMode === "list"
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
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
