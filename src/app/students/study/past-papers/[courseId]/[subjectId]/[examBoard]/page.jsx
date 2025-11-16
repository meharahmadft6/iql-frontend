"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getPastPapers } from "../../../../../../../api/study.api.js";
import StudentDashboardLayout from "../../../../../../layout/student/DashboardLayout";

export default function PastPapersPage({ params }) {
  const router = useRouter();
  const [unwrappedParams, setUnwrappedParams] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);

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
      fetchPastPapers();
    }
  }, [unwrappedParams]);

  const fetchPastPapers = async () => {
    try {
      setLoading(true);
      const { courseId, subjectId, examBoard } = unwrappedParams;
      const response = await getPastPapers(courseId, subjectId, examBoard);

      if (response.data.success) {
        setData(response.data.data);
        // Auto-select first paper if available
        if (response.data.data.pastPapers?.papers?.length > 0) {
          setSelectedPaper(response.data.data.pastPapers.papers[0]);
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

  const handlePaperSelect = (paper) => {
    setSelectedPaper(paper);
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const downloadPaper = (paper) => {
    const link = document.createElement("a");
    link.href = paper.signedPdfUrl || paper.pdfUrl;
    link.download = `${paper.title}.pdf`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openPaperInNewTab = (paper) => {
    window.open(paper.signedPdfUrl || paper.pdfUrl, "_blank");
  };

  if (!unwrappedParams || loading) {
    return (
      <StudentDashboardLayout title="Past Papers">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-6">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-gray-600 text-lg font-medium">
              Loading past papers...
            </p>
          </div>
        </div>
      </StudentDashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <StudentDashboardLayout title="Past Papers">
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
              Unable to Load Past Papers
            </h2>
            <p className="text-slate-600 mb-6">
              {error || "No past papers available"}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={fetchPastPapers}
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
  const papers = data.pastPapers?.papers || [];

  return (
    <StudentDashboardLayout title={`Past Papers - ${data.course?.name}`}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-lg border-b border-slate-200/60 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  href="/students/study"
                  className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 font-medium transition-all duration-300 group"
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
                <div className="h-6 w-px bg-slate-300"></div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Past Papers
                  </h1>
                  <p className="text-slate-600 text-sm">
                    {data.course?.name} • {data.subject?.name} •{" "}
                    {decodedExamBoard}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={toggleSidebar}
                  className="p-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all duration-300"
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
            {/* Sidebar - Papers List */}
            {sidebarVisible && (
              <div className="lg:w-80 flex-shrink-0">
                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/60 p-6 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
                  <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
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
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Past Papers ({papers.length})
                  </h2>

                  <div className="space-y-3">
                    {papers.map((paper, index) => (
                      <button
                        key={paper._id || index}
                        onClick={() => handlePaperSelect(paper)}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group ${
                          selectedPaper?._id === paper._id
                            ? "bg-blue-50 border-blue-300 shadow-md"
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              selectedPaper?._id === paper._id
                                ? "bg-blue-100 text-blue-600"
                                : "bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600"
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
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p
                                className={`text-sm font-medium truncate ${
                                  selectedPaper?._id === paper._id
                                    ? "text-blue-700"
                                    : "text-slate-700"
                                }`}
                              >
                                {paper.year} - {paper.paperNumber}
                              </p>
                              <span className="text-xs text-slate-500 ml-2 flex-shrink-0">
                                {paper.fileSize}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 truncate">
                              {paper.title}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  paper.title.includes("(MS)")
                                    ? "bg-green-100 text-green-700"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {paper.title.includes("(MS)")
                                  ? "Mark Scheme"
                                  : "Question Paper"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Main Content - PDF Preview */}
            <div className="flex-1 min-w-0">
              {selectedPaper ? (
                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
                  {/* Paper Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200/60 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                      <div className="flex-1 mb-4 lg:mb-0">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">
                          {selectedPaper.title}
                        </h2>
                        <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                          <span className="bg-white px-3 py-1 rounded-full border border-slate-200">
                            Year: {selectedPaper.year}
                          </span>
                          <span className="bg-white px-3 py-1 rounded-full border border-slate-200">
                            Paper: {selectedPaper.paperNumber}
                          </span>
                          <span className="bg-white px-3 py-1 rounded-full border border-slate-200">
                            Duration: {selectedPaper.duration} mins
                          </span>
                          <span className="bg-white px-3 py-1 rounded-full border border-slate-200">
                            Marks: {selectedPaper.totalMarks}
                          </span>
                          <span className="bg-white px-3 py-1 rounded-full border border-slate-200">
                            Size: {selectedPaper.fileSize}
                          </span>
                        </div>
                        {selectedPaper.description && (
                          <p className="text-slate-600 mt-3">
                            {selectedPaper.description}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => downloadPaper(selectedPaper)}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300"
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
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <span>Download</span>
                        </button>
                        <button
                          onClick={() => openPaperInNewTab(selectedPaper)}
                          className="flex items-center space-x-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-300"
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
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                          <span>Open in New Tab</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* PDF Preview */}
                  <div className="p-6">
                    <div className="bg-slate-100 rounded-xl border-2 border-slate-200 p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-800">
                          PDF Preview
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <span>Powered by PDF.js</span>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg border border-slate-300 h-96 lg:h-[600px] overflow-hidden">
                        <iframe
                          src={`${
                            selectedPaper.signedPdfUrl || selectedPaper.pdfUrl
                          }#view=fitH`}
                          className="w-full h-full border-0"
                          title={`PDF Preview - ${selectedPaper.title}`}
                        />
                      </div>

                      <div className="flex justify-between items-center mt-4 text-sm text-slate-600">
                        <span>Scroll to navigate through the document</span>
                        <span>Use download button to save locally</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/60 p-12 text-center">
                  <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <svg
                      className="w-12 h-12 text-slate-400"
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
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">
                    Select a Past Paper
                  </h3>
                  <p className="text-slate-600 text-lg max-w-md mx-auto mb-6">
                    Choose a past paper from the sidebar to view and download
                    it.
                  </p>
                  {!sidebarVisible && (
                    <button
                      onClick={toggleSidebar}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300"
                    >
                      Show Papers List
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </StudentDashboardLayout>
  );
}
