"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getExamQuestions } from "../../../../../../api/study.api.js";
import Navbar from "../../../../../../components/Navbar.jsx";

export default function ExamQuestionsPage({ params }) {
  const router = useRouter();
  const [unwrappedParams, setUnwrappedParams] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

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

  // Unwrap params
  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params;
      setUnwrappedParams(resolvedParams);
    };
    unwrapParams();
  }, [params]);

  // Check authentication and fetch data
  useEffect(() => {
    if (!unwrappedParams) return;
    fetchExamQuestions();
  }, [unwrappedParams]);

  const fetchExamQuestions = async () => {
    if (!unwrappedParams) return;

    try {
      setLoading(true);
      const { courseId, subjectId, examBoard } = unwrappedParams;
      const response = await getExamQuestions(courseId, subjectId, examBoard);
      if (response.data.success) {
        setData(response.data.data);
        if (response.data.data.examQuestions?.topics?.length > 0) {
          setSelectedTopic(response.data.data.examQuestions.topics[0]);
          // Always show first question of the topic
          setCurrentQuestionIndex(0);
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

  // Get all questions from selected topic
  const getAllQuestions = () => {
    if (!selectedTopic) return [];
    const questions = [];
    selectedTopic.subSections?.forEach((subsection) => {
      subsection.mcqs?.forEach((question) => {
        questions.push({
          ...question,
          subsectionName: subsection.name,
        });
      });
    });
    return questions;
  };

  const questions = getAllQuestions();
  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (selectedOption) => {
    if (!currentQuestion || answeredQuestions.has(currentQuestion._id)) return;

    // Check if user is logged in for questions beyond the first one
    if (currentQuestionIndex > 0 && !isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    const isCorrect = selectedOption === currentQuestion.correctOption;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion._id]: {
        selected: selectedOption,
        isCorrect,
        correctOption: currentQuestion.correctOption,
      },
    }));
    setAnsweredQuestions((prev) => new Set([...prev, currentQuestion._id]));

    // Only auto-show explanation for wrong answers
    if (!isCorrect) {
      setShowExplanation(true);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      // Check if user is logged in for questions beyond the first one
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
    // Check if user is logged in for questions beyond the first one
    if (index > 0 && !isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    setCurrentQuestionIndex(index);
    setShowExplanation(false);
  };

  const handleLoginRedirect = () => {
    router.push("/login");
  };

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

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "medium":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "hard":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

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
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      );
    }

    if (optionIndex === userAnswer.selected && !userAnswer.isCorrect) {
      return (
        <div className="w-6 h-6 rounded-full border-2 border-rose-500 bg-rose-500 flex items-center justify-center">
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
      );
    }

    return (
      <div className="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center">
        <span className="text-xs font-semibold text-slate-400">○</span>
      </div>
    );
  };

  const getProgressPercentage = () => {
    return (answeredQuestions.size / questions.length) * 100;
  };

  const isQuestionLocked = (index) => {
    return !isLoggedIn && index > 0;
  };

  // Show loading while unwrapping params
  if (!unwrappedParams || loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 bg-blue-600 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-700 mb-2">
                Loading Exam Questions
              </p>
              <p className="text-sm text-slate-500">
                Preparing your learning experience...
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
              </button>
              <Link
                href="/"
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-white transition-all duration-300 flex items-center space-x-2"
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
              </Link>
            </div>
          </div>
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
        {showLoginModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 transform animate-scaleIn">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-blue-600"
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
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  Login Required
                </h3>
                <p className="text-slate-600 mb-2">
                  Please login to access all questions and features.
                </p>
                <p className="text-sm text-slate-500 mb-6">
                  You're currently viewing the first question only.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowLoginModal(false)}
                    className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-300 flex items-center space-x-2"
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
                    <span>Continue Demo</span>
                  </button>
                  <button
                    onClick={handleLoginRedirect}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
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
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      />
                    </svg>
                    <span>Login Now</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-40">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <Link
                  href="/"
                  className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 font-medium transition-colors group"
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
                  <span>Back to Study</span>
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
                    {decodedExamBoard} • Exam Questions
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                {!isLoggedIn && (
                  <div className="flex items-center space-x-2 text-amber-700 bg-amber-50 px-3 py-2 rounded-full text-sm border border-amber-200">
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
                    <span>Login for full access</span>
                  </div>
                )}
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-700 flex items-center">
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
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    Progress: {answeredQuestions.size}/{questions.length}
                  </p>
                  <div className="w-32 bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar - Topics & Question Navigator */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/60 p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
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
                <div className="space-y-3 mb-6">
                  {data.examQuestions?.topics?.map((topic, index) => (
                    <button
                      key={topic._id || index}
                      onClick={() => {
                        setSelectedTopic(topic);
                        setCurrentQuestionIndex(0);
                        setShowExplanation(false);
                      }}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 group ${
                        selectedTopic?._id === topic._id
                          ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 shadow-md transform scale-[1.02]"
                          : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-md"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors text-sm">
                            {topic.name}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 flex items-center">
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
                                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {topic.totalQuestions || 0} questions
                          </p>
                        </div>
                        {selectedTopic?._id === topic._id && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse flex-shrink-0 mt-2"></div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Question Navigator */}
                {selectedTopic && questions.length > 0 && (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-slate-900 flex items-center">
                        <svg
                          className="w-4 h-4 mr-2 text-slate-600"
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
                        Questions
                      </h3>
                      {!isLoggedIn && (
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                          First question free
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {questions.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuestionNavigation(index)}
                          disabled={isQuestionLocked(index)}
                          className={`w-10 h-10 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center relative group ${
                            currentQuestionIndex === index
                              ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg transform scale-110 ring-2 ring-blue-200"
                              : answeredQuestions.has(questions[index]._id)
                              ? userAnswers[questions[index]._id]?.isCorrect
                                ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-300 shadow-sm"
                                : "bg-rose-100 text-rose-700 border-2 border-rose-300 shadow-sm"
                              : isQuestionLocked(index)
                              ? "bg-slate-100 text-slate-400 cursor-not-allowed border-2 border-slate-200"
                              : "bg-white text-slate-600 border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md"
                          }`}
                        >
                          {index + 1}
                          {isQuestionLocked(index) && (
                            <div className="absolute -top-1 -right-1 transform group-hover:scale-110 transition-transform">
                              <svg
                                className="w-4 h-4 text-slate-400"
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
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Main Content - Single Question View */}
            <div className="flex-1">
              {selectedTopic && currentQuestion ? (
                <div className="space-y-6">
                  {/* Progress Header */}
                  <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/60 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 space-y-3 lg:space-y-0">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center">
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
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          {selectedTopic.name}
                        </h2>
                        <p className="text-slate-600 mt-1 flex items-center">
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
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {currentQuestion.subsectionName} • Question{" "}
                          {currentQuestionIndex + 1} of {questions.length}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span
                          className={`px-3 py-1 text-sm font-medium rounded-full border-2 ${getDifficultyColor(
                            currentQuestion.difficulty
                          )} flex items-center`}
                        >
                          <span className="mr-1">
                            {getDifficultyIcon(currentQuestion.difficulty)}
                          </span>
                          {currentQuestion.difficulty}
                        </span>
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm font-medium rounded-full border-2 border-slate-200 flex items-center">
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
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                            />
                          </svg>
                          {currentQuestion.marks} mark
                          {currentQuestion.marks > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 h-3 rounded-full transition-all duration-700 ease-out relative"
                        style={{
                          width: `${
                            ((currentQuestionIndex + 1) / questions.length) *
                            100
                          }%`,
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-30 animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  {/* Question Card */}
                  <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/60 p-6 md:p-8 transform transition-all duration-300 hover:shadow-xl">
                    {/* Question Text */}
                    <div className="mb-8">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-white font-semibold text-sm">
                            Q
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 leading-relaxed">
                          {currentQuestion.question}
                        </h3>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-4 mb-8">
                      {currentQuestion.options.map((option, optionIndex) => (
                        <button
                          key={optionIndex}
                          onClick={() => handleAnswerSelect(optionIndex)}
                          disabled={
                            answeredQuestions.has(currentQuestion._id) ||
                            isQuestionLocked(currentQuestionIndex)
                          }
                          className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-300 ${getOptionColor(
                            optionIndex
                          )} ${
                            !answeredQuestions.has(currentQuestion._id) &&
                            !isQuestionLocked(currentQuestionIndex)
                              ? "hover:scale-[1.02] hover:shadow-md cursor-pointer active:scale-95"
                              : "cursor-default"
                          } group`}
                        >
                          <div className="flex items-center space-x-4">
                            {getOptionIcon(optionIndex)}
                            <span className="flex-1 text-lg font-medium">
                              {option}
                            </span>
                            {!answeredQuestions.has(currentQuestion._id) &&
                              !isQuestionLocked(currentQuestionIndex) && (
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <svg
                                    className="w-5 h-5 text-slate-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                                    />
                                  </svg>
                                </div>
                              )}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Show Explanation Button for Correct Answers */}
                    {answeredQuestions.has(currentQuestion._id) &&
                      userAnswers[currentQuestion._id]?.isCorrect &&
                      !showExplanation && (
                        <div className="mb-6">
                          <button
                            onClick={() => setShowExplanation(true)}
                            className="w-full py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 flex items-center justify-center space-x-3 group hover:shadow-md"
                          >
                            <svg
                              className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="text-blue-700 font-semibold">
                              Show Detailed Explanation
                            </span>
                          </button>
                        </div>
                      )}

                    {/* Explanation */}
                    {showExplanation && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 animate-fadeIn mb-6">
                        <div className="flex items-center mb-4">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <svg
                              className="w-5 h-5 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <h4 className="font-bold text-blue-900 text-lg">
                            Detailed Explanation
                          </h4>
                        </div>
                        <p className="text-blue-800 leading-relaxed text-lg">
                          {currentQuestion.explanation}
                        </p>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-slate-200 space-y-4 sm:space-y-0">
                      <button
                        onClick={handlePreviousQuestion}
                        disabled={currentQuestionIndex === 0}
                        className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-3 ${
                          currentQuestionIndex === 0
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 hover:shadow-md active:scale-95"
                        }`}
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
                        <span>Previous Question</span>
                      </button>

                      <div className="text-sm text-slate-500 font-medium flex items-center">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Question {currentQuestionIndex + 1} of{" "}
                        {questions.length}
                      </div>

                      <button
                        onClick={handleNextQuestion}
                        disabled={currentQuestionIndex === questions.length - 1}
                        className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-3 ${
                          currentQuestionIndex === questions.length - 1
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-xl transform hover:scale-105 active:scale-95 shadow-lg"
                        }`}
                      >
                        <span>Next Question</span>
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
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/60 p-12 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-4">
                    Ready to Start Your Practice?
                  </h3>
                  <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto">
                    Select a topic from the sidebar to begin your exam
                    preparation journey with interactive questions and instant
                    feedback.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center space-y-6 sm:space-y-0 sm:space-x-12">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <svg
                          className="w-8 h-8 text-blue-600"
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
                      </div>
                      <p className="text-sm font-medium text-slate-700">
                        Multiple Topics
                      </p>
                      <p className="text-xs text-slate-500">
                        Comprehensive coverage
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <svg
                          className="w-8 h-8 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-slate-700">
                        Instant Feedback
                      </p>
                      <p className="text-xs text-slate-500">
                        Learn from mistakes
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <svg
                          className="w-8 h-8 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-slate-700">
                        Track Progress
                      </p>
                      <p className="text-xs text-slate-500">
                        Monitor your improvement
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
