// components/BulkMCQUpload.jsx
import React, { useState } from "react";
import { Upload, FileText, Download, X } from "lucide-react";

const BulkMCQUpload = ({ isOpen, onClose, onUpload }) => {
  const [jsonData, setJsonData] = useState("");
  const [format, setFormat] = useState("json"); // or 'csv'

  const templateJSON = [
    {
      question: "What is 2 + 2?",
      options: ["3", "4", "5", "6"],
      correctOption: 1,
      explanation: "2 + 2 equals 4",
      difficulty: "easy",
      marks: 1,
      topic: "Basic Arithmetic",
      subTopic: "Addition",
    },
    {
      question: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      correctOption: 2,
      explanation: "Paris is the capital of France",
      difficulty: "easy",
      marks: 1,
      topic: "Geography",
      subTopic: "European Capitals",
    },
  ];

  const handleUpload = () => {
    try {
      if (!jsonData.trim()) {
        alert("Please paste MCQ data in JSON format");
        return;
      }

      const mcqs = JSON.parse(jsonData);

      // Validate the structure
      if (!Array.isArray(mcqs)) {
        alert("JSON data should be an array of MCQ objects");
        return;
      }

      // Basic validation for each MCQ
      const validMCQs = mcqs.filter((mcq, index) => {
        if (!mcq.question || typeof mcq.question !== "string") {
          console.warn(`MCQ at index ${index} missing question`);
          return false;
        }
        if (!Array.isArray(mcq.options) || mcq.options.length !== 4) {
          console.warn(`MCQ at index ${index} has invalid options`);
          return false;
        }
        if (
          typeof mcq.correctOption !== "number" ||
          mcq.correctOption < 0 ||
          mcq.correctOption > 3
        ) {
          console.warn(`MCQ at index ${index} has invalid correctOption`);
          return false;
        }
        if (!mcq.topic || !mcq.subTopic) {
          console.warn(`MCQ at index ${index} missing topic or subTopic`);
          return false;
        }
        return true;
      });

      if (validMCQs.length === 0) {
        alert("No valid MCQs found in the uploaded data");
        return;
      }

      if (validMCQs.length < mcqs.length) {
        console.warn(
          `Filtered out ${mcqs.length - validMCQs.length} invalid MCQs`
        );
      }

      // Wrap the array in an object with 'mcqs' property
      onUpload({ mcqs: validMCQs });
      setJsonData("");
      onClose();
    } catch (error) {
      console.error("JSON parsing error:", error);
      alert("Invalid JSON format. Please check your data structure.");
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([JSON.stringify(templateJSON, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mcq-template.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePasteExample = () => {
    setJsonData(JSON.stringify(templateJSON, null, 2));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Bulk Upload MCQs
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Upload multiple questions using JSON format
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-blue-900 mb-2">Instructions:</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Use the JSON format below to structure your MCQs</li>
                <li>
                  Each MCQ must have: question, options (4 items), correctOption
                  (0-3), explanation, difficulty, marks, topic, and subTopic
                </li>
                <li>Download the template to get started</li>
                <li>correctOption: 0 = A, 1 = B, 2 = C, 3 = D</li>
              </ul>
            </div>

            {/* Template Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  JSON Template
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={handlePasteExample}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Paste Example
                  </button>
                  <button
                    onClick={downloadTemplate}
                    className="flex items-center gap-2 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    <Download size={14} />
                    Download Template
                  </button>
                </div>
              </div>

              <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                <pre className="text-sm text-gray-700 overflow-x-auto">
                  {`[
  {
    "question": "Your question here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctOption": 0,
    "explanation": "Explanation why this is correct",
    "difficulty": "easy",
    "marks": 1,
    "topic": "Topic Name",
    "subTopic": "Sub-topic Name"
  }
]`}
                </pre>
              </div>
            </div>

            {/* JSON Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Paste Your MCQ Data (JSON Format)
              </label>
              <textarea
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm resize-none"
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
                placeholder="Paste your MCQ data in JSON format here..."
              />
            </div>

            {/* Validation Info */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-yellow-900 mb-2">
                Validation Rules:
              </h4>
              <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                <li>
                  <strong>question:</strong> Required string
                </li>
                <li>
                  <strong>options:</strong> Array of exactly 4 strings
                </li>
                <li>
                  <strong>correctOption:</strong> Number between 0-3 (0=A, 1=B,
                  2=C, 3=D)
                </li>
                <li>
                  <strong>explanation:</strong> Required string
                </li>
                <li>
                  <strong>difficulty:</strong> "easy", "medium", or "hard"
                </li>
                <li>
                  <strong>marks:</strong> Number (default: 1)
                </li>
                <li>
                  <strong>topic:</strong> Required string
                </li>
                <li>
                  <strong>subTopic:</strong> Required string
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {jsonData &&
                `Estimated questions: ${(() => {
                  try {
                    const data = JSON.parse(jsonData);
                    return Array.isArray(data) ? data.length : 0;
                  } catch {
                    return 0;
                  }
                })()}`}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Upload size={16} />
                Upload MCQs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkMCQUpload;
