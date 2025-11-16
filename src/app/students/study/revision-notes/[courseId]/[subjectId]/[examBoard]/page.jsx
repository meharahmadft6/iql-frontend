"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getRevisionNotes } from "../../../../../../../api/study.api.js";
import StudentDashboardLayout from "../../../../../../layout/student/DashboardLayout";

export default function RevisionNotesPage({ params }) {
  const router = useRouter();
  const [unwrappedParams, setUnwrappedParams] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSubTopic, setSelectedSubTopic] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [expandedTopics, setExpandedTopics] = useState(new Set());
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTopics, setFilteredTopics] = useState([]);
  const contentRef = useRef(null);

  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params;
      setUnwrappedParams(resolvedParams);
    };
    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (
      unwrappedParams?.courseId &&
      unwrappedParams?.subjectId &&
      unwrappedParams?.examBoard
    ) {
      fetchRevisionNotes();
    }
  }, [unwrappedParams]);

  useEffect(() => {
    if (data?.revisionNotes?.topics) {
      filterTopics();
    }
  }, [searchTerm, data]);

  const filterTopics = () => {
    if (!searchTerm.trim()) {
      setFilteredTopics(data.revisionNotes.topics);
      return;
    }

    const filtered = data.revisionNotes.topics.filter((topic) => {
      const topicMatches = topic.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const subTopicMatches = topic.subTopics?.some((subTopic) =>
        subTopic.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return topicMatches || subTopicMatches;
    });

    setFilteredTopics(filtered);

    // Auto-expand topics that match search
    if (searchTerm.trim()) {
      const expanded = new Set();
      filtered.forEach((topic) => {
        expanded.add(topic._id);
      });
      setExpandedTopics(expanded);
    }
  };

  const fetchRevisionNotes = async () => {
    try {
      setLoading(true);
      const { courseId, subjectId, examBoard } = unwrappedParams;
      const response = await getRevisionNotes(courseId, subjectId, examBoard);

      if (response.data.success) {
        setData(response.data.data);
        setFilteredTopics(response.data.data.revisionNotes?.topics || []);

        // Auto-select first topic and first sub-topic if available
        if (response.data.data.revisionNotes?.topics?.length > 0) {
          const firstTopic = response.data.data.revisionNotes.topics[0];
          setSelectedTopic(firstTopic);
          setExpandedTopics(new Set([firstTopic._id]));

          if (firstTopic.subTopics?.length > 0) {
            setSelectedSubTopic(firstTopic.subTopics[0]);
          } else {
            setSelectedSubTopic(null);
          }
        }
      } else {
        setError("Failed to load revision notes");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load revision notes");
    } finally {
      setLoading(false);
    }
  };

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    if (topic.subTopics?.length > 0) {
      setSelectedSubTopic(topic.subTopics[0]);
    } else {
      setSelectedSubTopic(null);
    }
    setExpandedTopics((prev) => new Set([...prev, topic._id]));
    setMobileSidebarOpen(false);

    // Scroll to top when new topic is selected
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubTopicSelect = (subTopic) => {
    setSelectedSubTopic(subTopic);
    setMobileSidebarOpen(false);

    // Scroll to top when new sub-topic is selected
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const toggleTopicExpansion = (topicId, e) => {
    e.stopPropagation();
    setExpandedTopics((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(topicId)) {
        newSet.delete(topicId);
      } else {
        newSet.add(topicId);
      }
      return newSet;
    });
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  // Format content with enhanced formatting
  const formatContent = (content) => {
    if (!content) return "";

    return content.split("\n").map((line, index) => {
      if (line.trim() === "") {
        return <div key={index} className="h-4" />;
      }

      // Enhanced formatting patterns
      let formattedLine = line
        .replace(
          /\*\*(.*?)\*\*/g,
          "<strong class='font-bold text-slate-900'>$1</strong>"
        )
        .replace(/\*(.*?)\*/g, "<em class='italic text-slate-800'>$1</em>")
        .replace(
          /`(.*?)`/g,
          "<code class='bg-slate-100 px-1.5 py-0.5 rounded text-sm font-mono text-slate-800'>$1</code>"
        )
        .replace(
          /^- (.*)/g,
          "<span class='flex'><span class='mr-2'>•</span><span>$1</span></span>"
        )
        .replace(
          /^# (.*)/g,
          "<h3 class='text-xl font-bold text-slate-900 mt-6 mb-4'>$1</h3>"
        )
        .replace(
          /^## (.*)/g,
          "<h4 class='text-lg font-semibold text-slate-900 mt-5 mb-3'>$1</h4>"
        );

      return (
        <div
          key={index}
          className="mb-4 leading-relaxed text-slate-700"
          dangerouslySetInnerHTML={{ __html: formattedLine }}
        />
      );
    });
  };

  // Truncate long text with ellipsis
  const truncateText = (text, maxLength = 40) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (!unwrappedParams || loading) {
    return (
      <StudentDashboardLayout title="Revision Notes">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-6">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-gray-600 text-lg font-medium">
              Loading revision notes...
            </p>
          </div>
        </div>
      </StudentDashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <StudentDashboardLayout title="Revision Notes">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-rose-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">
              Unable to Load Notes
            </h2>
            <p className="text-slate-600 mb-6">
              {error || "No revision notes available"}
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={fetchRevisionNotes}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300"
              >
                Try Again
              </button>
              <Link
                href="/students/study"
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-white transition-all duration-300"
              >
                Back to Study
              </Link>
            </div>
          </div>
        </div>
      </StudentDashboardLayout>
    );
  }

  const { courseId, subjectId, examBoard } = unwrappedParams;
  const decodedExamBoard = decodeURIComponent(examBoard);
  const topics = filteredTopics;

  return (
    <StudentDashboardLayout title={`Revision Notes - ${data.course?.name}`}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Enhanced Header */}
        <header className="bg-white/90 backdrop-blur-lg border-b border-slate-200/60 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <Link
                  href="/students/study"
                  className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 font-medium transition-all duration-300 group flex-shrink-0"
                >
                  <svg
                    className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
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
                  <span className="hidden sm:inline">Back to Study</span>
                </Link>
                <div className="h-6 w-px bg-slate-300 hidden sm:block"></div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
                    Revision Notes
                  </h1>
                  <p className="text-slate-600 text-sm truncate">
                    {data.course?.name} • {data.subject?.name} •{" "}
                    {decodedExamBoard}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 flex-shrink-0">
                {/* Mobile sidebar toggle */}
                <button
                  onClick={toggleMobileSidebar}
                  className="p-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all duration-300 lg:hidden"
                  title="Toggle sidebar"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>

                {/* Desktop sidebar toggle */}
                <button
                  onClick={toggleSidebar}
                  className="p-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all duration-300 hidden lg:flex"
                  title={sidebarVisible ? "Hide sidebar" : "Show sidebar"}
                >
                  {sidebarVisible ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h7"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Enhanced Mobile Sidebar Overlay */}
            {mobileSidebarOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
                <div
                  className="absolute inset-0"
                  onClick={toggleMobileSidebar}
                ></div>
                <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform">
                  <div className="p-6 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-6 flex-shrink-0">
                      <h2 className="text-lg font-bold text-slate-900 flex items-center">
                        <svg
                          className="w-5 h-5 mr-2 text-blue-600"
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
                        Topics ({topics.length})
                      </h2>
                      <button
                        onClick={toggleMobileSidebar}
                        className="p-2 text-slate-500 hover:text-slate-700"
                      >
                        <svg
                          className="w-5 h-5"
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

                    {/* Search in mobile sidebar */}
                    <div className="relative mb-4 flex-shrink-0">
                      <input
                        type="text"
                        placeholder="Search topics..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                      />
                      <svg
                        className="w-4 h-4 absolute left-3 top-3 text-slate-400"
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
                      {searchTerm && (
                        <button
                          onClick={clearSearch}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                        >
                          <svg
                            className="w-4 h-4"
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

                    <div className="space-y-2 overflow-y-auto flex-1">
                      {topics.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                          <svg
                            className="w-12 h-12 mx-auto mb-3 text-slate-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <p>No topics found</p>
                        </div>
                      ) : (
                        topics.map((topic, index) => (
                          <div key={topic._id || index} className="space-y-1">
                            <button
                              onClick={() => handleTopicSelect(topic)}
                              className={`w-full text-left p-3 rounded-xl border transition-all duration-200 group ${
                                selectedTopic?._id === topic._id
                                  ? "bg-blue-50 border-blue-300 shadow-sm"
                                  : "bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-2 min-w-0 flex-1">
                                  <div
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                      selectedTopic?._id === topic._id
                                        ? "bg-blue-100 text-blue-600"
                                        : "bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600"
                                    }`}
                                  >
                                    <svg
                                      className="w-4 h-4"
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
                                  <span
                                    className={`text-sm font-medium truncate ${
                                      selectedTopic?._id === topic._id
                                        ? "text-blue-700"
                                        : "text-slate-700"
                                    }`}
                                  >
                                    {topic.title}
                                  </span>
                                </div>
                                {topic.subTopics &&
                                  topic.subTopics.length > 0 && (
                                    <button
                                      onClick={(e) =>
                                        toggleTopicExpansion(topic._id, e)
                                      }
                                      className="p-1 hover:bg-slate-200 rounded-lg transition-colors flex-shrink-0 ml-2"
                                    >
                                      <svg
                                        className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
                                          expandedTopics.has(topic._id)
                                            ? "rotate-90"
                                            : ""
                                        }`}
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
                                    </button>
                                  )}
                              </div>
                            </button>

                            {expandedTopics.has(topic._id) &&
                              topic.subTopics &&
                              topic.subTopics.length > 0 && (
                                <div className="ml-4 space-y-1">
                                  {topic.subTopics.map((subTopic, subIndex) => (
                                    <button
                                      key={subTopic._id || subIndex}
                                      onClick={() => {
                                        handleTopicSelect(topic);
                                        handleSubTopicSelect(subTopic);
                                      }}
                                      className={`w-full text-left p-2 pl-8 rounded-lg border text-sm transition-all duration-200 group ${
                                        selectedSubTopic?._id === subTopic._id
                                          ? "bg-blue-50 border-blue-200 text-blue-700"
                                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                                      }`}
                                    >
                                      <div className="flex items-center space-x-2 min-w-0">
                                        <div
                                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                            selectedSubTopic?._id ===
                                            subTopic._id
                                              ? "bg-blue-500"
                                              : "bg-slate-300 group-hover:bg-blue-400"
                                          }`}
                                        />
                                        <span className="truncate">
                                          {subTopic.title}
                                        </span>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Desktop Sidebar */}
            {sidebarVisible && (
              <div className="hidden lg:block lg:w-80 flex-shrink-0">
                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/60 p-6 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-blue-600"
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
                      Topics ({topics.length})
                    </h2>
                  </div>

                  {/* Search in desktop sidebar */}
                  <div className="relative mb-4">
                    <input
                      type="text"
                      placeholder="Search topics..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm text-sm"
                    />
                    <svg
                      className="w-4 h-4 absolute left-3 top-3 text-slate-400"
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
                    {searchTerm && (
                      <button
                        onClick={clearSearch}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        <svg
                          className="w-4 h-4"
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

                  <div className="space-y-2">
                    {topics.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <svg
                          className="w-12 h-12 mx-auto mb-3 text-slate-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="text-sm">
                          No topics found for "{searchTerm}"
                        </p>
                        <button
                          onClick={clearSearch}
                          className="text-blue-600 hover:text-blue-700 text-sm mt-2"
                        >
                          Clear search
                        </button>
                      </div>
                    ) : (
                      topics.map((topic, index) => (
                        <div key={topic._id || index} className="space-y-1">
                          <button
                            onClick={() => handleTopicSelect(topic)}
                            className={`w-full text-left p-3 rounded-xl border transition-all duration-200 group ${
                              selectedTopic?._id === topic._id
                                ? "bg-blue-50 border-blue-300 shadow-sm"
                                : "bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-2 min-w-0 flex-1">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                    selectedTopic?._id === topic._id
                                      ? "bg-blue-100 text-blue-600"
                                      : "bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600"
                                  }`}
                                >
                                  <svg
                                    className="w-4 h-4"
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
                                <span
                                  className={`text-sm font-medium truncate ${
                                    selectedTopic?._id === topic._id
                                      ? "text-blue-700"
                                      : "text-slate-700"
                                  }`}
                                >
                                  {topic.title}
                                </span>
                              </div>
                              {topic.subTopics &&
                                topic.subTopics.length > 0 && (
                                  <button
                                    onClick={(e) =>
                                      toggleTopicExpansion(topic._id, e)
                                    }
                                    className="p-1 hover:bg-slate-200 rounded-lg transition-colors flex-shrink-0 ml-2"
                                  >
                                    <svg
                                      className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
                                        expandedTopics.has(topic._id)
                                          ? "rotate-90"
                                          : ""
                                      }`}
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
                                  </button>
                                )}
                            </div>
                          </button>

                          {expandedTopics.has(topic._id) &&
                            topic.subTopics &&
                            topic.subTopics.length > 0 && (
                              <div className="ml-4 space-y-1">
                                {topic.subTopics.map((subTopic, subIndex) => (
                                  <button
                                    key={subTopic._id || subIndex}
                                    onClick={() => {
                                      handleTopicSelect(topic);
                                      handleSubTopicSelect(subTopic);
                                    }}
                                    className={`w-full text-left p-2 pl-8 rounded-lg border text-sm transition-all duration-200 group ${
                                      selectedSubTopic?._id === subTopic._id
                                        ? "bg-blue-50 border-blue-200 text-blue-700"
                                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                                    }`}
                                  >
                                    <div className="flex items-center space-x-2 min-w-0">
                                      <div
                                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                          selectedSubTopic?._id === subTopic._id
                                            ? "bg-blue-500"
                                            : "bg-slate-300 group-hover:bg-blue-400"
                                        }`}
                                      />
                                      <span className="truncate">
                                        {subTopic.title}
                                      </span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Main Content */}
            <div className="flex-1 min-w-0" ref={contentRef}>
              {selectedTopic ? (
                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
                  {/* Enhanced Topic Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200/60 p-6">
                    <div className="flex flex-col">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h2 className="text-2xl font-bold text-slate-900 mb-2 break-words">
                            {selectedTopic.title}
                          </h2>
                          {selectedSubTopic && (
                            <h3 className="text-xl font-semibold text-blue-700 mb-3 break-words">
                              {selectedSubTopic.title}
                            </h3>
                          )}
                        </div>
                        {!sidebarVisible && (
                          <button
                            onClick={toggleSidebar}
                            className="p-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all duration-300 hidden lg:flex ml-4 flex-shrink-0"
                            title="Show sidebar"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h7"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                      {selectedTopic.content && !selectedSubTopic && (
                        <div className="prose prose-sm max-w-none mt-4">
                          <div className="text-slate-700 leading-relaxed">
                            {formatContent(selectedTopic.content)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Content Area */}
                  <div className="p-4 sm:p-6">
                    {/* Enhanced Images Section */}
                    {selectedTopic.images &&
                      selectedTopic.images.length > 0 && (
                        <div className="mb-8">
                          <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                            <svg
                              className="w-5 h-5 mr-2 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            Key Visuals
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {selectedTopic.images.map((image, index) => (
                              <div
                                key={image._id || index}
                                className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:shadow-md transition-shadow duration-300"
                              >
                                <img
                                  src={image.signedUrl || image.url}
                                  alt={image.altText || selectedTopic.title}
                                  className="w-full h-auto rounded-lg mb-2 max-h-64 object-contain"
                                  loading="lazy"
                                />
                                {image.caption && (
                                  <p className="text-sm text-slate-600 text-center mt-2">
                                    {image.caption}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Enhanced Content Display */}
                    {selectedSubTopic ? (
                      <div className="space-y-6">
                        {selectedSubTopic.image && (
                          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:shadow-md transition-shadow duration-300">
                            <img
                              src={
                                selectedSubTopic.image.signedUrl ||
                                selectedSubTopic.image.url
                              }
                              alt={
                                selectedSubTopic.image.altText ||
                                selectedSubTopic.title
                              }
                              className="w-full h-auto rounded-lg mb-2 max-h-64 object-contain"
                              loading="lazy"
                            />
                            {selectedSubTopic.image.caption && (
                              <p className="text-sm text-slate-600 text-center mt-2">
                                {selectedSubTopic.image.caption}
                              </p>
                            )}
                          </div>
                        )}

                        {selectedSubTopic.content && (
                          <div className="prose prose-lg max-w-none">
                            <div className="text-slate-800 leading-relaxed">
                              {formatContent(selectedSubTopic.content)}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      selectedTopic.content && (
                        <div className="prose prose-lg max-w-none">
                          <div className="text-slate-800 leading-relaxed">
                            {formatContent(selectedTopic.content)}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/60 p-8 sm:p-12 text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <svg
                      className="w-10 h-10 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
                    Select a Topic
                  </h3>
                  <p className="text-slate-600 text-base sm:text-lg max-w-md mx-auto mb-6">
                    Choose a topic from the sidebar to start exploring revision
                    notes.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {!sidebarVisible && (
                      <button
                        onClick={toggleSidebar}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300"
                      >
                        Show Topics
                      </button>
                    )}
                    <button
                      onClick={toggleMobileSidebar}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 lg:hidden"
                    >
                      Browse Topics
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </StudentDashboardLayout>
  );
}
