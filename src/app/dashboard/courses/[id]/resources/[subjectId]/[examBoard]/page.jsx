// pages/courses/[id]/resources/[subjectId]/[examBoard]/page.jsx
"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "../../../../../../layout/DashboardLayout";
import {
  ArrowLeft,
  FileText,
  StickyNote,
  Calendar,
  Settings,
  ToggleLeft,
  ToggleRight,
  BookOpen,
  Users,
} from "lucide-react";
import {
  getSubjectResources,
  upsertSubjectResources,
  toggleResourceType,
} from "../../../../../../../api/course.api";
import Swal from "sweetalert2";
import Link from "next/link";

const ResourceManagementPage = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id: courseId, subjectId, examBoard } = params;

  const [resources, setResources] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const resourceTypes = [
    {
      key: "examQuestions",
      label: "Exam Questions",
      description:
        "Multiple choice questions with topics and difficulty levels",
      icon: FileText,
      href: `exam-questions`,
      color: "blue",
    },
    {
      key: "revisionNotes",
      label: "Revision Notes",
      description: "Comprehensive notes with topics, subtopics, and images",
      icon: StickyNote,
      href: `revision-notes`,
      color: "green",
    },
    {
      key: "pastPapers",
      label: "Past Papers",
      description: "Previous exam papers with solutions and mark schemes",
      icon: Calendar,
      href: `past-papers`,
      color: "purple",
    },
    // {
    //   key: "flashcards",
    //   label: "Flashcards",
    //   description: "Study cards for quick revision and memorization",
    //   icon: BookOpen,
    //   href: `#`,
    //   color: "orange",
    // },
    // {
    //   key: "targetTests",
    //   label: "Target Tests",
    //   description: "Custom tests focused on specific topics and skills",
    //   icon: Users,
    //   href: `#`,
    //   color: "red",
    // },
    // {
    //   key: "mockExams",
    //   label: "Mock Exams",
    //   description: "Full-length practice exams with timed conditions",
    //   icon: Calendar,
    //   href: `#`,
    //   color: "indigo",
    // },
  ];

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
        text: "Failed to load resources",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleResource = async (resourceKey, enabled) => {
    try {
      setUpdating(true);
      await toggleResourceType(subjectId, courseId, examBoard, resourceKey, {
        isEnabled: enabled,
      });

      setResources((prev) => ({
        ...prev,
        resources: {
          ...prev.resources,
          [resourceKey]: {
            ...prev.resources[resourceKey],
            isEnabled: enabled,
          },
        },
      }));

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: `${resourceKey.replace(/([A-Z])/g, " $1")} ${
          enabled ? "enabled" : "disabled"
        }`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error toggling resource:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update resource",
      });
    } finally {
      setUpdating(false);
    }
  };

  const getResourceStats = (resourceKey) => {
    if (!resources?.resources?.[resourceKey]) {
      return { count: 0, enabled: false };
    }

    const resource = resources.resources[resourceKey];
    let count = 0;

    switch (resourceKey) {
      case "examQuestions":
        count =
          resource.topics?.reduce(
            (total, topic) =>
              total +
              topic.subSections?.reduce(
                (subTotal, subSection) =>
                  subTotal + (subSection.mcqs?.length || 0),
                0
              ),
            0
          ) || 0;
        break;
      case "revisionNotes":
        count = resource.topics?.length || 0;
        break;
      case "pastPapers":
        count = resource.papers?.length || 0;
        break;
      case "flashcards":
        count = resource.cards?.length || 0;
        break;
      case "targetTests":
        count = resource.tests?.length || 0;
        break;
      case "mockExams":
        count = resource.exams?.length || 0;
        break;
      default:
        count = 0;
    }

    return {
      count,
      enabled: resource.isEnabled || false,
    };
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

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/dashboard/courses/${courseId}`)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Resource Management
              </h1>
              <p className="text-gray-600">
                {resources?.subject?.name || "Subject"} • {examBoard}
              </p>
            </div>
          </div>
        </div>

        {/* Resource Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resourceTypes.map((resource) => {
            const IconComponent = resource.icon;
            const stats = getResourceStats(resource.key);
            const colorClasses = {
              blue: "bg-blue-100 text-blue-600",
              green: "bg-green-100 text-green-600",
              purple: "bg-purple-100 text-purple-600",
              orange: "bg-orange-100 text-orange-600",
              red: "bg-red-100 text-red-600",
              indigo: "bg-indigo-100 text-indigo-600",
            };

            return (
              <div
                key={resource.key}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl ${
                        colorClasses[resource.color]
                      }`}
                    >
                      <IconComponent size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {resource.label}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {stats.count} items
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleToggleResource(resource.key, !stats.enabled)
                    }
                    disabled={updating}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                      stats.enabled ? "bg-blue-600" : "bg-gray-200"
                    } ${updating ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <span
                      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                        stats.enabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {resource.description}
                </p>

                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      stats.enabled
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {stats.enabled ? "Active" : "Inactive"}
                  </span>

                  {resource.href !== "#" && stats.enabled && (
                    <Link
                      href={`/dashboard/courses/${courseId}/resources/${subjectId}/${examBoard}/${resource.href}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                    >
                      Manage
                      <ArrowLeft size={16} className="rotate-180" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href={`/dashboard/courses/${courseId}/resources/${subjectId}/${examBoard}/exam-questions`}
              className="bg-blue-50 border border-blue-200 rounded-xl p-4 hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="text-blue-600" size={20} />
                <div>
                  <h3 className="font-semibold text-blue-900">Add MCQ</h3>
                  <p className="text-sm text-blue-700">Create new questions</p>
                </div>
              </div>
            </Link>

            <Link
              href={`/dashboard/courses/${courseId}/resources/${subjectId}/${examBoard}/revision-notes`}
              className="bg-green-50 border border-green-200 rounded-xl p-4 hover:bg-green-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <StickyNote className="text-green-600" size={20} />
                <div>
                  <h3 className="font-semibold text-green-900">Add Notes</h3>
                  <p className="text-sm text-green-700">
                    Create revision content
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href={`/dashboard/courses/${courseId}/resources/${subjectId}/${examBoard}/past-papers`}
              className="bg-purple-50 border border-purple-200 rounded-xl p-4 hover:bg-purple-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Calendar className="text-purple-600" size={20} />
                <div>
                  <h3 className="font-semibold text-purple-900">Add Papers</h3>
                  <p className="text-sm text-purple-700">Upload past papers</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResourceManagementPage;
