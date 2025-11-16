// pages/courses/[id]/resources/[subjectId]/[examBoard]/exam-questions/page.jsx
"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "../../../../../../../layout/DashboardLayout";
import {
  ArrowLeft,
  Plus,
  FileText,
  Edit3,
  Trash2,
  Search,
  Filter,
  BookOpen,
  Upload,
  Download,
  Copy,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Eye } from "lucide-react";
import {
  getSubjectResources,
  addMCQ,
  addMultipleMCQs,
  bulkImportMCQs,
  updateMCQ,
  deleteMCQ,
} from "../../../../../../../../api/course.api";
import Swal from "sweetalert2";
import BulkMCQUpload from "../../../../../../../../components/BulkMCQUpload";

const ExamQuestionsPage = () => {
  const params = useParams();
  const router = useRouter();
  const { id: courseId, subjectId, examBoard } = params;

  const [resources, setResources] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState("single");
  const [expandedTopics, setExpandedTopics] = useState(new Set());
  const [expandedSubSections, setExpandedSubSections] = useState(new Set());
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [selectedSubsectionPdf, setSelectedSubsectionPdf] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [mcqForm, setMcqForm] = useState({
    question: "",
    options: ["", "", "", ""],
    correctOption: 0,
    explanation: "",
    difficulty: "easy",
    marks: 1,
    topic: "",
    subTopic: "",
  });

  const [editMCQForm, setEditMCQForm] = useState({
    id: "",
    question: "",
    options: ["", "", "", ""],
    correctOption: 0,
    explanation: "",
    difficulty: "easy",
    marks: 1,
    topic: "",
    subTopic: "",
    topicIndex: -1,
    subSectionIndex: -1,
    mcqIndex: -1,
  });

  const [multipleMCQs, setMultipleMCQs] = useState([
    {
      question: "",
      options: ["", "", "", ""],
      correctOption: 0,
      explanation: "",
      difficulty: "easy",
      marks: 1,
    },
  ]);

  useEffect(() => {
    fetchResources();
  }, [courseId, subjectId, examBoard]);

  const handleViewPdf = (subsection) => {
    if (subsection.pdfUrl) {
      setSelectedSubsectionPdf(subsection);
      setShowPdfModal(true);
    }
  };

  const handleDownloadPdf = (pdfUrl) => {
    if (pdfUrl) {
      window.open(pdfUrl, "_blank");
    }
  };

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await getSubjectResources(
        subjectId,
        courseId,
        examBoard
      );
      if (response.data.success) {
        setResources(response.data.data);
        // Expand first topic by default
        if (response.data.data?.resources?.examQuestions?.topics?.length > 0) {
          setExpandedTopics(new Set([0]));
        }
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load resources",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTopic = (topicIndex) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicIndex)) {
      newExpanded.delete(topicIndex);
    } else {
      newExpanded.add(topicIndex);
    }
    setExpandedTopics(newExpanded);
  };

  const toggleSubSection = (topicIndex, subSectionIndex) => {
    const key = `${topicIndex}-${subSectionIndex}`;
    const newExpanded = new Set(expandedSubSections);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedSubSections(newExpanded);
  };

  const handleAddSingleMCQ = async () => {
    try {
      if (!mcqForm.topic || !mcqForm.subTopic) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Please enter both topic and sub-topic",
        });
        return;
      }
      if (mcqForm.options.some((opt) => !opt.trim())) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Please fill all options",
        });
        return;
      }

      await addMCQ(
        subjectId,
        courseId,
        examBoard,
        mcqForm.topic,
        mcqForm.subTopic,
        mcqForm
      );

      setMcqForm({
        question: "",
        options: ["", "", "", ""],
        correctOption: 0,
        explanation: "",
        difficulty: "easy",
        marks: 1,
        topic: "",
        subTopic: "",
      });
      setShowAddModal(false);
      await fetchResources();

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "MCQ added successfully",
        timer: 1500,
      });
    } catch (error) {
      console.error("Error adding MCQ:", error);
      Swal.fire({ icon: "error", title: "Error", text: "Failed to add MCQ" });
    }
  };

  const handleEditMCQ = async () => {
    try {
      if (
        !editMCQForm.question.trim() ||
        editMCQForm.options.some((opt) => !opt.trim())
      ) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Please fill all required fields",
        });
        return;
      }

      // Update locally first for immediate feedback
      const updatedResources = JSON.parse(JSON.stringify(resources));
      const topic =
        updatedResources.resources.examQuestions.topics[editMCQForm.topicIndex];
      const subSection = topic.subSections[editMCQForm.subSectionIndex];
      subSection.mcqs[editMCQForm.mcqIndex] = {
        ...editMCQForm,
        _id: editMCQForm.id, // Keep the original ID
      };
      setResources(updatedResources);

      // Send API request
      await updateMCQ(
        subjectId,
        courseId,
        examBoard,
        editMCQForm.topic,
        editMCQForm.subTopic,
        editMCQForm.mcqIndex,
        editMCQForm
      );

      setShowEditModal(false);
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "MCQ updated successfully",
        timer: 1500,
      });
    } catch (error) {
      console.error("Error updating MCQ:", error);
      // Revert on error
      await fetchResources();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update MCQ",
      });
    }
  };

  const handleDeleteMCQ = async (
    topicIndex,
    subSectionIndex,
    mcqIndex,
    mcq
  ) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        // Delete locally first
        const updatedResources = JSON.parse(JSON.stringify(resources));
        const topic =
          updatedResources.resources.examQuestions.topics[topicIndex];
        const subSection = topic.subSections[subSectionIndex];
        subSection.mcqs.splice(mcqIndex, 1);
        setResources(updatedResources);

        // Send API request
        await deleteMCQ(
          subjectId,
          courseId,
          examBoard,
          topic.name,
          subSection.name,
          mcqIndex
        );

        Swal.fire("Deleted!", "MCQ has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting MCQ:", error);
        // Revert on error
        await fetchResources();
        Swal.fire("Error!", "Failed to delete MCQ.", "error");
      }
    }
  };

  const openEditModal = (topicIndex, subSectionIndex, mcqIndex) => {
    const topic = resources.resources.examQuestions.topics[topicIndex];
    const subSection = topic.subSections[subSectionIndex];
    const mcq = subSection.mcqs[mcqIndex];

    setEditMCQForm({
      id: mcq._id,
      question: mcq.question,
      options: [...mcq.options],
      correctOption: mcq.correctOption,
      explanation: mcq.explanation,
      difficulty: mcq.difficulty,
      marks: mcq.marks,
      topic: topic.name,
      subTopic: subSection.name,
      topicIndex,
      subSectionIndex,
      mcqIndex,
    });
    setShowEditModal(true);
  };

  const handleAddMultipleMCQs = async () => {
    try {
      if (!mcqForm.topic || !mcqForm.subTopic) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Please enter both topic and sub-topic",
        });
        return;
      }

      const validMCQs = multipleMCQs.filter((mcq, index) => {
        if (!mcq.question.trim()) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: `Question ${index + 1} is empty`,
          });
          return false;
        }
        if (mcq.options.some((opt) => !opt.trim())) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: `Please fill all options for question ${index + 1}`,
          });
          return false;
        }
        return true;
      });

      if (validMCQs.length === 0) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No valid questions to add",
        });
        return;
      }

      const response = await addMultipleMCQs(
        subjectId,
        courseId,
        examBoard,
        mcqForm.topic,
        mcqForm.subTopic,
        { mcqs: validMCQs }
      );

      if (response.data.success) {
        setMultipleMCQs([
          {
            question: "",
            options: ["", "", "", ""],
            correctOption: 0,
            explanation: "",
            difficulty: "easy",
            marks: 1,
          },
        ]);
        setMcqForm({ ...mcqForm, topic: "", subTopic: "" });
        setShowAddModal(false);
        await fetchResources();
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: `${response.data.data.addedCount} MCQs added successfully`,
          timer: 2000,
        });
      }
    } catch (error) {
      console.error("Error adding multiple MCQs:", error);
      Swal.fire({ icon: "error", title: "Error", text: "Failed to add MCQs" });
    }
  };

  const handleBulkUpload = async (uploadData) => {
    // uploadData is already { mcqs: [...] }
    try {
      console.log("Upload data received:", uploadData);

      // Just pass uploadData directly - it's already { mcqs: [...] }
      const response = await bulkImportMCQs(
        subjectId,
        courseId,
        examBoard,
        uploadData
      );

      if (response.data.success) {
        setShowBulkModal(false);
        await fetchResources();
        Swal.fire({
          icon: "success",
          title: "Bulk Upload Complete!",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error in bulk upload:", error);
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: "Failed to upload MCQs",
      });
    }
  };

  const addNewMCQForm = () => {
    setMultipleMCQs([
      ...multipleMCQs,
      {
        question: "",
        options: ["", "", "", ""],
        correctOption: 0,
        explanation: "",
        difficulty: "easy",
        marks: 1,
      },
    ]);
  };

  const removeMCQForm = (index) => {
    if (multipleMCQs.length > 1) {
      setMultipleMCQs(multipleMCQs.filter((_, i) => i !== index));
    }
  };

  const updateMultipleMCQ = (index, field, value) => {
    const newMCQs = [...multipleMCQs];
    if (field === "options") {
      newMCQs[index].options = value;
    } else {
      newMCQs[index][field] = value;
    }
    setMultipleMCQs(newMCQs);
  };

  const copyQuestion = (mcq) => {
    const questionText = `
Question: ${mcq.question}

Options:
A) ${mcq.options[0]}
B) ${mcq.options[1]}
C) ${mcq.options[2]}
D) ${mcq.options[3]}

Correct Answer: ${String.fromCharCode(65 + mcq.correctOption)}
Explanation: ${mcq.explanation}
Difficulty: ${mcq.difficulty}
Marks: ${mcq.marks}
    `.trim();

    navigator.clipboard.writeText(questionText);
    Swal.fire({
      icon: "success",
      title: "Copied!",
      text: "Question copied to clipboard",
      timer: 1000,
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  const topics = resources?.resources?.examQuestions?.topics || [];
  const totalQuestions = topics.reduce(
    (total, topic) =>
      total +
      topic.subSections.reduce(
        (subTotal, ss) => subTotal + (ss.mcqs?.length || 0),
        0
      ),
    0
  );

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() =>
                router.push(
                  `/dashboard/courses/${courseId}/resources/${subjectId}/${examBoard}`
                )
              }
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Exam Questions
              </h1>
              <p className="text-gray-600">
                {resources?.subject?.name || "Subject"} • {examBoard}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowBulkModal(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <Upload size={16} /> Bulk Upload
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus size={16} /> Add Questions
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Questions
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalQuestions}
                </p>
              </div>
              <FileText className="text-blue-600" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Topics</p>
                <p className="text-2xl font-bold text-gray-900">
                  {topics.length}
                </p>
              </div>
              <BookOpen className="text-green-600" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">PDFs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {topics.reduce(
                    (count, topic) =>
                      count +
                      topic.subSections.filter((ss) => ss.pdfUrl).length,
                    0
                  )}
                </p>
              </div>
              <FileText className="text-purple-600" size={24} />
            </div>
          </div>
          {["easy", "medium", "hard"].map((difficulty) => (
            <div
              key={difficulty}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 capitalize">
                    {difficulty}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {topics.reduce(
                      (count, topic) =>
                        count +
                        topic.subSections.reduce(
                          (subCount, ss) =>
                            subCount +
                            (ss.mcqs?.filter(
                              (mcq) => mcq.difficulty === difficulty
                            ).length || 0),
                          0
                        ),
                      0
                    )}
                  </p>
                </div>
                <div
                  className={`text-sm font-bold ${
                    difficulty === "easy"
                      ? "text-green-600"
                      : difficulty === "medium"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {difficulty}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Questions List with Accordions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Questions</h2>
            <p className="text-gray-600 mt-1">
              Manage multiple choice questions by topic and difficulty
            </p>
          </div>

          {topics.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No questions yet
              </h3>
              <p className="text-gray-600 mb-6">
                Get started by adding your first exam question
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Add First Question
                </button>
                <button
                  onClick={() => setShowBulkModal(true)}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                >
                  Bulk Upload
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {topics.map((topic, topicIndex) => (
                <div
                  key={topicIndex}
                  className="border-b border-gray-200 last:border-b-0"
                >
                  {/* Topic Header */}
                  <div
                    className="p-6 hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleTopic(topicIndex)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {expandedTopics.has(topicIndex) ? (
                          <ChevronDown size={20} className="text-gray-400" />
                        ) : (
                          <ChevronRight size={20} className="text-gray-400" />
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {topic.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {topic.subSections.length} sub-sections •{" "}
                            {topic.subSections.reduce(
                              (total, ss) => total + (ss.mcqs?.length || 0),
                              0
                            )}{" "}
                            questions
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          Topic
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Topic Content */}
                  {expandedTopics.has(topicIndex) && (
                    <div className="bg-gray-50 border-t border-gray-200">
                      {topic.subSections.map((subSection, subSectionIndex) => (
                        <div
                          key={subSectionIndex}
                          className="border-b border-gray-200 last:border-b-0"
                        >
                          {/* Sub-section Header */}
                          <div
                            className="p-4 pl-12 hover:bg-gray-100 cursor-pointer"
                            onClick={() =>
                              toggleSubSection(topicIndex, subSectionIndex)
                            }
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {expandedSubSections.has(
                                  `${topicIndex}-${subSectionIndex}`
                                ) ? (
                                  <ChevronDown
                                    size={16}
                                    className="text-gray-400"
                                  />
                                ) : (
                                  <ChevronRight
                                    size={16}
                                    className="text-gray-400"
                                  />
                                )}
                                <div>
                                  <h4 className="font-medium text-gray-900">
                                    {subSection.name}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {subSection.mcqs?.length || 0} questions
                                    {subSection.pdfUrl && " • PDF Available"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {subSection.pdfUrl && (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewPdf(subSection);
                                      }}
                                      className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100 transition-colors"
                                      title="View PDF"
                                    >
                                      <Eye size={12} />
                                      View PDF
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownloadPdf(subSection.pdfUrl);
                                      }}
                                      className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-xs hover:bg-green-100 transition-colors"
                                      title="Download PDF"
                                    >
                                      <Download size={12} />
                                    </button>
                                  </div>
                                )}
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                  Sub-topic
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Sub-section Content */}
                          {expandedSubSections.has(
                            `${topicIndex}-${subSectionIndex}`
                          ) &&
                            subSection.mcqs && (
                              <div className="p-4 pl-16 bg-white border-t border-gray-100">
                                <div className="space-y-4">
                                  {subSection.mcqs.map((mcq, mcqIndex) => (
                                    <MCQCard
                                      key={mcqIndex}
                                      mcq={mcq}
                                      hasPdf={!!subSection.pdfUrl}
                                      onEdit={() =>
                                        openEditModal(
                                          topicIndex,
                                          subSectionIndex,
                                          mcqIndex
                                        )
                                      }
                                      onDelete={() =>
                                        handleDeleteMCQ(
                                          topicIndex,
                                          subSectionIndex,
                                          mcqIndex,
                                          mcq
                                        )
                                      }
                                      onCopy={() => copyQuestion(mcq)}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modals */}
        {showAddModal && (
          <AddMCQModal
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            mcqForm={mcqForm}
            setMcqForm={setMcqForm}
            multipleMCQs={multipleMCQs}
            setMultipleMCQs={setMultipleMCQs}
            onAddSingle={handleAddSingleMCQ}
            onAddMultiple={handleAddMultipleMCQs}
            onAddNewForm={addNewMCQForm}
            onRemoveForm={removeMCQForm}
            onUpdateMultipleMCQ={updateMultipleMCQ}
            onClose={() => setShowAddModal(false)}
          />
        )}

        {showEditModal && (
          <EditMCQModal
            formData={editMCQForm}
            setFormData={setEditMCQForm}
            onSave={handleEditMCQ}
            onClose={() => setShowEditModal(false)}
          />
        )}

        {/* PDF Modal */}
        {showPdfModal && selectedSubsectionPdf && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedSubsectionPdf.name} - PDF
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedSubsectionPdf.totalQuestions} questions • PDF
                    Preview
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      handleDownloadPdf(selectedSubsectionPdf.pdfUrl)
                    }
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download size={16} />
                    Download PDF
                  </button>
                  <button
                    onClick={() => setShowPdfModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ArrowLeft size={20} />
                  </button>
                </div>
              </div>
              <div className="flex-1 p-4">
                {pdfLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading PDF...</p>
                    </div>
                  </div>
                ) : (
                  <iframe
                    src={selectedSubsectionPdf.pdfUrl}
                    className="w-full h-full rounded-lg border border-gray-200"
                    onLoad={() => setPdfLoading(false)}
                    onLoadStart={() => setPdfLoading(true)}
                    title={`${selectedSubsectionPdf.name} PDF`}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        <BulkMCQUpload
          isOpen={showBulkModal}
          onClose={() => setShowBulkModal(false)}
          onUpload={handleBulkUpload}
        />
      </div>
    </DashboardLayout>
  );
};

// MCQ Card Component
const MCQCard = ({ mcq, hasPdf, onEdit, onDelete, onCopy }) => (
  <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors group bg-white">
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              mcq.difficulty === "easy"
                ? "bg-green-100 text-green-800"
                : mcq.difficulty === "medium"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {mcq.difficulty}
          </span>
          <span className="text-xs text-gray-500">
            {mcq.marks} mark{mcq.marks !== 1 ? "s" : ""}
          </span>
          {hasPdf && (
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full flex items-center gap-1">
              <FileText size={10} />
              PDF
            </span>
          )}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="p-1 hover:bg-blue-100 rounded text-blue-600"
              title="Edit"
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={onCopy}
              className="p-1 hover:bg-gray-100 rounded text-gray-600"
              title="Copy"
            >
              <Copy size={14} />
            </button>
            <button
              onClick={onDelete}
              className="p-1 hover:bg-red-100 rounded text-red-600"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        <p className="font-medium text-gray-900 mb-3">{mcq.question}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
          {mcq.options.map((option, optIndex) => (
            <div
              key={optIndex}
              className={`flex items-center gap-2 p-2 rounded ${
                optIndex === mcq.correctOption
                  ? "bg-green-50 border border-green-200"
                  : "bg-gray-50"
              }`}
            >
              <span className="text-sm font-medium w-6">
                {String.fromCharCode(65 + optIndex)}.
              </span>
              <span className="text-sm">{option}</span>
              {optIndex === mcq.correctOption && (
                <span className="text-green-600 text-xs font-medium ml-auto">
                  Correct
                </span>
              )}
            </div>
          ))}
        </div>
        {mcq.explanation && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-sm font-medium text-blue-900 mb-1">
              Explanation:
            </p>
            <p className="text-sm text-blue-800">{mcq.explanation}</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

// Edit MCQ Modal Component
const EditMCQModal = ({ formData, setFormData, onSave, onClose }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">Edit MCQ</h3>
        <p className="text-sm text-gray-600 mt-1">
          Topic: {formData.topic} • Sub-topic: {formData.subTopic}
        </p>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question *
            </label>
            <textarea
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              value={formData.question}
              onChange={(e) =>
                setFormData({ ...formData, question: e.target.value })
              }
              placeholder="Enter the question..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Options *
            </label>
            <div className="space-y-2">
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm font-medium w-6">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...formData.options];
                      newOptions[index] = e.target.value;
                      setFormData({ ...formData, options: newOptions });
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correct Answer *
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={formData.correctOption}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    correctOption: parseInt(e.target.value),
                  })
                }
              >
                <option value={0}>Option A</option>
                <option value={1}>Option B</option>
                <option value={2}>Option C</option>
                <option value={3}>Option D</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty *
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({ ...formData, difficulty: e.target.value })
                }
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Explanation *
            </label>
            <textarea
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              value={formData.explanation}
              onChange={(e) =>
                setFormData({ ...formData, explanation: e.target.value })
              }
              placeholder="Explain why this is the correct answer..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Marks
            </label>
            <input
              type="number"
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={formData.marks}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  marks: parseInt(e.target.value) || 1,
                })
              }
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Update Question
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Separate Modal Component for Better Organization
const AddMCQModal = ({
  activeTab,
  setActiveTab,
  mcqForm,
  setMcqForm,
  multipleMCQs,
  setMultipleMCQs,
  onAddSingle,
  onAddMultiple,
  onAddNewForm,
  onRemoveForm,
  onUpdateMultipleMCQ,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">
            Add Exam Questions
          </h3>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "single"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("single")}
            >
              Single Question
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "multiple"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("multiple")}
            >
              Multiple Questions ({multipleMCQs.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Common Topic Fields */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={mcqForm.topic}
                onChange={(e) =>
                  setMcqForm({ ...mcqForm, topic: e.target.value })
                }
                placeholder="e.g., Algebra"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sub-topic *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={mcqForm.subTopic}
                onChange={(e) =>
                  setMcqForm({ ...mcqForm, subTopic: e.target.value })
                }
                placeholder="e.g., 1.1, 2.3"
              />
            </div>
          </div>

          {/* Single Question Tab */}
          {activeTab === "single" && (
            <SingleQuestionForm
              mcqForm={mcqForm}
              setMcqForm={setMcqForm}
              onAdd={onAddSingle}
            />
          )}

          {/* Multiple Questions Tab */}
          {activeTab === "multiple" && (
            <MultipleQuestionsForm
              multipleMCQs={multipleMCQs}
              onUpdateMultipleMCQ={onUpdateMultipleMCQ}
              onAddNewForm={onAddNewForm}
              onRemoveForm={onRemoveForm}
              onAddMultiple={onAddMultiple}
            />
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={activeTab === "single" ? onAddSingle : onAddMultiple}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {activeTab === "single"
                ? "Add Question"
                : `Add ${multipleMCQs.length} Questions`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Single Question Form Component
const SingleQuestionForm = ({ mcqForm, setMcqForm, onAdd }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question *
        </label>
        <textarea
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
          value={mcqForm.question}
          onChange={(e) => setMcqForm({ ...mcqForm, question: e.target.value })}
          placeholder="Enter the question..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Options *
        </label>
        <div className="space-y-2">
          {mcqForm.options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-sm font-medium w-6">
                {String.fromCharCode(65 + index)}.
              </span>
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={option}
                onChange={(e) => {
                  const newOptions = [...mcqForm.options];
                  newOptions[index] = e.target.value;
                  setMcqForm({ ...mcqForm, options: newOptions });
                }}
                placeholder={`Option ${String.fromCharCode(65 + index)}`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Correct Answer *
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            value={mcqForm.correctOption}
            onChange={(e) =>
              setMcqForm({
                ...mcqForm,
                correctOption: parseInt(e.target.value),
              })
            }
          >
            <option value={0}>Option A</option>
            <option value={1}>Option B</option>
            <option value={2}>Option C</option>
            <option value={3}>Option D</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty *
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            value={mcqForm.difficulty}
            onChange={(e) =>
              setMcqForm({ ...mcqForm, difficulty: e.target.value })
            }
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Explanation *
        </label>
        <textarea
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
          value={mcqForm.explanation}
          onChange={(e) =>
            setMcqForm({ ...mcqForm, explanation: e.target.value })
          }
          placeholder="Explain why this is the correct answer..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Marks
        </label>
        <input
          type="number"
          min="1"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          value={mcqForm.marks}
          onChange={(e) =>
            setMcqForm({
              ...mcqForm,
              marks: parseInt(e.target.value) || 1,
            })
          }
        />
      </div>
    </div>
  );
};

// Multiple Questions Form Component
const MultipleQuestionsForm = ({
  multipleMCQs,
  onUpdateMultipleMCQ,
  onAddNewForm,
  onRemoveForm,
  onAddMultiple,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Add multiple questions to the same topic and sub-topic
        </p>
        <button
          onClick={onAddNewForm}
          className="flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700"
        >
          <Plus size={14} />
          Add Another
        </button>
      </div>

      <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
        {multipleMCQs.map((mcq, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 bg-gray-50"
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-gray-900">
                Question {index + 1}
              </h4>
              {multipleMCQs.length > 1 && (
                <button
                  onClick={() => onRemoveForm(index)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question *
                </label>
                <textarea
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  value={mcq.question}
                  onChange={(e) =>
                    onUpdateMultipleMCQ(index, "question", e.target.value)
                  }
                  placeholder="Enter the question..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Options *
                </label>
                <div className="space-y-2">
                  {mcq.options.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center gap-2">
                      <span className="text-sm font-medium w-6">
                        {String.fromCharCode(65 + optIndex)}.
                      </span>
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...mcq.options];
                          newOptions[optIndex] = e.target.value;
                          onUpdateMultipleMCQ(index, "options", newOptions);
                        }}
                        placeholder={`Option ${String.fromCharCode(
                          65 + optIndex
                        )}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correct Answer
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={mcq.correctOption}
                    onChange={(e) =>
                      onUpdateMultipleMCQ(
                        index,
                        "correctOption",
                        parseInt(e.target.value)
                      )
                    }
                  >
                    <option value={0}>A</option>
                    <option value={1}>B</option>
                    <option value={2}>C</option>
                    <option value={3}>D</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={mcq.difficulty}
                    onChange={(e) =>
                      onUpdateMultipleMCQ(index, "difficulty", e.target.value)
                    }
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Explanation
                </label>
                <textarea
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  value={mcq.explanation}
                  onChange={(e) =>
                    onUpdateMultipleMCQ(index, "explanation", e.target.value)
                  }
                  placeholder="Explanation..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marks
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={mcq.marks}
                  onChange={(e) =>
                    onUpdateMultipleMCQ(
                      index,
                      "marks",
                      parseInt(e.target.value) || 1
                    )
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamQuestionsPage;
