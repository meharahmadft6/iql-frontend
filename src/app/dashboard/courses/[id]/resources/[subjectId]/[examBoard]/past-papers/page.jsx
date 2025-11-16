// pages/courses/[id]/resources/[subjectId]/[examBoard]/past-papers/page.jsx
"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "../../../../../../../layout/DashboardLayout";
import {
  ArrowLeft,
  Plus,
  FileText,
  Upload,
  Download,
  Calendar,
  Clock,
  Edit3,
  Trash2,
  Search,
  Filter,
  Eye,
} from "lucide-react";
import {
  getSubjectResources,
  addPastPaper,
  updatePastPaper,
  deletePastPaper,
  uploadToS3,
} from "../../../../../../../../api/course.api";
import Swal from "sweetalert2";

const PastPapersPage = () => {
  const params = useParams();
  const router = useRouter();
  const { id: courseId, subjectId, examBoard } = params;

  const [resources, setResources] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const [paperForm, setPaperForm] = useState({
    year: "",
    title: "",
    description: "",
    paperNumber: "",
    duration: "",
    totalMarks: "",
    pdfFile: null,
  });

  const [editPaperForm, setEditPaperForm] = useState({
    id: "",
    year: "",
    title: "",
    description: "",
    paperNumber: "",
    duration: "",
    totalMarks: "",
    pdfUrl: "",
    paperIndex: -1,
  });

  useEffect(() => {
    fetchResources();
  }, [courseId, subjectId, examBoard]);

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
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load past papers",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "past-papers");

      const response = await uploadToS3(formData);
      return response.data.url;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error("Failed to upload PDF file");
    } finally {
      setUploading(false);
    }
  };

  const handleAddPastPaper = async () => {
    try {
      if (!paperForm.pdfFile) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Please select a PDF file",
        });
        return;
      }

      if (!paperForm.year || !paperForm.title) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Please fill in year and title",
        });
        return;
      }

      // Upload PDF to S3
      const pdfUrl = await handleFileUpload(paperForm.pdfFile);

      const paperData = {
        year: paperForm.year,
        title: paperForm.title,
        description: paperForm.description,
        paperNumber: paperForm.paperNumber,
        pdfUrl: pdfUrl,
        fileSize: `${(paperForm.pdfFile.size / (1024 * 1024)).toFixed(2)} MB`,
        duration: paperForm.duration ? parseInt(paperForm.duration) : null,
        totalMarks: paperForm.totalMarks
          ? parseInt(paperForm.totalMarks)
          : null,
      };

      await addPastPaper(subjectId, courseId, examBoard, paperData);

      setPaperForm({
        year: "",
        title: "",
        description: "",
        paperNumber: "",
        duration: "",
        totalMarks: "",
        pdfFile: null,
      });
      setShowAddModal(false);
      await fetchResources();

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Past paper added successfully",
        timer: 1500,
      });
    } catch (error) {
      console.error("Error adding past paper:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to add past paper",
      });
    }
  };

  const handleEditPastPaper = async () => {
    try {
      if (!editPaperForm.year || !editPaperForm.title) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Please fill in year and title",
        });
        return;
      }

      const updatedResources = JSON.parse(JSON.stringify(resources));
      const paper =
        updatedResources.resources.pastPapers.papers[editPaperForm.paperIndex];

      // Update paper data
      Object.assign(paper, {
        year: editPaperForm.year,
        title: editPaperForm.title,
        description: editPaperForm.description,
        paperNumber: editPaperForm.paperNumber,
        duration: editPaperForm.duration
          ? parseInt(editPaperForm.duration)
          : null,
        totalMarks: editPaperForm.totalMarks
          ? parseInt(editPaperForm.totalMarks)
          : null,
      });

      setResources(updatedResources);

      // Send API request
      await updatePastPaper(
        subjectId,
        courseId,
        examBoard,
        editPaperForm.paperIndex,
        {
          year: editPaperForm.year,
          title: editPaperForm.title,
          description: editPaperForm.description,
          paperNumber: editPaperForm.paperNumber,
          duration: editPaperForm.duration
            ? parseInt(editPaperForm.duration)
            : null,
          totalMarks: editPaperForm.totalMarks
            ? parseInt(editPaperForm.totalMarks)
            : null,
        }
      );

      setShowEditModal(false);
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Past paper updated successfully",
        timer: 1500,
      });
    } catch (error) {
      console.error("Error updating past paper:", error);
      await fetchResources();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update past paper",
      });
    }
  };

  const handleDeletePastPaper = async (paperIndex, paper) => {
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
        const updatedResources = JSON.parse(JSON.stringify(resources));
        updatedResources.resources.pastPapers.papers.splice(paperIndex, 1);
        setResources(updatedResources);

        await deletePastPaper(subjectId, courseId, examBoard, paperIndex);

        Swal.fire("Deleted!", "Past paper has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting past paper:", error);
        await fetchResources();
        Swal.fire("Error!", "Failed to delete past paper.", "error");
      }
    }
  };

  const openEditModal = (paperIndex) => {
    const paper = resources.resources.pastPapers.papers[paperIndex];
    setEditPaperForm({
      id: paper._id,
      year: paper.year,
      title: paper.title,
      description: paper.description || "",
      paperNumber: paper.paperNumber || "",
      duration: paper.duration || "",
      totalMarks: paper.totalMarks || "",
      pdfUrl: paper.pdfUrl,
      paperIndex,
    });
    setShowEditModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== "application/pdf") {
      Swal.fire({
        icon: "error",
        title: "Invalid File",
        text: "Please select a PDF file",
      });
      return;
    }
    setPaperForm({ ...paperForm, pdfFile: file });
  };

  const getFilteredPapers = () => {
    if (!resources?.resources?.pastPapers?.papers) return [];

    let filtered = resources.resources.pastPapers.papers;

    if (searchTerm) {
      filtered = filtered.filter(
        (paper) =>
          paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          paper.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          paper.paperNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterYear) {
      filtered = filtered.filter((paper) => paper.year === filterYear);
    }

    // Sort by year descending, then by paper number
    return filtered.sort((a, b) => {
      if (b.year !== a.year) return b.year.localeCompare(a.year);
      return (a.paperNumber || "").localeCompare(b.paperNumber || "");
    });
  };

  const getAvailableYears = () => {
    if (!resources?.resources?.pastPapers?.papers) return [];
    return [
      ...new Set(
        resources.resources.pastPapers.papers.map((paper) => paper.year)
      ),
    ].sort((a, b) => b.localeCompare(a));
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

  const papers = getFilteredPapers();
  const availableYears = getAvailableYears();

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
              <h1 className="text-2xl font-bold text-gray-900">Past Papers</h1>
              <p className="text-gray-600">
                {resources?.subject?.name || "Subject"} • {examBoard}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={16} />
            Add Past Paper
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Papers
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {resources?.resources?.pastPapers?.papers?.length || 0}
                </p>
              </div>
              <FileText className="text-blue-600" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Years Available
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {availableYears.length}
                </p>
              </div>
              <Calendar className="text-green-600" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Latest Year</p>
                <p className="text-2xl font-bold text-gray-900">
                  {availableYears[0] || "-"}
                </p>
              </div>
              <Clock className="text-purple-600" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Oldest Year</p>
                <p className="text-2xl font-bold text-gray-900">
                  {availableYears[availableYears.length - 1] || "-"}
                </p>
              </div>
              <Calendar className="text-orange-600" size={24} />
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search past papers..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
              >
                <option value="">All Years</option>
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Past Papers List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Past Papers</h2>
            <p className="text-gray-600 mt-1">
              Access and manage past examination papers
            </p>
          </div>

          {papers.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No past papers yet
              </h3>
              <p className="text-gray-600 mb-6">
                Get started by uploading your first past paper
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Upload First Paper
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {papers.map((paper, index) => (
                <PastPaperCard
                  key={paper._id || index}
                  paper={paper}
                  onEdit={() => openEditModal(index)}
                  onDelete={() => handleDeletePastPaper(index, paper)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add Past Paper Modal */}
        {showAddModal && (
          <AddPastPaperModal
            formData={paperForm}
            setFormData={setPaperForm}
            onFileChange={handleFileChange}
            onSave={handleAddPastPaper}
            onClose={() => setShowAddModal(false)}
            uploading={uploading}
          />
        )}

        {/* Edit Past Paper Modal */}
        {showEditModal && (
          <EditPastPaperModal
            formData={editPaperForm}
            setFormData={setEditPaperForm}
            onSave={handleEditPastPaper}
            onClose={() => setShowEditModal(false)}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

// Past Paper Card Component
const PastPaperCard = ({ paper, onEdit, onDelete }) => (
  <div className="p-6 hover:bg-gray-50 transition-colors group">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
            {paper.year}
          </span>
          {paper.paperNumber && (
            <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
              Paper {paper.paperNumber}
            </span>
          )}
          <span className="text-sm text-gray-500">{paper.fileSize}</span>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {paper.title}
        </h3>

        {paper.description && (
          <p className="text-gray-600 mb-3">{paper.description}</p>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-500">
          {paper.duration && (
            <div className="flex items-center gap-1">
              <Clock size={16} />
              <span>{paper.duration} mins</span>
            </div>
          )}
          {paper.totalMarks && (
            <div className="flex items-center gap-1">
              <FileText size={16} />
              <span>{paper.totalMarks} marks</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 ml-4">
        <a
          href={paper.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Eye size={16} />
          View
        </a>
        <a
          href={paper.pdfUrl}
          download
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download size={16} />
          Download
        </a>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-2 hover:bg-blue-100 rounded text-blue-600 transition-colors"
            title="Edit"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-red-100 rounded text-red-600 transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Add Past Paper Modal Component
const AddPastPaperModal = ({
  formData,
  setFormData,
  onFileChange,
  onSave,
  onClose,
  uploading,
}) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">Add Past Paper</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: e.target.value })
                }
                placeholder="e.g., 2024"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paper Number
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={formData.paperNumber}
                onChange={(e) =>
                  setFormData({ ...formData, paperNumber: e.target.value })
                }
                placeholder="e.g., 1, 2, 3"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g., Summer Examination Paper"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Brief description of the paper..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                placeholder="e.g., 120"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Marks
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={formData.totalMarks}
                onChange={(e) =>
                  setFormData({ ...formData, totalMarks: e.target.value })
                }
                placeholder="e.g., 100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PDF File *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".pdf"
                onChange={onFileChange}
                className="hidden"
                id="pdf-upload"
              />
              <label
                htmlFor="pdf-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="text-gray-400" size={24} />
                <span className="text-sm text-gray-600">
                  {formData.pdfFile
                    ? formData.pdfFile.name
                    : "Click to upload PDF file"}
                </span>
                <span className="text-xs text-gray-500">
                  Maximum file size: 50MB
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={uploading || !formData.pdfFile}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Uploading...
              </>
            ) : (
              "Add Past Paper"
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Edit Past Paper Modal Component
const EditPastPaperModal = ({ formData, setFormData, onSave, onClose }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">Edit Past Paper</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: e.target.value })
                }
                placeholder="e.g., 2024"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paper Number
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={formData.paperNumber}
                onChange={(e) =>
                  setFormData({ ...formData, paperNumber: e.target.value })
                }
                placeholder="e.g., 1, 2, 3"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g., Summer Examination Paper"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Brief description of the paper..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                placeholder="e.g., 120"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Marks
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={formData.totalMarks}
                onChange={(e) =>
                  setFormData({ ...formData, totalMarks: e.target.value })
                }
                placeholder="e.g., 100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current PDF
            </label>
            <a
              href={formData.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              View current PDF
            </a>
            <p className="text-xs text-gray-500 mt-1">
              To change the PDF file, please delete and re-upload the paper.
            </p>
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
            Update Past Paper
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default PastPapersPage;
