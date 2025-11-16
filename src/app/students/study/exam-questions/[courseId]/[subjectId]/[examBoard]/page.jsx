"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getExamQuestions } from "../../../../../../../api/study.api.js";
import StudentDashboardLayout from "../../../../../../layout/student/DashboardLayout";

// Install these dependencies: npm install framer-motion lucide-react
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  Check,
  X,
  BookOpen,
  BarChart3,
  Clock,
  Award,
  HelpCircle,
  Lightbulb,
  Home,
  RefreshCw,
  Maximize2,
  Minimize2,
  LogIn,
  Eye,
  EyeOff,
  FolderOpen,
  FileText,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Download,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Target,
  Zap,
  Brain,
  Crown,
  Star,
  Bookmark,
  Share2,
  RotateCcw,
} from "lucide-react";

export default function ExamQuestionsPage({ params }) {
  const router = useRouter();
  const [unwrappedParams, setUnwrappedParams] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSubsection, setSelectedSubsection] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [expandedTopics, setExpandedTopics] = useState(new Set());
  const [completedSubsections, setCompletedSubsections] = useState(new Set());
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [nextSubsection, setNextSubsection] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showFullScreenPrompt, setShowFullScreenPrompt] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState(new Set());
  const [showQuickNav, setShowQuickNav] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    streak: 0,
    maxStreak: 0,
  });
  const questionRef = useRef(null);

  // Sound effects
  const playSound = (type) => {
    if (!soundEnabled) return;

    // In a real app, you would use actual sound files
    console.log(`Playing sound: ${type}`);
  };

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userDataString = localStorage.getItem("userData");
    setIsLoggedIn(!!token && !!userDataString);

    if (token && userDataString) {
      try {
        setUserData(JSON.parse(userDataString));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.log(
          `Error attempting to enable full-screen mode: ${err.message}`
        );
      });
      setIsFullScreen(true);
      setShowFullScreenPrompt(false);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };

  // Auto-suggest fullscreen on component mount
  useEffect(() => {
    if (!document.fullscreenElement) {
      const timer = setTimeout(() => {
        setShowFullScreenPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
      setShowFullScreenPrompt(false);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
  }, []);

  // Unwrap params
  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params;
      setUnwrappedParams(resolvedParams);
    };
    unwrapParams();
  }, [params]);

  // Fetch exam questions when params are available
  useEffect(() => {
    if (
      unwrappedParams?.courseId &&
      unwrappedParams?.subjectId &&
      unwrappedParams?.examBoard
    ) {
      fetchExamQuestions();
    }
  }, [unwrappedParams]);

  const fetchExamQuestions = async () => {
    try {
      setLoading(true);
      const { courseId, subjectId, examBoard } = unwrappedParams;
      const response = await getExamQuestions(courseId, subjectId, examBoard);

      if (response.data.success) {
        setData(response.data.data);
        // Auto-select first topic and first subsection if available
        if (response.data.data.examQuestions?.topics?.length > 0) {
          const firstTopic = response.data.data.examQuestions.topics[0];
          setSelectedTopic(firstTopic);
          setExpandedTopics(new Set([firstTopic._id]));

          if (firstTopic.subSections?.length > 0) {
            setSelectedSubsection(firstTopic.subSections[0]);
          }
        }
      } else {
        setError("Failed to load exam questions");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load exam questions");
    } finally {
      setLoading(false);
    }
  };

  // Get all questions from selected subsection
  const getQuestions = () => {
    if (!selectedSubsection) return [];
    return selectedSubsection.mcqs || [];
  };

  const questions = getQuestions();
  const currentQuestion = questions[currentQuestionIndex];

  // Check if current subsection is completed
  useEffect(() => {
    if (selectedSubsection && questions.length > 0) {
      const allAnswered = questions.every((question) =>
        answeredQuestions.has(question._id)
      );

      if (allAnswered && !completedSubsections.has(selectedSubsection._id)) {
        const newCompleted = new Set(completedSubsections);
        newCompleted.add(selectedSubsection._id);
        setCompletedSubsections(newCompleted);

        // Find next subsection
        const currentTopic = data.examQuestions.topics.find((topic) =>
          topic.subSections?.some((sub) => sub._id === selectedSubsection._id)
        );

        if (currentTopic) {
          const currentIndex = currentTopic.subSections.findIndex(
            (sub) => sub._id === selectedSubsection._id
          );
          const nextSub = currentTopic.subSections[currentIndex + 1];
          setNextSubsection(nextSub);
          setShowCompletionModal(true);
          playSound("completion");
        }
      }
    }
  }, [
    answeredQuestions,
    selectedSubsection,
    questions,
    completedSubsections,
    data,
  ]);

  // Scroll to question when it changes
  useEffect(() => {
    if (questionRef.current) {
      questionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [currentQuestionIndex]);

  const handleAnswerSelect = (selectedOption) => {
    if (!currentQuestion || answeredQuestions.has(currentQuestion._id)) return;

    // Check if user is logged in for questions beyond the first one
    if (currentQuestionIndex > 0 && !isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    const isCorrect = selectedOption === currentQuestion.correctOption;

    // Update session stats
    setSessionStats((prev) => {
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      return {
        correct: isCorrect ? prev.correct + 1 : prev.correct,
        incorrect: isCorrect ? prev.incorrect : prev.incorrect + 1,
        streak: newStreak,
        maxStreak: Math.max(prev.maxStreak, newStreak),
      };
    });

    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion._id]: {
        selected: selectedOption,
        isCorrect,
        correctOption: currentQuestion.correctOption,
        timestamp: new Date().toISOString(),
      },
    }));
    setAnsweredQuestions((prev) => new Set([...prev, currentQuestion._id]));

    // Play sound and show explanation
    if (isCorrect) {
      playSound("correct");
    } else {
      playSound("incorrect");
      setShowExplanation(true);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      if (currentQuestionIndex >= 0 && !isLoggedIn) {
        setShowLoginModal(true);
        return;
      }
      setCurrentQuestionIndex((prev) => prev + 1);
      setShowExplanation(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setShowExplanation(false);
    }
  };

  const handleQuestionNavigation = (index) => {
    if (index > 0 && !isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    setCurrentQuestionIndex(index);
    setShowExplanation(false);
  };

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    if (topic.subSections?.length > 0) {
      setSelectedSubsection(topic.subSections[0]);
    } else {
      setSelectedSubsection(null);
    }
    setCurrentQuestionIndex(0);
    setShowExplanation(false);
    setExpandedTopics((prev) => new Set([...prev, topic._id]));
  };

  const handleSubsectionSelect = (subsection) => {
    setSelectedSubsection(subsection);
    setCurrentQuestionIndex(0);
    setShowExplanation(false);
    setShowCompletionModal(false);
  };

  const handleNextSubsection = () => {
    if (nextSubsection) {
      handleSubsectionSelect(nextSubsection);
    }
    setShowCompletionModal(false);
  };

  const toggleTopicExpansion = (topicId) => {
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

  const toggleBookmark = (questionId) => {
    setBookmarkedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
        playSound("bookmark");
      }
      return newSet;
    });
  };

  const handleLoginRedirect = () => {
    router.push("/login");
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const resetSession = () => {
    setSessionStats({
      correct: 0,
      incorrect: 0,
      streak: 0,
      maxStreak: 0,
    });
  };

  // Get progress for current subsection
  const getCurrentProgress = () => {
    if (!selectedSubsection || questions.length === 0) return 0;
    const answeredInSubsection = questions.filter((question) =>
      answeredQuestions.has(question._id)
    ).length;
    return (answeredInSubsection / questions.length) * 100;
  };

  // Get overall progress for the entire course
  const getOverallProgress = () => {
    if (!data?.examQuestions?.topics) return 0;

    let totalQuestions = 0;
    let totalAnswered = 0;

    data.examQuestions.topics.forEach((topic) => {
      topic.subSections?.forEach((subsection) => {
        const subsectionQuestions = subsection.mcqs || [];
        totalQuestions += subsectionQuestions.length;
        totalAnswered += subsectionQuestions.filter((question) =>
          answeredQuestions.has(question._id)
        ).length;
      });
    });

    return totalQuestions > 0 ? (totalAnswered / totalQuestions) * 100 : 0;
  };

  // Get accuracy for current session
  const getSessionAccuracy = () => {
    const total = sessionStats.correct + sessionStats.incorrect;
    return total > 0 ? Math.round((sessionStats.correct / total) * 100) : 0;
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "medium":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "hard":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  // Get option color based on answer state
  const getOptionColor = (optionIndex) => {
    if (!currentQuestion || !answeredQuestions.has(currentQuestion._id)) {
      return "bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50";
    }

    const userAnswer = userAnswers[currentQuestion._id];

    if (optionIndex === userAnswer.selected) {
      return userAnswer.isCorrect
        ? "bg-emerald-50 border-emerald-500 text-emerald-700"
        : "bg-rose-50 border-rose-500 text-rose-700";
    }

    if (optionIndex === userAnswer.correctOption) {
      return "bg-emerald-50 border-emerald-500 text-emerald-700";
    }

    return "bg-white border-slate-200";
  };

  // Get option icon based on answer state
  const getOptionIcon = (optionIndex) => {
    if (!currentQuestion || !answeredQuestions.has(currentQuestion._id)) {
      return (
        <div className="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center">
          <span className="text-xs font-semibold text-slate-400">○</span>
        </div>
      );
    }

    const userAnswer = userAnswers[currentQuestion._id];

    if (optionIndex === userAnswer.correctOption) {
      return (
        <div className="w-6 h-6 rounded-full border-2 border-emerald-500 bg-emerald-500 flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      );
    }

    if (optionIndex === userAnswer.selected && !userAnswer.isCorrect) {
      return (
        <div className="w-6 h-6 rounded-full border-2 border-rose-500 bg-rose-500 flex items-center justify-center">
          <X className="w-3 h-3 text-white" />
        </div>
      );
    }

    return (
      <div className="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center">
        <span className="text-xs font-semibold text-slate-400">○</span>
      </div>
    );
  };

  const isQuestionLocked = (index) => {
    return !isLoggedIn && index > 0;
  };

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  const questionVariants = {
    initial: { opacity: 0, x: 50 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -50 },
  };

  // Show loading while unwrapping params
  if (!unwrappedParams || loading) {
    return (
      <StudentDashboardLayout title="Exam Questions">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center space-y-6"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Brain className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold text-slate-700">
                Loading Exam Questions
              </p>
              <p className="text-sm text-slate-500">
                Preparing your ultimate learning experience...
              </p>
            </div>
          </motion.div>
        </div>
      </StudentDashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <StudentDashboardLayout title="Exam Questions">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md mx-auto p-8"
          >
            <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-10 h-10 text-rose-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">
              Unable to Load Questions
            </h2>
            <p className="text-slate-600 mb-6">
              {error || "No exam questions available"}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={fetchExamQuestions}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
              <Link
                href="/students/study"
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-white transition-all duration-300 flex items-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>Back to Study</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </StudentDashboardLayout>
    );
  }

  const { courseId, subjectId, examBoard } = unwrappedParams;
  const decodedExamBoard = decodeURIComponent(examBoard);
  const currentProgress = getCurrentProgress();
  const overallProgress = getOverallProgress();
  const answeredInCurrent = questions.filter((question) =>
    answeredQuestions.has(question._id)
  ).length;
  const sessionAccuracy = getSessionAccuracy();

  return (
    <StudentDashboardLayout
      title={`${data.course?.name} - ${data.subject?.name}`}
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Enhanced Completion Modal */}
        <AnimatePresence>
          {showCompletionModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 50 }}
                className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center relative overflow-hidden"
              >
                {/* Background decoration */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-blue-500"></div>
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-100 rounded-full opacity-50"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-100 rounded-full opacity-50"></div>

                <div className="relative z-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <Crown className="w-10 h-10 text-emerald-600" />
                  </motion.div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-3">
                    Section Mastered!
                  </h3>
                  <p className="text-slate-600 mb-2 text-lg">
                    <strong>{selectedSubsection?.name}</strong>
                  </p>
                  <p className="text-sm text-slate-500 mb-6">
                    Excellent! You've completed all {questions.length} questions
                    with {sessionAccuracy}% accuracy.
                  </p>

                  {nextSubsection ? (
                    <div className="space-y-4">
                      <p className="text-sm text-slate-600">
                        Ready for the next challenge?
                      </p>
                      <button
                        onClick={handleNextSubsection}
                        className="w-full px-6 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 transform hover:scale-105"
                      >
                        <ArrowRight className="w-5 h-5" />
                        <span className="font-semibold">
                          Continue to {nextSubsection.name}
                        </span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-slate-600">
                        You've conquered all sections in this topic! 🎉
                      </p>
                      <button
                        onClick={() => setShowCompletionModal(false)}
                        className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <span className="font-semibold">Review Progress</span>
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Login Modal */}
        <AnimatePresence>
          {showLoginModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
              >
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">
                    Unlock Full Access
                  </h3>
                  <p className="text-slate-600 mb-2">
                    Login to access all questions, track progress, and unlock
                    premium features.
                  </p>
                  <p className="text-sm text-slate-500 mb-6">
                    You're currently in demo mode with limited access.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => setShowLoginModal(false)}
                      className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-300 flex items-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Continue Demo</span>
                    </button>
                    <button
                      onClick={handleLoginRedirect}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2 transform hover:scale-105"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Login Now</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Header */}
        <header className="bg-white/90 backdrop-blur-lg border-b border-slate-200/60 sticky top-0 z-40 shadow-sm">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <Link
                  href="/students/study"
                  className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 font-medium transition-all duration-300 group hover:bg-blue-50 px-3 py-2 rounded-xl"
                >
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  <span>Back to Study</span>
                </Link>
                <div className="h-6 w-px bg-slate-300 hidden sm:block"></div>
                <div className="max-w-xs sm:max-w-md">
                  <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
                    {data.course?.name} - {data.subject?.name}
                  </h1>
                  <p className="text-sm text-slate-500 flex items-center truncate">
                    <BookOpen className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">
                      {decodedExamBoard} • Exam Mastery
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                {/* Session Stats */}
                {(sessionStats.correct > 0 || sessionStats.incorrect > 0) && (
                  <div className="flex items-center space-x-4 bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-slate-200">
                    <div className="text-center">
                      <div className="text-lg font-bold text-emerald-600">
                        {sessionStats.correct}
                      </div>
                      <div className="text-xs text-slate-500">Correct</div>
                    </div>
                    <div className="h-8 w-px bg-slate-300"></div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-rose-600">
                        {sessionStats.incorrect}
                      </div>
                      <div className="text-xs text-slate-500">Incorrect</div>
                    </div>
                    <div className="h-8 w-px bg-slate-300"></div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {sessionAccuracy}%
                      </div>
                      <div className="text-xs text-slate-500">Accuracy</div>
                    </div>
                    <button
                      onClick={resetSession}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Reset Session"
                    >
                      <RotateCcw className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                )}

                {/* Control Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleSound}
                    className={`p-3 rounded-xl transition-all duration-300 ${
                      soundEnabled
                        ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                    title={soundEnabled ? "Mute sounds" : "Enable sounds"}
                  >
                    {soundEnabled ? (
                      <Volume2 className="w-5 h-5" />
                    ) : (
                      <VolumeX className="w-5 h-5" />
                    )}
                  </button>

                  <button
                    onClick={toggleSidebar}
                    className="p-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all duration-300"
                    title={sidebarVisible ? "Hide sidebar" : "Show sidebar"}
                  >
                    {sidebarVisible ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>

                  <button
                    onClick={toggleFullScreen}
                    className="p-3 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-all duration-300"
                    title={
                      isFullScreen ? "Exit fullscreen" : "Enter fullscreen"
                    }
                  >
                    {isFullScreen ? (
                      <Minimize2 className="w-5 h-5" />
                    ) : (
                      <Maximize2 className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {!isLoggedIn && (
                  <div className="flex items-center space-x-2 text-amber-700 bg-amber-50 px-4 py-2 rounded-full text-sm border border-amber-200">
                    <HelpCircle className="w-4 h-4" />
                    <span>Login for full access</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Enhanced Sidebar */}
            <AnimatePresence>
              {sidebarVisible && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ type: "spring", damping: 25 }}
                  className="lg:w-80 flex-shrink-0"
                >
                  <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-lg border border-slate-200/60 p-6 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
                    {/* Enhanced Overall Progress */}
                    <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/60">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-blue-900 flex items-center">
                          <Target className="w-4 h-4 mr-2" />
                          Overall Progress
                        </span>
                        <span className="text-lg font-bold text-blue-700">
                          {Math.round(overallProgress)}%
                        </span>
                      </div>
                      <div className="w-full bg-blue-200/50 rounded-full h-3 mb-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${overallProgress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full relative"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-30 animate-pulse"></div>
                        </motion.div>
                      </div>
                      <p className="text-xs text-blue-700 text-right">
                        Master your exam preparation
                      </p>
                    </div>

                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                      <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                      Exam Topics
                    </h2>

                    <div className="space-y-3">
                      {data.examQuestions?.topics?.map((topic, index) => {
                        const topicProgress =
                          topic.subSections?.reduce((total, sub) => {
                            const subQuestions = sub.mcqs || [];
                            const answeredInSub = subQuestions.filter((q) =>
                              answeredQuestions.has(q._id)
                            ).length;
                            return total + answeredInSub;
                          }, 0) || 0;

                        const totalTopicQuestions = topic.totalQuestions || 0;
                        const topicPercentage =
                          totalTopicQuestions > 0
                            ? (topicProgress / totalTopicQuestions) * 100
                            : 0;

                        return (
                          <div key={topic._id || index} className="space-y-2">
                            {/* Enhanced Topic Header */}
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => toggleTopicExpansion(topic._id)}
                              className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 group ${
                                selectedTopic?._id === topic._id
                                  ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 shadow-lg"
                                  : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-md"
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors text-sm truncate">
                                      {topic.name}
                                    </h3>
                                    {topicPercentage === 100 && (
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="flex-shrink-0"
                                      >
                                        <Crown className="w-4 h-4 text-amber-500" />
                                      </motion.div>
                                    )}
                                  </div>
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs text-slate-500 flex items-center">
                                      <FolderOpen className="w-3 h-3 mr-1" />
                                      {topicProgress}/{totalTopicQuestions} •{" "}
                                      {topic.subSections?.length || 0} sections
                                    </p>
                                  </div>
                                  {totalTopicQuestions > 0 && (
                                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{
                                          width: `${topicPercentage}%`,
                                        }}
                                        transition={{
                                          duration: 1,
                                          ease: "easeOut",
                                        }}
                                        className={`h-2 rounded-full ${
                                          topicPercentage === 100
                                            ? "bg-gradient-to-r from-emerald-400 to-green-500"
                                            : "bg-gradient-to-r from-blue-400 to-purple-500"
                                        }`}
                                      />
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
                                  {selectedTopic?._id === topic._id && (
                                    <motion.div
                                      animate={{ scale: [1, 1.2, 1] }}
                                      transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                      }}
                                      className="w-2 h-2 bg-blue-500 rounded-full"
                                    />
                                  )}
                                  <ChevronRight
                                    className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
                                      expandedTopics.has(topic._id)
                                        ? "rotate-90"
                                        : ""
                                    }`}
                                  />
                                </div>
                              </div>
                            </motion.button>

                            {/* Enhanced SubSections */}
                            <AnimatePresence>
                              {expandedTopics.has(topic._id) && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="ml-4 space-y-2 overflow-hidden"
                                >
                                  {topic.subSections?.map(
                                    (subsection, subIndex) => {
                                      const subQuestions =
                                        subsection.mcqs || [];
                                      const answeredInSub = subQuestions.filter(
                                        (q) => answeredQuestions.has(q._id)
                                      ).length;
                                      const subPercentage =
                                        subQuestions.length > 0
                                          ? (answeredInSub /
                                              subQuestions.length) *
                                            100
                                          : 0;
                                      const isCompleted = subPercentage === 100;

                                      return (
                                        <motion.button
                                          key={subsection._id || subIndex}
                                          whileHover={{ scale: 1.01, x: 4 }}
                                          whileTap={{ scale: 0.99 }}
                                          onClick={() => {
                                            handleTopicSelect(topic);
                                            handleSubsectionSelect(subsection);
                                          }}
                                          className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group ${
                                            selectedSubsection?._id ===
                                            subsection._id
                                              ? "bg-blue-50 border-blue-200 shadow-md"
                                              : "bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                                          } ${
                                            isCompleted
                                              ? "ring-2 ring-emerald-200"
                                              : ""
                                          }`}
                                        >
                                          <div className="flex items-center space-x-3">
                                            <div className="flex-shrink-0">
                                              {isCompleted ? (
                                                <motion.div
                                                  initial={{ scale: 0 }}
                                                  animate={{ scale: 1 }}
                                                  className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center"
                                                >
                                                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                                                </motion.div>
                                              ) : (
                                                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                                  <FileText className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                                                </div>
                                              )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center justify-between mb-1">
                                                <p
                                                  className={`text-sm font-medium truncate ${
                                                    isCompleted
                                                      ? "text-emerald-700"
                                                      : "text-slate-700"
                                                  }`}
                                                >
                                                  {subsection.name}
                                                </p>
                                                <span className="text-xs text-slate-500 ml-2 flex-shrink-0">
                                                  {answeredInSub}/
                                                  {subQuestions.length}
                                                </span>
                                              </div>
                                              {subQuestions.length > 0 && (
                                                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                                  <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{
                                                      width: `${subPercentage}%`,
                                                    }}
                                                    transition={{
                                                      duration: 0.8,
                                                      ease: "easeOut",
                                                    }}
                                                    className={`h-1.5 rounded-full ${
                                                      isCompleted
                                                        ? "bg-gradient-to-r from-emerald-400 to-green-500"
                                                        : "bg-gradient-to-r from-blue-400 to-purple-500"
                                                    }`}
                                                  />
                                                </div>
                                              )}
                                            </div>
                                          </div>

                                          {/* Enhanced PDF Download Button */}
                                          {subsection.pdfUrl && (
                                            <div className="mt-3 flex justify-end">
                                              <a
                                                href={subsection.pdfUrl}
                                                download
                                                onClick={(e) =>
                                                  e.stopPropagation()
                                                }
                                                className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-300 transform hover:scale-105 shadow-sm"
                                              >
                                                <Download className="w-3 h-3" />
                                                <span>Download PDF</span>
                                              </a>
                                            </div>
                                          )}
                                        </motion.button>
                                      );
                                    }
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Enhanced Main Content */}
            <div
              className={`flex-1 min-w-0 ${
                !sidebarVisible ? "lg:mx-auto lg:max-w-5xl" : ""
              }`}
            >
              <AnimatePresence mode="wait">
                {selectedTopic && selectedSubsection && currentQuestion ? (
                  <motion.div
                    key="questions"
                    variants={pageVariants}
                    initial="initial"
                    animate="in"
                    exit="out"
                    transition={{ duration: 0.4 }}
                    className="space-y-6"
                  >
                    {/* Enhanced Progress Header */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/90 backdrop-blur-md rounded-3xl shadow-lg border border-slate-200/60 p-6 md:p-8"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                              <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h2 className="text-2xl font-bold text-slate-900 truncate">
                                {selectedTopic.name}
                              </h2>
                              <p className="text-slate-600 flex items-center text-sm mt-1">
                                <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span className="truncate">
                                  {selectedSubsection.name}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 flex-shrink-0">
                          <span
                            className={`px-4 py-2 text-sm font-semibold rounded-2xl border-2 flex items-center ${getDifficultyColor(
                              currentQuestion.difficulty
                            )}`}
                          >
                            <Award className="w-4 h-4 mr-2" />
                            {currentQuestion.difficulty}
                          </span>
                          <span className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-2xl border-2 border-slate-200 flex items-center whitespace-nowrap">
                            <Zap className="w-4 h-4 mr-2" />
                            {currentQuestion.marks} mark
                            {currentQuestion.marks > 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      {/* Enhanced Progress Bar */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-600 font-medium">
                            Section Progress
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-slate-700">
                              {answeredInCurrent} of {questions.length}{" "}
                              completed
                            </span>
                            {currentProgress === 100 && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex items-center space-x-1 text-emerald-600"
                              >
                                <Sparkles className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                  Perfect!
                                </span>
                              </motion.div>
                            )}
                          </div>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${currentProgress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-3 rounded-full relative ${
                              currentProgress === 100
                                ? "bg-gradient-to-r from-emerald-400 to-green-500"
                                : "bg-gradient-to-r from-green-400 via-blue-500 to-purple-600"
                            }`}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-30 animate-pulse"></div>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Enhanced Question Card */}
                    <motion.div
                      ref={questionRef}
                      key={currentQuestionIndex}
                      variants={questionVariants}
                      initial="initial"
                      animate="in"
                      exit="out"
                      transition={{ duration: 0.4 }}
                      className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-slate-200/60 p-6 md:p-8 relative"
                    >
                      {/* Question Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-lg">
                              Q
                            </span>
                          </div>
                          <div className="text-slate-500 font-medium">
                            Question {currentQuestionIndex + 1} of{" "}
                            {questions.length}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleBookmark(currentQuestion._id)}
                            className={`p-2 rounded-xl transition-all duration-300 ${
                              bookmarkedQuestions.has(currentQuestion._id)
                                ? "bg-amber-100 text-amber-600 hover:bg-amber-200"
                                : "bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-amber-500"
                            }`}
                            title="Bookmark question"
                          >
                            <Bookmark
                              className={`w-5 h-5 ${
                                bookmarkedQuestions.has(currentQuestion._id)
                                  ? "fill-current"
                                  : ""
                              }`}
                            />
                          </button>
                          <button
                            onClick={() => setShowQuickNav(!showQuickNav)}
                            className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
                            title="Quick navigation"
                          >
                            <BarChart3 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Question Text */}
                      <div className="mb-8">
                        <h3 className="text-xl md:text-2xl font-semibold text-slate-900 leading-relaxed">
                          {currentQuestion.question}
                        </h3>
                      </div>

                      {/* Quick Navigation Modal */}
                      <AnimatePresence>
                        {showQuickNav && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute top-20 right-6 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-10 w-64"
                          >
                            <h4 className="font-semibold text-slate-900 mb-3">
                              Quick Navigation
                            </h4>
                            <div className="grid grid-cols-5 gap-2">
                              {questions.map((_, index) => (
                                <button
                                  key={index}
                                  onClick={() => {
                                    handleQuestionNavigation(index);
                                    setShowQuickNav(false);
                                  }}
                                  className={`w-10 h-10 rounded-xl border-2 transition-all duration-200 flex items-center justify-center ${
                                    currentQuestionIndex === index
                                      ? "bg-blue-500 text-white border-blue-500"
                                      : answeredQuestions.has(
                                          questions[index]._id
                                        )
                                      ? userAnswers[questions[index]._id]
                                          ?.isCorrect
                                        ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                                        : "bg-rose-100 text-rose-700 border-rose-300"
                                      : "bg-slate-100 text-slate-600 border-slate-300 hover:border-blue-400"
                                  } ${
                                    isQuestionLocked(index)
                                      ? "opacity-50 cursor-not-allowed"
                                      : ""
                                  }`}
                                  disabled={isQuestionLocked(index)}
                                >
                                  {index + 1}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Enhanced Options */}
                      <div className="space-y-4 mb-8">
                        {currentQuestion.options.map((option, optionIndex) => (
                          <motion.button
                            key={optionIndex}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleAnswerSelect(optionIndex)}
                            disabled={
                              answeredQuestions.has(currentQuestion._id) ||
                              isQuestionLocked(currentQuestionIndex)
                            }
                            className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 ${getOptionColor(
                              optionIndex
                            )} ${
                              !answeredQuestions.has(currentQuestion._id) &&
                              !isQuestionLocked(currentQuestionIndex)
                                ? "hover:shadow-lg cursor-pointer active:scale-95"
                                : "cursor-default"
                            } group relative overflow-hidden`}
                          >
                            {/* Animated background for selected options */}
                            {answeredQuestions.has(currentQuestion._id) &&
                              (optionIndex ===
                                userAnswers[currentQuestion._id]?.selected ||
                                optionIndex ===
                                  userAnswers[currentQuestion._id]
                                    ?.correctOption) && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className={`absolute inset-0 rounded-2xl ${
                                    optionIndex ===
                                    userAnswers[currentQuestion._id]
                                      ?.correctOption
                                      ? "bg-emerald-100"
                                      : "bg-rose-100"
                                  }`}
                                  transition={{ duration: 0.3 }}
                                />
                              )}

                            <div className="flex items-center space-x-4 relative z-10">
                              {getOptionIcon(optionIndex)}
                              <span className="flex-1 text-lg font-medium">
                                {option}
                              </span>
                              {!answeredQuestions.has(currentQuestion._id) &&
                                !isQuestionLocked(currentQuestionIndex) && (
                                  <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    whileHover={{ opacity: 1, x: 0 }}
                                    className="flex items-center space-x-2"
                                  >
                                    <ChevronRight className="w-5 h-5 text-slate-400" />
                                  </motion.div>
                                )}
                            </div>
                          </motion.button>
                        ))}
                      </div>

                      {/* Enhanced Explanation Section */}
                      {answeredQuestions.has(currentQuestion._id) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="overflow-hidden"
                        >
                          {/* Result Banner */}
                          <div
                            className={`mb-6 p-4 rounded-2xl border-2 ${
                              userAnswers[currentQuestion._id]?.isCorrect
                                ? "bg-emerald-50 border-emerald-200"
                                : "bg-rose-50 border-rose-200"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              {userAnswers[currentQuestion._id]?.isCorrect ? (
                                <>
                                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                    <Check className="w-6 h-6 text-emerald-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-emerald-900 text-lg">
                                      Correct! 🎉
                                    </h4>
                                    <p className="text-emerald-700">
                                      Great job! You got it right.
                                    </p>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                                    <X className="w-6 h-6 text-rose-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-rose-900 text-lg">
                                      Not quite right
                                    </h4>
                                    <p className="text-rose-700">
                                      Let's review the explanation below.
                                    </p>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Show Explanation Button for Correct Answers */}
                          {userAnswers[currentQuestion._id]?.isCorrect &&
                            !showExplanation && (
                              <div className="mb-6">
                                <button
                                  onClick={() => setShowExplanation(true)}
                                  className="w-full py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 flex items-center justify-center space-x-3 group hover:shadow-lg"
                                >
                                  <Lightbulb className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
                                  <span className="text-blue-700 font-semibold text-lg">
                                    Show Detailed Explanation
                                  </span>
                                </button>
                              </div>
                            )}

                          {/* Enhanced Explanation */}
                          {showExplanation && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 mb-6 overflow-hidden"
                            >
                              <div className="flex items-center mb-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center mr-4">
                                  <Lightbulb className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-blue-900 text-lg">
                                    Detailed Explanation
                                  </h4>
                                  <p className="text-blue-700 text-sm">
                                    Understand why this is the correct answer
                                  </p>
                                </div>
                              </div>
                              <p className="text-blue-800 leading-relaxed text-lg">
                                {currentQuestion.explanation}
                              </p>
                            </motion.div>
                          )}
                        </motion.div>
                      )}

                      {/* Enhanced Navigation Buttons */}
                      <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-slate-200 space-y-4 sm:space-y-0">
                        <button
                          onClick={handlePreviousQuestion}
                          disabled={currentQuestionIndex === 0}
                          className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center space-x-3 ${
                            currentQuestionIndex === 0
                              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                              : "bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 hover:shadow-lg active:scale-95"
                          }`}
                        >
                          <ChevronLeft className="w-5 h-5" />
                          <span>Previous</span>
                        </button>

                        <div className="flex items-center space-x-4">
                          <div className="text-sm text-slate-500 font-medium flex items-center bg-slate-100 px-4 py-2 rounded-xl">
                            <Clock className="w-4 h-4 mr-2" />
                            {currentQuestionIndex + 1} of {questions.length}
                          </div>
                          {sessionStats.streak > 1 && (
                            <div className="flex items-center space-x-2 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium">
                              <Zap className="w-4 h-4" />
                              <span>{sessionStats.streak} streak</span>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={handleNextQuestion}
                          disabled={
                            currentQuestionIndex === questions.length - 1
                          }
                          className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center space-x-3 ${
                            currentQuestionIndex === questions.length - 1
                              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                              : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-2xl transform hover:scale-105 active:scale-95 shadow-lg"
                          }`}
                        >
                          <span>Next Question</span>
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="topics"
                    variants={pageVariants}
                    initial="initial"
                    animate="in"
                    exit="out"
                    transition={{ duration: 0.3 }}
                    className="bg-white/90 backdrop-blur-md rounded-3xl shadow-lg border border-slate-200/60 p-8 sm:p-12 text-center"
                  >
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <BookOpen className="w-12 h-12 text-blue-600" />
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 mb-4">
                      {sidebarVisible
                        ? "Select a Topic to Begin"
                        : "Topics Hidden"}
                    </h3>
                    <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto">
                      {sidebarVisible
                        ? "Choose a topic and subsection from the sidebar to start your exam preparation journey with interactive questions and detailed explanations."
                        : "Click 'Show Topics' to explore available topics and begin your learning session."}
                    </p>

                    {!sidebarVisible && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleSidebar}
                        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center space-x-3 mx-auto"
                      >
                        <Eye className="w-5 h-5" />
                        <span className="font-semibold">Show Topics</span>
                      </motion.button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Enhanced Full Screen Prompt */}
        <AnimatePresence>
          {showFullScreenPrompt && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 50 }}
                className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Maximize2 className="w-10 h-10 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  Enhanced Study Mode
                </h3>
                <p className="text-slate-600 mb-2">
                  Switch to fullscreen for immersive, distraction-free learning
                </p>
                <p className="text-sm text-slate-500 mb-6">
                  Fullscreen mode helps you focus better and improves
                  information retention.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowFullScreenPrompt(false)}
                    className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-300"
                  >
                    Maybe Later
                  </button>
                  <button
                    onClick={toggleFullScreen}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Enter Fullscreen
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </StudentDashboardLayout>
  );
}
