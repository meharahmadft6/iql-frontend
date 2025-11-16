// pages/courses/[id]/resources/[subjectId]/[examBoard]/revision-notes/page.jsx
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
  Eye,
  Upload,
  Download,
  ChevronDown,
  ChevronRight,
  Image as ImageIcon,
  Type,
} from "lucide-react";
import {
  getSubjectResources,
  addRevisionNote,
  updateRevisionNote,
  deleteRevisionNote,
  uploadToS3,
} from "../../../../../../../../api/course.api";
import Swal from "sweetalert2";

const RevisionNotesPage = () => {
  const params = useParams();
  const router = useRouter();
  const { id: courseId, subjectId, examBoard } = params;

  const [resources, setResources] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedNotes, setExpandedNotes] = useState(new Set());
  const [activeSubTopic, setActiveSubTopic] = useState(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkNotes, setBulkNotes] = useState("");
  const [noteForm, setNoteForm] = useState({
    title: "",
    content: "",
    order: 0,
    images: [],
    subTopics: [],
  });

  const [editNoteForm, setEditNoteForm] = useState({
    id: "",
    title: "",
    content: "",
    order: 0,
    images: [],
    subTopics: [],
    noteIndex: -1,
  });

  const [currentSubTopic, setCurrentSubTopic] = useState({
    title: "",
    content: "",
    order: 0,
    image: null,
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
        text: "Failed to load revision notes",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async () => {
    try {
      if (!bulkNotes.trim()) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Please enter revision notes data",
        });
        return;
      }

      setUploading(true);

      // Parse the bulk notes data
      const notesData = parseBulkNotes(bulkNotes);

      if (notesData.length === 0) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No valid revision notes found in the input",
        });
        return;
      }

      let successCount = 0;
      let errorMessages = [];

      // Upload each note individually with error handling
      for (const note of notesData) {
        try {
          await addRevisionNote(subjectId, courseId, examBoard, note);
          successCount++;
        } catch (error) {
          if (error.response?.data?.message?.includes("Order already exists")) {
            errorMessages.push(
              `"${note.title}" - Order ${note.order} conflict`
            );
          } else {
            errorMessages.push(`"${note.title}" - ${error.message}`);
          }
        }
      }

      setBulkNotes("");
      setShowBulkModal(false);
      await fetchResources();

      if (errorMessages.length > 0) {
        Swal.fire({
          icon: "warning",
          title: "Partial Success",
          html: `
          <div class="text-left">
            <p class="mb-2">${successCount} notes added successfully</p>
            <p class="mb-2 text-red-600">${
              errorMessages.length
            } notes failed:</p>
            <ul class="text-sm text-gray-600 max-h-32 overflow-y-auto">
              ${errorMessages
                .map((msg) => `<li class="mb-1">• ${msg}</li>`)
                .join("")}
            </ul>
          </div>
        `,
          timer: 5000,
        });
      } else {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: `${successCount} revision notes added successfully`,
          timer: 2000,
        });
      }
    } catch (error) {
      console.error("Error in bulk upload:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to upload revision notes",
      });
    } finally {
      setUploading(false);
    }
  };

  const parseBulkNotes = (input) => {
    const notes = [];
    const lines = input.split("\n");
    let currentNote = null;
    let currentSubTopic = null;

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (!trimmedLine) continue;

      // Check for main topic with order: ## [1] Topic Title
      const mainTopicMatch = trimmedLine.match(/^##\s*\[(\d+)\]\s*(.+)$/);
      if (mainTopicMatch) {
        // Save previous note if exists
        if (currentNote) {
          if (currentSubTopic) {
            currentNote.subTopics.push(currentSubTopic);
            currentSubTopic = null;
          }
          notes.push(currentNote);
        }

        // Start new note with specified order
        const order = parseInt(mainTopicMatch[1]);
        const title = mainTopicMatch[2].trim();

        currentNote = {
          title: title,
          content: "",
          order: order,
          images: [],
          subTopics: [],
        };
      }
      // Check for sub-topic with order: ### [1] Sub-topic Title
      else if (trimmedLine.startsWith("### ")) {
        const subTopicMatch = trimmedLine.match(/^###\s*\[(\d+)\]\s*(.+)$/);
        if (subTopicMatch && currentNote) {
          // Save previous sub-topic if exists
          if (currentSubTopic) {
            currentNote.subTopics.push(currentSubTopic);
          }

          // Start new sub-topic with specified order
          const order = parseInt(subTopicMatch[1]);
          const title = subTopicMatch[2].trim();

          currentSubTopic = {
            title: title,
            content: "",
            order: order,
            image: null,
          };
        }
      }
      // Check for image URL
      else if (
        trimmedLine.startsWith("![Image](") &&
        trimmedLine.endsWith(")")
      ) {
        const imageUrl = trimmedLine
          .substring(9, trimmedLine.length - 1)
          .trim();
        const imageData = {
          url: imageUrl,
          caption: "",
          altText: `Image ${Date.now()}`,
        };

        if (currentSubTopic) {
          currentSubTopic.image = imageData;
        } else if (currentNote) {
          currentNote.images.push(imageData);
        }
      }
      // Check for main content (skip separator lines)
      else if (currentNote && !trimmedLine.startsWith("---")) {
        if (currentSubTopic) {
          currentSubTopic.content +=
            (currentSubTopic.content ? "\n" : "") + trimmedLine;
        } else {
          currentNote.content +=
            (currentNote.content ? "\n" : "") + trimmedLine;
        }
      }
    }

    // Add the last note and sub-topic
    if (currentNote) {
      if (currentSubTopic) {
        currentNote.subTopics.push(currentSubTopic);
      }
      notes.push(currentNote);
    }

    // Sort notes by order
    notes.sort((a, b) => a.order - b.order);

    // Sort sub-topics within each note by order
    notes.forEach((note) => {
      if (note.subTopics && note.subTopics.length > 0) {
        note.subTopics.sort((a, b) => a.order - b.order);
      }
    });

    return notes;
  };

  const handleImageUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "revision-notes");

      const response = await uploadToS3(formData);
      return {
        url: response.data.url,
        caption: "",
        altText: file.name,
      };
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image");
    }
  };

  const handleAddRevisionNote = async () => {
    try {
      if (!noteForm.title || !noteForm.content) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Please fill in title and content",
        });
        return;
      }

      setUploading(true);

      // Images are already uploaded, just use them directly
      const noteData = {
        title: noteForm.title,
        content: noteForm.content,
        order: noteForm.order || 0,
        images: noteForm.images, // Already have S3 URLs
        subTopics: noteForm.subTopics.map((subTopic) => ({
          title: subTopic.title,
          content: subTopic.content,
          order: subTopic.order || 0,
          image: subTopic.image || null,
        })),
      };

      await addRevisionNote(subjectId, courseId, examBoard, noteData);

      setNoteForm({
        title: "",
        content: "",
        order: 0,
        images: [],
        subTopics: [],
      });
      setShowAddModal(false);
      await fetchResources();

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Revision note added successfully",
        timer: 1500,
      });
    } catch (error) {
      console.error("Error adding revision note:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to add revision note",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleEditRevisionNote = async () => {
    try {
      if (!editNoteForm.title || !editNoteForm.content) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Please fill in title and content",
        });
        return;
      }

      setUploading(true);

      // Images are already uploaded, just use them directly
      const noteData = {
        title: editNoteForm.title,
        content: editNoteForm.content,
        order: editNoteForm.order || 0,
        images: editNoteForm.images, // Already have S3 URLs
        subTopics: editNoteForm.subTopics.map((subTopic) => ({
          title: subTopic.title,
          content: subTopic.content,
          order: subTopic.order || 0,
          image: subTopic.image || null,
        })),
      };

      // Update local state first for better UX
      const updatedResources = JSON.parse(JSON.stringify(resources));
      updatedResources.resources.revisionNotes.topics[editNoteForm.noteIndex] =
        {
          ...updatedResources.resources.revisionNotes.topics[
            editNoteForm.noteIndex
          ],
          ...noteData,
        };
      setResources(updatedResources);

      // Send API request
      await updateRevisionNote(
        subjectId,
        courseId,
        examBoard,
        editNoteForm.noteIndex,
        noteData
      );

      setShowEditModal(false);
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Revision note updated successfully",
        timer: 1500,
      });
    } catch (error) {
      console.error("Error updating revision note:", error);
      await fetchResources(); // Refresh from server if error
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to update revision note",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteRevisionNote = async (noteIndex, note) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete the revision note and all its sub-topics!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const updatedResources = JSON.parse(JSON.stringify(resources));
        updatedResources.resources.revisionNotes.topics.splice(noteIndex, 1);
        setResources(updatedResources);

        await deleteRevisionNote(subjectId, courseId, examBoard, noteIndex);

        Swal.fire("Deleted!", "Revision note has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting revision note:", error);
        await fetchResources();
        Swal.fire("Error!", "Failed to delete revision note.", "error");
      }
    }
  };

  const openEditModal = (noteIndex) => {
    const note = resources.resources.revisionNotes.topics[noteIndex];
    setEditNoteForm({
      id: note._id,
      title: note.title,
      content: note.content,
      order: note.order || 0,
      images: note.images || [],
      subTopics: note.subTopics || [],
      noteIndex,
    });
    setShowEditModal(true);
  };

  const toggleNoteExpansion = (noteIndex) => {
    const newExpanded = new Set(expandedNotes);
    if (newExpanded.has(noteIndex)) {
      newExpanded.delete(noteIndex);
    } else {
      newExpanded.add(noteIndex);
    }
    setExpandedNotes(newExpanded);
  };

  const addSubTopic = () => {
    if (!currentSubTopic.title || !currentSubTopic.content) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please fill in sub-topic title and content",
      });
      return;
    }

    const newSubTopic = {
      title: currentSubTopic.title,
      content: currentSubTopic.content,
      order: currentSubTopic.order || noteForm.subTopics.length,
      image: currentSubTopic.image,
    };

    setNoteForm({
      ...noteForm,
      subTopics: [...noteForm.subTopics, newSubTopic],
    });

    setCurrentSubTopic({
      title: "",
      content: "",
      order: 0,
      image: null,
    });
  };

  const addSubTopicEdit = () => {
    if (!currentSubTopic.title || !currentSubTopic.content) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please fill in sub-topic title and content",
      });
      return;
    }

    const newSubTopic = {
      title: currentSubTopic.title,
      content: currentSubTopic.content,
      order: currentSubTopic.order || editNoteForm.subTopics.length,
      image: currentSubTopic.image,
    };

    setEditNoteForm({
      ...editNoteForm,
      subTopics: [...editNoteForm.subTopics, newSubTopic],
    });

    setCurrentSubTopic({
      title: "",
      content: "",
      order: 0,
      image: null,
    });
  };
  // In your main component, add this removeImage function:
  const removeImage = (index, isEditModal = false) => {
    if (isEditModal) {
      const newImages = [...editNoteForm.images];
      newImages.splice(index, 1);
      setEditNoteForm({ ...editNoteForm, images: newImages });
    } else {
      const newImages = [...noteForm.images];
      newImages.splice(index, 1);
      setNoteForm({ ...noteForm, images: newImages });
    }
  };

  const removeSubTopic = (index) => {
    const newSubTopics = [...noteForm.subTopics];
    newSubTopics.splice(index, 1);
    setNoteForm({ ...noteForm, subTopics: newSubTopics });
  };

  const removeSubTopicEdit = (index) => {
    const newSubTopics = [...editNoteForm.subTopics];
    newSubTopics.splice(index, 1);
    setEditNoteForm({ ...editNoteForm, subTopics: newSubTopics });
  };

  const handleImageChange = async (
    e,
    isSubTopic = false,
    isEditModal = false,
    subTopicIndex = null
  ) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        Swal.fire({
          icon: "error",
          title: "Invalid File",
          text: "Please select an image file",
        });
        return;
      }

      try {
        setUploading(true);

        // Upload the image to S3 first
        const uploadedImage = await handleImageUpload(file);
        const imageData = {
          url: uploadedImage.url,
          caption: "",
          altText: file.name,
        };

        // For sub-topics in currentSubTopic state (when adding new sub-topic)
        if (isSubTopic && subTopicIndex === null) {
          setCurrentSubTopic({
            ...currentSubTopic,
            image: imageData,
          });
        }
        // For existing sub-topics in edit mode
        else if (isSubTopic && subTopicIndex !== null && isEditModal) {
          const updatedSubTopics = [...editNoteForm.subTopics];
          updatedSubTopics[subTopicIndex] = {
            ...updatedSubTopics[subTopicIndex],
            image: imageData,
          };
          setEditNoteForm({
            ...editNoteForm,
            subTopics: updatedSubTopics,
          });
        }
        // For existing sub-topics in add mode
        else if (isSubTopic && subTopicIndex !== null) {
          const updatedSubTopics = [...noteForm.subTopics];
          updatedSubTopics[subTopicIndex] = {
            ...updatedSubTopics[subTopicIndex],
            image: imageData,
          };
          setNoteForm({
            ...noteForm,
            subTopics: updatedSubTopics,
          });
        }
        // For main images in edit modal - REPLACE existing images
        else if (isEditModal) {
          setEditNoteForm({
            ...editNoteForm,
            images: [imageData], // Replace the entire array with new image
          });
        }
        // For main images in add modal - REPLACE existing images
        else {
          setNoteForm({
            ...noteForm,
            images: [imageData], // Replace the entire array with new image
          });
        }
      } catch (error) {
        console.error("Error handling image:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to upload image",
        });
      } finally {
        setUploading(false);
      }
    }
  };

  const getFilteredNotes = () => {
    if (!resources?.resources?.revisionNotes?.topics) return [];

    let filtered = resources.resources.revisionNotes.topics;

    if (searchTerm) {
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.subTopics?.some(
            (subTopic) =>
              subTopic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              subTopic.content.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Sort by order
    return filtered.sort((a, b) => (a.order || 0) - (b.order || 0));
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

  const notes = getFilteredNotes();

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
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
                Revision Notes
              </h1>
              <p className="text-gray-600">
                {resources?.subject?.name || "Subject"} • {examBoard}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              Add Note
            </button>
            <button
              onClick={() => setShowBulkModal(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Upload size={16} />
              Bulk Upload
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Notes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {resources?.resources?.revisionNotes?.topics?.length || 0}
                </p>
              </div>
              <FileText className="text-blue-600" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sub-topics</p>
                <p className="text-2xl font-bold text-gray-900">
                  {notes.reduce(
                    (total, note) => total + (note.subTopics?.length || 0),
                    0
                  )}
                </p>
              </div>
              <Type className="text-green-600" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Images</p>
                <p className="text-2xl font-bold text-gray-900">
                  {notes.reduce(
                    (total, note) => total + (note.images?.length || 0),
                    0
                  )}
                </p>
              </div>
              <ImageIcon className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search revision notes..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Revision Notes List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Revision Notes</h2>
            <p className="text-gray-600 mt-1">
              Comprehensive study materials and notes
            </p>
          </div>

          {notes.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No revision notes yet
              </h3>
              <p className="text-gray-600 mb-6">
                Get started by creating your first revision note
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Create First Note
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notes.map((note, index) => (
                <RevisionNoteCard
                  key={note._id || index}
                  note={note}
                  index={index}
                  isExpanded={expandedNotes.has(index)}
                  onToggle={() => toggleNoteExpansion(index)}
                  onEdit={() => openEditModal(index)}
                  onDelete={() => handleDeleteRevisionNote(index, note)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add Revision Note Modal */}
        {showAddModal && (
          <AddRevisionNoteModal
            formData={noteForm}
            setFormData={setNoteForm}
            currentSubTopic={currentSubTopic}
            setCurrentSubTopic={setCurrentSubTopic}
            onImageChange={handleImageChange} // Pass the function directly
            onAddSubTopic={addSubTopic}
            onRemoveSubTopic={removeSubTopic}
            onSave={handleAddRevisionNote}
            onClose={() => setShowAddModal(false)}
            uploading={uploading}
          />
        )}

        {/* Edit Revision Note Modal */}
        {showEditModal && (
          <EditRevisionNoteModal
            formData={editNoteForm}
            setFormData={setEditNoteForm}
            currentSubTopic={currentSubTopic}
            setCurrentSubTopic={setCurrentSubTopic}
            onImageChange={handleImageChange}
            onAddSubTopic={addSubTopicEdit}
            onRemoveSubTopic={removeSubTopicEdit}
            onRemoveImage={removeImage} // Add this
            onSave={handleEditRevisionNote}
            onClose={() => setShowEditModal(false)}
            uploading={uploading}
            isEditModal={true} // Add this to identify it's edit mode
          />
        )}

        {showBulkModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">
                  Bulk Upload Revision Notes
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Add multiple revision notes at once using the format below
                </p>
              </div>
              <div className="p-6">
                {/* Format Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Format Guide:
                  </h4>
                  <pre className="text-sm text-blue-800 whitespace-pre-wrap">
                    {`## [Order] Main Topic Title
Main topic content goes here...
![Image](https://example.com/image1.jpg)

### [Order] Sub-topic Title
Sub-topic content goes here...
![Image](https://example.com/subtopic-image.jpg)

### [Order] Another Sub-topic
Another sub-topic content...

## [Order] Next Main Topic
Next main topic content...
![Image](https://example.com/image2.jpg)

### [Order] Next Sub-topic
Next sub-topic content...`}
                  </pre>
                  <p className="text-sm text-blue-700 mt-2">
                    • Use <code>## [Order]</code> for main topics (e.g.,{" "}
                    <code>## [1] Networks</code>)
                    <br />• Use <code>### [Order]</code> for sub-topics (e.g.,{" "}
                    <code>### [1] Types of Networks</code>)
                    <br />• Use <code>![Image](URL)</code> for images
                    <br />• Separate topics with blank lines
                    <br />• Order numbers determine display sequence
                  </p>
                </div>

                {/* Textarea for bulk input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Revision Notes Data *
                  </label>
                  <textarea
                    rows="12"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none font-mono text-sm"
                    value={bulkNotes}
                    onChange={(e) => setBulkNotes(e.target.value)}
                    placeholder="Paste your revision notes data here using the format above..."
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowBulkModal(false);
                      setBulkNotes("");
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkUpload}
                    disabled={uploading || !bulkNotes.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Uploading...
                      </>
                    ) : (
                      "Upload Notes"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

// Revision Note Card Component
const RevisionNoteCard = ({
  note,
  index,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
}) => (
  <div className="p-6 hover:bg-gray-50 transition-colors group">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
            Order: {note.order || 0}
          </span>
          {note.images?.length > 0 && (
            <span className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">
              {note.images.length} image{note.images.length !== 1 ? "s" : ""}
            </span>
          )}
          {note.subTopics?.length > 0 && (
            <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
              {note.subTopics.length} sub-topic
              {note.subTopics.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="flex items-start gap-3">
          <button
            onClick={onToggle}
            className="p-1 hover:bg-gray-200 rounded mt-1 transition-colors"
          >
            {isExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {note.title}
            </h3>

            {!isExpanded && (
              <p className="text-gray-600 line-clamp-2">{note.content}</p>
            )}

            {isExpanded && (
              <div className="mt-4 space-y-4">
                {/* Main Content */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Content:</h4>
                  <div className="prose max-w-none text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {note.content}
                  </div>
                </div>

                {/* Images */}
                {note.images?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Images:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {note.images.map((image, imgIndex) => (
                        <div
                          key={imgIndex}
                          className="border rounded-lg overflow-hidden"
                        >
                          <img
                            src={image.url}
                            alt={image.altText}
                            className="w-full h-48 object-cover"
                          />
                          {image.caption && (
                            <p className="p-2 text-sm text-gray-600 bg-white">
                              {image.caption}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-topics */}
                {note.subTopics?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Sub-topics:
                    </h4>
                    <div className="space-y-3">
                      {note.subTopics.map((subTopic, subIndex) => (
                        <div
                          key={subIndex}
                          className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50"
                        >
                          <h5 className="font-medium text-gray-900">
                            {subTopic.title}
                          </h5>
                          <p className="text-gray-700 mt-1">
                            {subTopic.content}
                          </p>
                          {subTopic.image && (
                            <div className="mt-2">
                              <img
                                src={subTopic.image.url}
                                alt={subTopic.image.altText}
                                className="max-w-xs rounded border"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-4">
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

// Add Revision Note Modal Component
const AddRevisionNoteModal = ({
  formData,
  setFormData,
  currentSubTopic,
  setCurrentSubTopic,
  onImageChange,
  onAddSubTopic,
  onRemoveSubTopic,
  onSave,
  onClose,
  uploading,
}) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">Add Revision Note</h3>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          {/* Main Note Form */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
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
                placeholder="Enter note title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={formData.order}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    order: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              rows="6"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              placeholder="Enter main content for this revision note..."
            />
          </div>

          {/* Images Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onImageChange(e, false)}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center gap-2 p-4"
              >
                <Upload className="text-gray-400" size={24} />
                <span className="text-sm text-gray-600">
                  Click to upload images
                </span>
                <span className="text-xs text-gray-500">
                  Supports JPG, PNG, GIF
                </span>
              </label>
            </div>
            {formData.images.length > 0 && (
              <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
                {formData.images.map((image, index) => (
                  <div
                    key={index}
                    className="relative border rounded-lg overflow-hidden"
                  >
                    <img
                      src={image.url} // Now using the actual S3 URL
                      alt={image.altText}
                      className="w-full h-24 object-cover"
                    />
                    <button
                      onClick={() => {
                        const newImages = [...formData.images];
                        newImages.splice(index, 1);
                        setFormData({ ...formData, images: newImages });
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sub-topics Section */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Sub-topics
            </h4>

            {/* Add Sub-topic Form */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sub-topic Title *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                    value={currentSubTopic.title}
                    onChange={(e) =>
                      setCurrentSubTopic({
                        ...currentSubTopic,
                        title: e.target.value,
                      })
                    }
                    placeholder="Enter sub-topic title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                    value={currentSubTopic.order}
                    onChange={(e) =>
                      setCurrentSubTopic({
                        ...currentSubTopic,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onImageChange(e, true)}
                    className="hidden"
                    id="subtopic-image-upload"
                  />
                  <label
                    htmlFor="subtopic-image-upload"
                    className="cursor-pointer flex items-center gap-2 text-sm text-gray-600 border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50"
                  >
                    <ImageIcon size={16} />
                    {currentSubTopic.image ? "Change Image" : "Add Image"}
                  </label>
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content *
                </label>
                <textarea
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm"
                  value={currentSubTopic.content}
                  onChange={(e) =>
                    setCurrentSubTopic({
                      ...currentSubTopic,
                      content: e.target.value,
                    })
                  }
                  placeholder="Enter sub-topic content"
                />
              </div>
              <button
                onClick={onAddSubTopic}
                disabled={!currentSubTopic.title || !currentSubTopic.content}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Add Sub-topic
              </button>
            </div>

            {/* Existing Sub-topics */}
            {formData.subTopics.length > 0 && (
              <div className="space-y-3">
                <h5 className="font-medium text-gray-900">Added Sub-topics:</h5>
                {formData.subTopics.map((subTopic, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-3 border rounded-lg bg-white"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium text-gray-900">
                          {subTopic.title}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          Order: {subTopic.order}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {subTopic.content}
                      </p>
                      {subTopic.image && (
                        <div className="mt-2">
                          <img
                            src={subTopic.image.url} // Now using the actual S3 URL
                            alt={subTopic.image.altText}
                            className="max-w-xs h-20 object-cover rounded border"
                          />
                        </div>
                      )}
                      {/* Add image upload for existing sub-topics */}
                      <div className="mt-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => onImageChange(e, true, false, index)}
                          className="hidden"
                          id={`subtopic-existing-image-${index}`}
                        />
                        <label
                          htmlFor={`subtopic-existing-image-${index}`}
                          className="cursor-pointer flex items-center gap-2 text-xs text-blue-600 border border-blue-300 rounded px-2 py-1 hover:bg-blue-50"
                        >
                          <ImageIcon size={12} />
                          {subTopic.image ? "Change Image" : "Add Image"}
                        </label>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveSubTopic(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded ml-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
            disabled={uploading || !formData.title || !formData.content}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Uploading...
              </>
            ) : (
              "Add Revision Note"
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Edit Revision Note Modal Component
const EditRevisionNoteModal = ({
  formData,
  setFormData,
  currentSubTopic,
  setCurrentSubTopic,
  onImageChange,
  onAddSubTopic,
  onRemoveSubTopic,
  onRemoveImage, // Add this new prop
  onSave,
  onClose,
  uploading,
  isEditModal = false, // Add this to identify if it's edit mode
}) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">Edit Revision Note</h3>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          {/* Main Note Form */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
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
                placeholder="Enter note title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={formData.order}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    order: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              rows="6"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              placeholder="Enter main content for this revision note..."
            />
          </div>

          {/* Images Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onImageChange(e, false, isEditModal)}
                className="hidden"
                id="edit-image-upload"
              />
              <label
                htmlFor="edit-image-upload"
                className="cursor-pointer flex flex-col items-center gap-2 p-4"
              >
                <Upload className="text-gray-400" size={24} />
                <span className="text-sm text-gray-600">
                  Click to upload images
                </span>
                <span className="text-xs text-gray-500">
                  Supports JPG, PNG, GIF
                </span>
              </label>
            </div>
            {formData.images.length > 0 && (
              <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
                {formData.images.map((image, index) => (
                  <div
                    key={index}
                    className="relative border rounded-lg overflow-hidden"
                  >
                    <img
                      src={image.url}
                      alt={image.altText}
                      className="w-full h-24 object-cover"
                    />
                    <button
                      onClick={() => onRemoveImage(index, isEditModal)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sub-topics Section */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Sub-topics
            </h4>

            {/* Add Sub-topic Form */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sub-topic Title *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                    value={currentSubTopic.title}
                    onChange={(e) =>
                      setCurrentSubTopic({
                        ...currentSubTopic,
                        title: e.target.value,
                      })
                    }
                    placeholder="Enter sub-topic title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                    value={currentSubTopic.order}
                    onChange={(e) =>
                      setCurrentSubTopic({
                        ...currentSubTopic,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onImageChange(e, true, isEditModal)}
                    className="hidden"
                    id="edit-subtopic-image-upload"
                  />
                  <label
                    htmlFor="edit-subtopic-image-upload"
                    className="cursor-pointer flex items-center gap-2 text-sm text-gray-600 border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50"
                  >
                    <ImageIcon size={16} />
                    {currentSubTopic.image ? "Change Image" : "Add Image"}
                  </label>
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content *
                </label>
                <textarea
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm"
                  value={currentSubTopic.content}
                  onChange={(e) =>
                    setCurrentSubTopic({
                      ...currentSubTopic,
                      content: e.target.value,
                    })
                  }
                  placeholder="Enter sub-topic content"
                />
              </div>
              <button
                onClick={onAddSubTopic}
                disabled={!currentSubTopic.title || !currentSubTopic.content}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Add Sub-topic
              </button>
            </div>

            {/* Existing Sub-topics */}
            {formData.subTopics.length > 0 && (
              <div className="space-y-3">
                <h5 className="font-medium text-gray-900">
                  Existing Sub-topics:
                </h5>

                {formData.subTopics.map((subTopic, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-3 border rounded-lg bg-white"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium text-gray-900">
                          {subTopic.title}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          Order: {subTopic.order}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {subTopic.content}
                      </p>
                      {subTopic.image && (
                        <div className="mt-2">
                          <img
                            src={subTopic.image.url}
                            alt={subTopic.image.altText}
                            className="max-w-xs h-20 object-cover rounded border"
                          />
                        </div>
                      )}
                      {/* Add image upload for existing sub-topics in edit mode */}
                      <div className="mt-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            onImageChange(e, true, isEditModal, index)
                          }
                          className="hidden"
                          id={`edit-subtopic-existing-image-${index}`}
                        />
                        <label
                          htmlFor={`edit-subtopic-existing-image-${index}`}
                          className="cursor-pointer flex items-center gap-2 text-xs text-blue-600 border border-blue-300 rounded px-2 py-1 hover:bg-blue-50"
                        >
                          <ImageIcon size={12} />
                          {subTopic.image ? "Change Image" : "Add Image"}
                        </label>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveSubTopic(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded ml-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
            disabled={uploading || !formData.title || !formData.content}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Uploading...
              </>
            ) : (
              "Update Revision Note"
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default RevisionNotesPage;
