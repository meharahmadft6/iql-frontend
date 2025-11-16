"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getRevisionNotes } from "../../../../../../api/study.api.js";
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

export default function RevisionNotesPage({ params }) {
  const router = useRouter();
  const [unwrappedParams, setUnwrappedParams] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSubTopic, setSelectedSubTopic] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [expandedSubTopicId, setExpandedSubTopicId] = useState(null);

  const contentRef = useRef(null);
  const subTopicRefs = useRef({});
  const { scrollTo } = useSmoothScroll();

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

  const expandVariants = {
    collapsed: {
      height: 0,
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    expanded: {
      height: "auto",
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      },
    },
  };

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
      // Show login modal after a delay for non-logged in users
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

  // Fetch revision notes
  useEffect(() => {
    if (!unwrappedParams) return;
    fetchRevisionNotes();
  }, [unwrappedParams]);

  const fetchRevisionNotes = async () => {
    if (!unwrappedParams) return;

    try {
      setLoading(true);
      const { courseId, subjectId, examBoard } = unwrappedParams;
      const response = await getRevisionNotes(courseId, subjectId, examBoard);
      if (response.data.success) {
        setData(response.data.data);
        // Set first topic as default
        if (response.data.data.revisionNotes?.topics?.length > 0) {
          const firstTopic = response.data.data.revisionNotes.topics[0];
          setSelectedTopic(firstTopic);
          if (firstTopic.subTopics?.length > 0) {
            setSelectedSubTopic(firstTopic.subTopics[0]);
            // Expand first sub-topic by default
            setExpandedSubTopicId(firstTopic.subTopics[0]._id);
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

  const handleTopicSelect = useCallback(
    (topic, index) => {
      // Only allow first topic for non-logged in users
      if (!isLoggedIn && index !== 0) {
        setShowUpgradeModal(true);
        return;
      }

      setSelectedTopic(topic);
      if (topic.subTopics?.length > 0) {
        setSelectedSubTopic(topic.subTopics[0]);
        setExpandedSubTopicId(topic.subTopics[0]._id);
      } else {
        setSelectedSubTopic(null);
        setExpandedSubTopicId(null);
      }

      // Smooth scroll to content
      setTimeout(() => {
        if (contentRef.current) {
          scrollTo(contentRef.current);
        }
      }, 100);
    },
    [isLoggedIn, scrollTo]
  );

  const handleSubTopicSelect = useCallback(
    (subTopic, index) => {
      // Only allow first sub-topic of first topic for non-logged in users
      if (!isLoggedIn && index !== 0) {
        setShowUpgradeModal(true);
        return;
      }

      if (expandedSubTopicId === subTopic._id) {
        setExpandedSubTopicId(null);
      } else {
        setExpandedSubTopicId(subTopic._id);
        setSelectedSubTopic(subTopic);

        // Smooth scroll to expanded content after animation
        setTimeout(() => {
          const element = subTopicRefs.current[subTopic._id];
          if (element) {
            scrollTo(element);
          }
        }, 400);
      }
    },
    [isLoggedIn, expandedSubTopicId, scrollTo]
  );

  const handleLoginRedirect = () => {
    router.push("/login");
  };

  const getContentPreview = useCallback((content, maxLength = 80) => {
    if (!content) return "";
    const cleanContent = content
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/\n/g, " ");
    if (cleanContent.length <= maxLength) return cleanContent;
    return cleanContent.substring(0, maxLength) + "...";
  }, []);

  const formatContent = useCallback((content) => {
    if (!content) return [];

    return content.split("\n").map((paragraph, index) => {
      if (!paragraph.trim()) return <br key={index} />;

      let formattedParagraph = paragraph;

      // Check if line starts with **text** (heading pattern)
      const isHeading = /^\*\*(.*?)\*\*/.test(formattedParagraph);

      if (isHeading) {
        formattedParagraph = formattedParagraph.replace(
          /^\*\*(.*?)\*\*/,
          "<strong class='text-xl font-bold text-slate-900 block mb-4 mt-8 pb-2 border-b border-slate-200'>$1</strong>"
        );
      } else {
        // Handle bold text
        formattedParagraph = formattedParagraph.replace(
          /\*\*(.*?)\*\*/g,
          "<strong class='font-semibold text-slate-900 bg-yellow-50 px-1 rounded'>$1</strong>"
        );
      }

      // Handle italic text
      formattedParagraph = formattedParagraph.replace(
        /\*(.*?)\*/g,
        "<em class='italic text-slate-700'>$1</em>"
      );

      // Handle bullet points
      if (paragraph.trim().startsWith("-")) {
        return (
          <motion.li
            key={index}
            className="text-slate-700 leading-relaxed ml-6 mb-3 relative"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            dangerouslySetInnerHTML={{
              __html: formattedParagraph.replace(/^-\s*/, ""),
            }}
          />
        );
      }

      return (
        <motion.p
          key={index}
          className="text-slate-700 leading-relaxed mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.03 }}
          dangerouslySetInnerHTML={{ __html: formattedParagraph }}
        />
      );
    });
  }, []);

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
                Loading Revision Notes
              </p>
              <p className="text-sm text-slate-500">
                Preparing your study materials...
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
              Unable to Load Notes
            </h2>
            <p className="text-slate-600 mb-6">
              {error || "No revision notes available"}
            </p>
            <div className="flex gap-3 justify-center">
              <motion.button
                onClick={fetchRevisionNotes}
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
                    Get complete access to all revision notes, designed
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
                    This topic is available with a premium subscription. Unlock
                    all topics and study materials now!
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
                    {decodedExamBoard} • Revision Notes
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
            {/* Sidebar - Topics Navigation */}
            <motion.div
              className="lg:w-80 flex-shrink-0"
              variants={slideInVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 p-6 sticky top-24">
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
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  Topics
                </h2>
                <motion.div
                  className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {data.revisionNotes?.topics?.map((topic, index) => {
                    const isLocked = !isLoggedIn && index !== 0;
                    const isSelected = selectedTopic?._id === topic._id;

                    return (
                      <motion.button
                        key={topic._id || index}
                        onClick={() => handleTopicSelect(topic, index)}
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
                              className={`font-semibold mb-2 text-sm transition-colors ${
                                isSelected
                                  ? "text-blue-700"
                                  : isLocked
                                  ? "text-slate-500"
                                  : "text-slate-900 group-hover:text-blue-600"
                              }`}
                            >
                              {topic.title}
                            </h3>
                            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                              {getContentPreview(topic.content)}
                            </p>
                            <div className="mt-2 flex items-center text-xs text-slate-500">
                              <svg
                                className="w-3 h-3 mr-1"
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
                              {topic.subTopics?.length || 0} sections
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
                {selectedTopic ? (
                  <motion.div
                    key={selectedTopic._id}
                    className="space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Topic Header */}
                    <motion.div
                      className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 p-8"
                      whileHover={{
                        boxShadow:
                          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                      }}
                    >
                      <h2 className="text-3xl font-bold text-slate-900 mb-6 pb-4 border-b-2 border-blue-100">
                        {selectedTopic.title}
                      </h2>
                      <div className="prose prose-lg max-w-none">
                        {formatContent(selectedTopic.content)}
                      </div>

                      {/* Topic Images */}
                      {selectedTopic.images &&
                        selectedTopic.images.length > 0 && (
                          <motion.div
                            className="mt-8 pt-6 border-t border-slate-200"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                          >
                            <h3 className="text-xl font-bold text-slate-900 mb-5 flex items-center">
                              <svg
                                className="w-6 h-6 mr-2 text-blue-600"
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
                              Related Images
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {selectedTopic.images.map((image, index) => (
                                <motion.div
                                  key={index}
                                  className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-5 border border-slate-200"
                                  whileHover={{
                                    scale: 1.02,
                                    boxShadow:
                                      "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                                  }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 300,
                                  }}
                                >
                                  <div className="bg-white rounded-lg p-3 mb-3">
                                    <motion.img
                                      src={image.signedUrl || image.url}
                                      alt={image.altText || selectedTopic.title}
                                      className="w-full h-auto rounded-lg shadow-sm max-h-80 object-contain"
                                      onError={(e) => {
                                        e.target.style.display = "none";
                                      }}
                                      whileHover={{ scale: 1.05 }}
                                      transition={{ duration: 0.3 }}
                                    />
                                  </div>
                                  {image.caption && (
                                    <p className="text-sm text-slate-600 text-center font-medium">
                                      {image.caption}
                                    </p>
                                  )}
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                    </motion.div>

                    {/* Sub-topics Section */}
                    {selectedTopic.subTopics &&
                      selectedTopic.subTopics.length > 0 && (
                        <motion.div
                          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 p-8"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center pb-4 border-b-2 border-blue-100">
                            <svg
                              className="w-6 h-6 mr-2 text-blue-600"
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
                            Sections
                          </h3>
                          <div className="space-y-4">
                            {selectedTopic.subTopics.map((subTopic, index) => {
                              const isLocked = !isLoggedIn && index !== 0;
                              const isExpanded =
                                expandedSubTopicId === subTopic._id;

                              return (
                                <motion.div
                                  key={subTopic._id || index}
                                  className={`border-2 rounded-xl overflow-hidden ${
                                    isExpanded
                                      ? "border-blue-400 bg-blue-50 shadow-lg"
                                      : isLocked
                                      ? "border-slate-200 bg-slate-50 opacity-70"
                                      : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-md"
                                  }`}
                                  whileHover={!isLocked ? { y: -2 } : {}}
                                  transition={{
                                    type: "spring",
                                    stiffness: 300,
                                  }}
                                >
                                  <motion.button
                                    onClick={() =>
                                      handleSubTopicSelect(subTopic, index)
                                    }
                                    disabled={isLocked}
                                    className={`w-full text-left p-5 flex items-center justify-between ${
                                      isLocked ? "cursor-not-allowed" : ""
                                    } ${isExpanded ? "bg-blue-50" : ""}`}
                                    whileHover={
                                      !isLocked
                                        ? {
                                            backgroundColor:
                                              "rgba(59, 130, 246, 0.05)",
                                          }
                                        : {}
                                    }
                                  >
                                    <div className="flex-1 pr-4">
                                      <div className="flex items-center justify-between mb-2">
                                        <h4
                                          className={`font-bold text-lg ${
                                            isExpanded
                                              ? "text-blue-700"
                                              : isLocked
                                              ? "text-slate-500"
                                              : "text-slate-900"
                                          }`}
                                        >
                                          {subTopic.title}
                                        </h4>
                                        {isLocked && (
                                          <svg
                                            className="w-5 h-5 text-slate-400 mr-2"
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
                                      {!isExpanded && (
                                        <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
                                          {getContentPreview(
                                            subTopic.content,
                                            120
                                          )}
                                        </p>
                                      )}
                                    </div>
                                    <motion.svg
                                      className={`w-6 h-6 text-slate-400 flex-shrink-0 ${
                                        isExpanded ? "text-blue-600" : ""
                                      }`}
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                      animate={{ rotate: isExpanded ? 180 : 0 }}
                                      transition={{ duration: 0.3 }}
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                      />
                                    </motion.svg>
                                  </motion.button>

                                  {/* Expanded Content */}
                                  <AnimatePresence>
                                    {isExpanded && (
                                      <motion.div
                                        ref={(el) =>
                                          (subTopicRefs.current[subTopic._id] =
                                            el)
                                        }
                                        variants={expandVariants}
                                        initial="collapsed"
                                        animate="expanded"
                                        exit="collapsed"
                                        className="overflow-hidden"
                                      >
                                        <div className="px-5 pb-5 border-t-2 border-blue-200 pt-5 bg-white">
                                          {/* Sub-topic Image */}
                                          {subTopic.image?.signedUrl && (
                                            <motion.div
                                              className="mb-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-5 border border-slate-200"
                                              initial={{ opacity: 0, y: 20 }}
                                              animate={{ opacity: 1, y: 0 }}
                                              transition={{ delay: 0.2 }}
                                            >
                                              <div className="bg-white rounded-lg p-4">
                                                <motion.img
                                                  src={subTopic.image.signedUrl}
                                                  alt={
                                                    subTopic.image.altText ||
                                                    subTopic.title
                                                  }
                                                  className="w-full h-auto rounded-lg shadow-md max-w-4xl mx-auto max-h-96 object-contain"
                                                  onError={(e) => {
                                                    e.target.style.display =
                                                      "none";
                                                  }}
                                                  whileHover={{ scale: 1.02 }}
                                                  transition={{ duration: 0.3 }}
                                                />
                                              </div>
                                              {subTopic.image.caption && (
                                                <p className="text-sm text-slate-600 text-center mt-3 font-medium">
                                                  {subTopic.image.caption}
                                                </p>
                                              )}
                                            </motion.div>
                                          )}

                                          {/* Sub-topic Content */}
                                          <motion.div
                                            className="prose prose-lg max-w-none"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                          >
                                            {formatContent(subTopic.content)}
                                          </motion.div>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </motion.div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
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
                      Select a Topic to Begin
                    </h3>
                    <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto">
                      Choose a topic from the sidebar to start exploring
                      comprehensive revision notes.
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
                      🎓 Unlock All Revision Notes
                    </h4>
                    <p className="text-blue-100 text-sm mb-3 leading-relaxed">
                      Get full access to comprehensive study materials tailored
                      to your syllabus
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

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .prose {
          color: #334155;
        }

        .prose strong {
          color: #0f172a;
          font-weight: 600;
        }

        .prose ul {
          list-style-type: disc;
          padding-left: 1.5rem;
        }

        .prose li {
          margin-bottom: 0.5rem;
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
