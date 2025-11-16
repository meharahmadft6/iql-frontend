"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getPastPapers } from "../../../../../../api/study.api.js";
import Navbar from "../../../../../../components/Navbar.jsx";

// Custom hook for smooth scrolling
const useSmoothScroll = () => {
  const scrollTo = useCallback((element, offset = 100) => {
    if (!element) return;

    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }, []);

  return { scrollTo };
};

export default function PastPapersPage({ params }) {
  const router = useRouter();
  const [unwrappedParams, setUnwrappedParams] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const contentRef = useRef(null);
  const { scrollTo } = useSmoothScroll();

  // Check authentication status and user data
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userDataString = localStorage.getItem("userData");

    if (token && userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setIsLoggedIn(true);
        setUserData(userData);

        // Redirect based on role
        if (userData.role === "student") {
          router.push("/students/study");
          return;
        } else if (userData.role === "teacher") {
          router.push("/teachers/dashboard");
          return;
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, [router]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const slideInVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  const scaleInVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userDataString = localStorage.getItem("userData");

    if (token && userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setIsLoggedIn(true);
        setUserData(userData);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
      const timer = setTimeout(() => {
        setShowLoginModal(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [router]);

  // Unwrap params
  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params;
      setUnwrappedParams(resolvedParams);
    };
    unwrapParams();
  }, [params]);

  // Fetch past papers
  useEffect(() => {
    if (!unwrappedParams) return;
    fetchPastPapers();
  }, [unwrappedParams]);

  const fetchPastPapers = async () => {
    if (!unwrappedParams) return;

    try {
      setLoading(true);
      const { courseId, subjectId, examBoard } = unwrappedParams;
      const response = await getPastPapers(courseId, subjectId, examBoard);
      if (response.data.success) {
        setData(response.data.data);
        // Group papers by year and set default selection
        const papers = response.data.data.pastPapers?.papers || [];
        if (papers.length > 0) {
          const years = [...new Set(papers.map((paper) => paper.year))]
            .sort()
            .reverse();
          if (years.length > 0) {
            setSelectedYear(years[0]);
          }
        }
      } else {
        setError("Failed to load past papers");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load past papers");
    } finally {
      setLoading(false);
    }
  };

  const handleYearSelect = useCallback(
    (year) => {
      setSelectedYear(year);
      setSelectedPaper(null);

      setTimeout(() => {
        if (contentRef.current) {
          scrollTo(contentRef.current);
        }
      }, 100);
    },
    [scrollTo]
  );

  const handlePaperSelect = useCallback(
    (paper, index) => {
      // Only allow first paper for non-logged in users
      if (!isLoggedIn && index !== 0) {
        setShowUpgradeModal(true);
        return;
      }

      setSelectedPaper(paper);

      setTimeout(() => {
        if (contentRef.current) {
          scrollTo(contentRef.current);
        }
      }, 100);
    },
    [isLoggedIn, scrollTo]
  );

  const handleLoginRedirect = () => {
    router.push("/login");
  };

  const downloadPaper = (paper) => {
    if (!paper.signedPdfUrl) return;

    // Create a temporary link to trigger download
    const link = document.createElement("a");
    link.href = paper.signedPdfUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    // Extract filename from URL or use title
    const filename = paper.title.replace(/[^a-zA-Z0-9]/g, "_") + ".pdf";
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter and group papers
  const filteredAndGroupedPapers = useCallback(() => {
    if (!data?.pastPapers?.papers) return {};

    let filteredPapers = data.pastPapers.papers;

    // Apply search filter
    if (searchTerm) {
      filteredPapers = filteredPapers.filter(
        (paper) =>
          paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          paper.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          paper.paperNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== "all") {
      filteredPapers = filteredPapers.filter((paper) => {
        if (filterType === "question") {
          return paper.title.includes("(QP)");
        } else if (filterType === "marking") {
          return paper.title.includes("(MS)");
        }
        return true;
      });
    }

    // Group by year
    const grouped = {};
    filteredPapers.forEach((paper) => {
      if (!grouped[paper.year]) {
        grouped[paper.year] = [];
      }
      grouped[paper.year].push(paper);
    });

    return grouped;
  }, [data, searchTerm, filterType]);

  const groupedPapers = filteredAndGroupedPapers();
  const availableYears = Object.keys(groupedPapers).sort().reverse();

  if (!unwrappedParams || loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <motion.div
            className="flex flex-col items-center space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <motion.div
                className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="h-8 w-8 bg-blue-600 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>
            </div>
            <motion.div
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-lg font-semibold text-slate-700 mb-2">
                Loading Past Papers
              </p>
              <p className="text-sm text-slate-500">
                Preparing your examination materials...
              </p>
            </motion.div>
          </motion.div>
        </div>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <motion.div
            className="text-center max-w-md mx-auto p-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4"
              whileHover={{ scale: 1.05 }}
            >
              <svg
                className="w-8 h-8 text-rose-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </motion.div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">
              Unable to Load Papers
            </h2>
            <p className="text-slate-600 mb-6">
              {error || "No past papers available"}
            </p>
            <div className="flex gap-3 justify-center">
              <motion.button
                onClick={fetchPastPapers}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>Try Again</span>
              </motion.button>
              <Link href="/">
                <motion.div
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-white transition-all duration-300 flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
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
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  <span>Return Home</span>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  const { courseId, subjectId, examBoard } = unwrappedParams;
  const decodedExamBoard = decodeURIComponent(examBoard);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Login Modal */}
        <AnimatePresence>
          {showLoginModal && (
            <motion.div
              className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
                variants={scaleInVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <div className="text-center">
                  <motion.div
                    className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6"
                    whileHover={{ scale: 1.05 }}
                  >
                    <svg
                      className="w-10 h-10 text-blue-600"
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
                  </motion.div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">
                    Unlock Full Access
                  </h3>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    Get complete access to all past papers, designed
                    specifically for your syllabus
                  </p>
                  <div className="flex flex-col gap-3">
                    <motion.button
                      onClick={handleLoginRedirect}
                      className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Start Free Trial
                    </motion.button>
                    <motion.button
                      onClick={() => setShowLoginModal(false)}
                      className="w-full px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-300 font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Continue Browsing
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upgrade Modal */}
        <AnimatePresence>
          {showUpgradeModal && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
                variants={scaleInVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <div className="text-center">
                  <motion.div
                    className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6"
                    whileHover={{ scale: 1.05 }}
                  >
                    <svg
                      className="w-10 h-10 text-amber-600"
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
                  </motion.div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">
                    Premium Content
                  </h3>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    This past paper is available with a premium subscription.
                    Unlock all papers and marking schemes now!
                  </p>
                  <div className="flex flex-col gap-3">
                    <motion.button
                      onClick={handleLoginRedirect}
                      className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Upgrade Now
                    </motion.button>
                    <motion.button
                      onClick={() => setShowUpgradeModal(false)}
                      className="w-full px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-300 font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Maybe Later
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.header
          className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-40 shadow-sm"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <motion.div
                    className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 font-medium transition-colors group"
                    whileHover={{ x: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
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
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    <span>Back</span>
                  </motion.div>
                </Link>
                <div className="h-6 w-px bg-slate-300 hidden sm:block"></div>
                <div>
                  <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {data.course?.name} - {data.subject?.name}
                  </h1>
                  <p className="text-sm text-slate-500 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
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
                    {decodedExamBoard} • Past Papers
                  </p>
                </div>
              </div>
              {!isLoggedIn && (
                <motion.div
                  className="flex items-center space-x-2 text-amber-700 bg-amber-50 px-4 py-2 rounded-full text-sm border border-amber-200"
                  whileHover={{ scale: 1.05 }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">Limited Access</span>
                </motion.div>
              )}
            </div>
          </div>
        </motion.header>

        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar - Years Navigation */}
            <motion.div
              className="lg:w-80 flex-shrink-0"
              variants={slideInVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 p-6 sticky top-24">
                {/* Search and Filter */}
                <div className="mb-6">
                  <div className="relative mb-4">
                    <input
                      type="text"
                      placeholder="Search papers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    />
                    <svg
                      className="w-5 h-5 text-slate-400 absolute right-3 top-3"
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

                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilterType("all")}
                      className={`px-3 py-2 text-sm rounded-lg transition-all duration-300 ${
                        filterType === "all"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      All
                    </button>
                  </div>
                </div>

                <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center">
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Years
                </h2>
                <motion.div
                  className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2 custom-scrollbar"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {availableYears.map((year, index) => {
                    const isLocked = !isLoggedIn && index !== 0;
                    const isSelected = selectedYear === year;
                    const yearPapers = groupedPapers[year] || [];
                    const questionPapers = yearPapers.filter((p) =>
                      p.title.includes("(QP)")
                    );
                    const markingSchemes = yearPapers.filter((p) =>
                      p.title.includes("(MS)")
                    );

                    return (
                      <motion.button
                        key={year}
                        onClick={() => handleYearSelect(year)}
                        disabled={isLocked}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 group relative ${
                          isSelected
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-400 shadow-md"
                            : isLocked
                            ? "bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed"
                            : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-md"
                        }`}
                        variants={itemVariants}
                        whileHover={!isLocked ? { scale: 1.02 } : {}}
                        whileTap={!isLocked ? { scale: 0.98 } : {}}
                      >
                        {isLocked && (
                          <div className="absolute top-3 right-3">
                            <svg
                              className="w-5 h-5 text-slate-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                        <div className="flex justify-between items-start pr-8">
                          <div className="flex-1">
                            <h3
                              className={`font-semibold mb-2 text-lg transition-colors ${
                                isSelected
                                  ? "text-blue-700"
                                  : isLocked
                                  ? "text-slate-500"
                                  : "text-slate-900 group-hover:text-blue-600"
                              }`}
                            >
                              {year}
                            </h3>
                            <div className="flex items-center space-x-4 text-xs text-slate-600">
                              <span className="flex items-center">
                                <svg
                                  className="w-3 h-3 mr-1 text-green-500"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {questionPapers.length} QP
                              </span>
                              <span className="flex items-center">
                                <svg
                                  className="w-3 h-3 mr-1 text-purple-500"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {markingSchemes.length} MS
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </motion.div>
              </div>
            </motion.div>

            {/* Main Content */}
            <div className="flex-1 min-w-0" ref={contentRef}>
              <AnimatePresence mode="wait">
                {selectedYear ? (
                  <motion.div
                    key={selectedYear}
                    className="space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Year Header */}
                    <motion.div
                      className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 p-8"
                      whileHover={{
                        boxShadow:
                          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                      }}
                    >
                      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-blue-100">
                        <h2 className="text-3xl font-bold text-slate-900">
                          {selectedYear} Past Papers
                        </h2>
                        <div className="flex items-center space-x-2 text-slate-600">
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
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <span>
                            {groupedPapers[selectedYear]?.length || 0} papers
                          </span>
                        </div>
                      </div>

                      {/* Papers Grid */}
                      <div className="grid gap-6">
                        {groupedPapers[selectedYear]?.map((paper, index) => {
                          const isLocked = !isLoggedIn && index !== 0;
                          const isSelected = selectedPaper?._id === paper._id;
                          const isQuestionPaper = paper.title.includes("(QP)");
                          const isMarkingScheme = paper.title.includes("(MS)");

                          return (
                            <motion.div
                              key={paper._id}
                              className={`border-2 rounded-xl p-6 transition-all duration-300 ${
                                isSelected
                                  ? "border-blue-400 bg-blue-50 shadow-lg"
                                  : isLocked
                                  ? "border-slate-200 bg-slate-50 opacity-70"
                                  : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-md cursor-pointer"
                              }`}
                              whileHover={!isLocked ? { y: -2 } : {}}
                              onClick={() => handlePaperSelect(paper, index)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-3">
                                    <div
                                      className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                                        isQuestionPaper
                                          ? "bg-green-100 text-green-800"
                                          : "bg-purple-100 text-purple-800"
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
                                      <span>
                                        {isQuestionPaper
                                          ? "Question Paper"
                                          : "Marking Scheme"}
                                      </span>
                                    </div>
                                    {isLocked && (
                                      <svg
                                        className="w-5 h-5 text-slate-400"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    )}
                                  </div>

                                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                                    {paper.title}
                                  </h3>

                                  {paper.description && (
                                    <p className="text-slate-600 mb-4 leading-relaxed">
                                      {paper.description}
                                    </p>
                                  )}

                                  <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                                    <div className="flex items-center space-x-1">
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
                                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                      </svg>
                                      <span>{paper.duration} minutes</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
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
                                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                      </svg>
                                      <span>{paper.totalMarks} marks</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
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
                                      <span>{paper.fileSize}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Paper Details */}
                              <AnimatePresence>
                                {isSelected && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="mt-6 pt-6 border-t border-slate-200"
                                  >
                                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-slate-900 mb-2">
                                          Paper Details
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600">
                                          <div>
                                            <span className="font-medium">
                                              Paper Number:
                                            </span>{" "}
                                            {paper.paperNumber}
                                          </div>
                                          <div>
                                            <span className="font-medium">
                                              Duration:
                                            </span>{" "}
                                            {paper.duration} minutes
                                          </div>
                                          <div>
                                            <span className="font-medium">
                                              Total Marks:
                                            </span>{" "}
                                            {paper.totalMarks}
                                          </div>
                                          <div>
                                            <span className="font-medium">
                                              File Size:
                                            </span>{" "}
                                            {paper.fileSize}
                                          </div>
                                        </div>
                                      </div>

                                      {!isLocked && paper.signedPdfUrl && (
                                        <motion.button
                                          onClick={() => downloadPaper(paper)}
                                          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2 font-semibold"
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
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
                                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                            />
                                          </svg>
                                          <span>Download PDF</span>
                                        </motion.button>
                                      )}
                                    </div>

                                    {paper.description && (
                                      <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                                        <p className="text-slate-700 text-sm leading-relaxed">
                                          {paper.description}
                                        </p>
                                      </div>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 p-12 text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <motion.div
                      className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6"
                      whileHover={{ scale: 1.1 }}
                    >
                      <svg
                        className="w-12 h-12 text-blue-600"
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
                    </motion.div>
                    <h3 className="text-3xl font-bold text-slate-900 mb-4">
                      Select a Year to Begin
                    </h3>
                    <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto">
                      Choose a year from the sidebar to view available past
                      papers and marking schemes.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Free Trial Banner */}
        <AnimatePresence>
          {!isLoggedIn && !showLoginModal && (
            <motion.div
              className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-2xl p-6 max-w-lg mx-4 border-2 border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <h4 className="font-bold text-lg mb-1">
                      🎓 Unlock All Past Papers
                    </h4>
                    <p className="text-blue-100 text-sm mb-3 leading-relaxed">
                      Get full access to comprehensive past papers and marking
                      schemes
                    </p>
                    <motion.button
                      onClick={() => setShowLoginModal(true)}
                      className="bg-white text-blue-600 px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 shadow-lg"
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Start Free Trial →
                    </motion.button>
                  </div>
                  <motion.button
                    onClick={() => {
                      const banner = document.querySelector(".fixed.bottom-6");
                      if (banner) banner.style.display = "none";
                    }}
                    className="ml-2 text-blue-200 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
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
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Smooth scroll behavior */
        html {
          scroll-behavior: smooth;
        }

        /* Custom selection */
        ::selection {
          background: rgba(59, 130, 246, 0.2);
        }
      `}</style>
    </>
  );
}
