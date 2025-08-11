"use client";
import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../layout/DashboardLayout";
import {
  Users,
  BookOpen,
  GraduationCap,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Check,
  X,
  ArrowLeft,
  ZoomIn,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getTeacherById, approveTeacher } from "../../../../api/teacher.api";
import Swal from "sweetalert2";

// Image Modal Component
const ImageModal = ({ isOpen, onClose, imageUrl, altText }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-full">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
          aria-label="Close modal"
        >
          <X size={32} />
        </button>

        {/* Image container */}
        <div
          className="relative bg-white rounded-lg overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative w-full h-full min-h-[400px] max-h-[80vh] aspect-square">
            <Image
              src={imageUrl}
              alt={altText}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 80vw"
            />
          </div>
        </div>

        {/* Image info */}
        <div className="text-center mt-4">
          <p className="text-white text-sm opacity-75">{altText}</p>
          <p className="text-white text-xs opacity-50 mt-1">
            Click outside or press X to close
          </p>
        </div>
      </div>
    </div>
  );
};

const TeacherDetailsPage = ({ params }) => {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const router = useRouter();

  // Fix: Handle params properly
  const teacherId = params?.id;

  const fetchTeacher = async () => {
    if (!teacherId) {
      setError("No teacher ID provided");
      setLoading(false);
      return;
    }

    try {
      const response = await getTeacherById(teacherId);
      if (response.data.data) {
        setTeacher(response.data.data);
      } else {
        setError("Failed to fetch teacher data");
      }
    } catch (error) {
      setError("Error fetching teacher data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacher();
  }, [teacherId]);

  const toggleApproval = async () => {
    if (!teacher) return;

    Swal.fire({
      title: `Are you sure?`,
      text: teacher.isApproved
        ? "This will unapprove the teacher."
        : "This will approve the teacher.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: teacher.isApproved
        ? "Yes, unapprove!"
        : "Yes, approve!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await approveTeacher(teacher._id, {
            isApproved: !teacher.isApproved,
          });

          if (response.data.success) {
            await fetchTeacher(); // get latest teacher from backend
            Swal.fire({
              title: "Success!",
              text: `Teacher has been ${
                teacher.isApproved ? "unapproved" : "approved"
              }.`,
              icon: "success",
            });
          }
        } catch (error) {
          console.error("Error updating approval status:", error);
          Swal.fire({
            title: "Error!",
            text: "Something went wrong while updating approval status.",
            icon: "error",
          });
        }
      }
    });
  };

  // Close modal on ESC key press
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape" && imageModalOpen) {
        setImageModalOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [imageModalOpen]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-2">{error}</p>
            <Link
              href="/dashboard/teachers"
              className="text-blue-600 hover:underline mt-2 inline-block"
            >
              Back to Teachers
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Check if teacher data exists
  if (!teacher) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-gray-600">Teacher not found</p>
            <Link
              href="/dashboard/teachers"
              className="text-blue-600 hover:underline mt-2 inline-block"
            >
              Back to Teachers
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <Link
            href="/dashboard/teachers"
            className="flex items-center text-blue-600 hover:underline"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Teachers
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Teacher Header */}
          <div className="bg-gray-50 p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Updated profile image section with modal functionality */}
              <div
                className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-md cursor-pointer group"
                onClick={() =>
                  teacher.profilePhotoUrl && setImageModalOpen(true)
                }
              >
                {teacher.profilePhotoUrl ? (
                  <>
                    <Image
                      src={teacher.profilePhotoUrl}
                      alt={teacher.user?.name || "Teacher"}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    {/* Hover overlay with zoom icon */}
                    <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                      <ZoomIn
                        size={24}
                        className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      />
                    </div>
                  </>
                ) : (
                  <div className="bg-blue-100 h-full w-full flex items-center justify-center text-blue-600 text-4xl font-medium">
                    {teacher.user?.name?.charAt(0) || "T"}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      {teacher.user?.name || "Unknown Teacher"}
                    </h1>
                    <p className="text-lg text-gray-600">
                      {teacher.currentRole || "No role specified"}
                    </p>
                    <p className="text-md text-blue-600">
                      {teacher.speciality || "No speciality"}
                    </p>
                  </div>
                  <button
                    onClick={toggleApproval}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                      teacher.isApproved
                        ? "bg-red-100 text-red-800 hover:bg-red-200"
                        : "bg-green-100 text-green-800 hover:bg-green-200"
                    }`}
                  >
                    {teacher.isApproved ? (
                      <>
                        <X size={16} /> Revoke Approval
                      </>
                    ) : (
                      <>
                        <Check size={16} /> Approve Teacher
                      </>
                    )}
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-gray-500" />
                    <span className="text-gray-800">
                      {teacher.user?.email || "No email"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-500" />
                    <span className="text-gray-800">
                      {teacher.phoneNumber || "No phone"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-500" />
                    <span className="text-gray-800">
                      {teacher.location || "No location"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-500" />
                    <span className="text-gray-800">
                      {teacher.birthDate
                        ? new Date(teacher.birthDate).toLocaleDateString()
                        : "No birth date"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-gray-500" />
                    <span className="text-gray-800">
                      {teacher.fee || 0} PKR/hour
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-gray-500" />
                    <span className="text-gray-800">
                      {teacher.gender === "male"
                        ? "Male"
                        : teacher.gender === "female"
                        ? "Female"
                        : "Not specified"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Users size={18} /> About
                </h2>
                <p className="text-gray-700">
                  {teacher.profileDescription || "No description available"}
                </p>
              </div>

              {/* Subjects */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <BookOpen size={18} /> Subjects
                </h2>
                {teacher.subjects?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {teacher.subjects.map((subject, index) => (
                      <div
                        key={index}
                        className="bg-white p-3 rounded border border-gray-200"
                      >
                        <h3 className="font-medium text-gray-800">
                          {subject?.name || "Unknown subject"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Levels: {subject?.fromLevel || "N/A"} to{" "}
                          {subject?.toLevel || "N/A"}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No subjects added</p>
                )}
              </div>

              {/* Experience */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Briefcase size={18} /> Experience
                </h2>
                {teacher.experience?.length > 0 ? (
                  <div className="space-y-4">
                    {teacher.experience.map((exp, index) => (
                      <div
                        key={index}
                        className="bg-white p-3 rounded border border-gray-200"
                      >
                        <div className="flex justify-between">
                          <h3 className="font-medium text-gray-800">
                            {exp?.designation || "Unknown role"} at{" "}
                            {exp?.organization || "Unknown organization"}
                          </h3>
                          <span className="text-sm text-gray-600">
                            {exp?.startMonth || ""} {exp?.startYear || ""} -{" "}
                            {exp?.currentlyWorking
                              ? "Present"
                              : `${exp?.endMonth || ""} ${exp?.endYear || ""}`}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {exp?.city || "Unknown city"} •{" "}
                          {exp?.currentlyWorking ? "Current" : "Past"} Position
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No experience added</p>
                )}
              </div>

              {/* Languages */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Users size={18} /> Languages
                </h2>
                <p className="text-gray-700">
                  {teacher.languages?.join(", ") || "No languages specified"}
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Education */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <GraduationCap size={18} /> Education
                </h2>
                {teacher.education?.length > 0 ? (
                  <div className="space-y-4">
                    {teacher.education.map((edu, index) => (
                      <div
                        key={index}
                        className="bg-white p-3 rounded border border-gray-200"
                      >
                        <h3 className="font-medium text-gray-800">
                          {edu?.degreeName || "Unknown degree"} (
                          {edu?.degreeType || "Unknown type"})
                        </h3>
                        <p className="text-sm text-gray-600">
                          {edu?.institution || "Unknown institution"},{" "}
                          {edu?.city || "Unknown city"}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {edu?.association || "No association"}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No education added</p>
                )}
              </div>

              {/* Experience Summary */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  Experience Summary
                </h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Experience:</span>
                    <span className="font-medium">
                      {teacher.totalExperience || 0} years
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Teaching Experience:</span>
                    <span className="font-medium">
                      {teacher.teachingExperience || 0} years
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Online Teaching:</span>
                    <span className="font-medium">
                      {teacher.onlineTeachingExperience || 0} years
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  Additional Information
                </h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Teaching Preferences
                    </h3>
                    <p className="text-gray-800">
                      {teacher.availableForOnline ? "Online" : ""}
                      {teacher.availableForOnline && teacher.willingToTravel
                        ? " & "
                        : ""}
                      {teacher.willingToTravel ? "In-person" : ""}
                      {!teacher.availableForOnline && !teacher.willingToTravel
                        ? "Not specified"
                        : ""}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Digital Tools
                    </h3>
                    <p className="text-gray-800">
                      {teacher.hasDigitalPen
                        ? "Has digital pen"
                        : "No digital pen"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Homework Help
                    </h3>
                    <p className="text-gray-800">
                      {teacher.helpsWithHomework
                        ? "Provides help"
                        : "Doesn't provide"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Employment Status
                    </h3>
                    <p className="text-gray-800">
                      {teacher.currentlyEmployed
                        ? "Currently employed"
                        : "Not currently employed"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Opportunities
                    </h3>
                    <p className="text-gray-800">
                      {teacher.opportunities || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Fee Details
                    </h3>
                    <p className="text-gray-800">
                      {teacher.feeDetails || "No fee details"}
                    </p>
                  </div>
                </div>
              </div>

              {/* ID Proof */}
              {teacher.idProofUrl && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">
                    ID Proof ({teacher.idProofType || "Unknown type"})
                  </h2>
                  <div className="relative h-50 w-full border border-gray-200 rounded overflow-hidden">
                    <Image
                      src={teacher.idProofUrl}
                      alt={`${teacher.user?.name || "Teacher"}'s ID Proof`}
                      fill
                      className="object-fit bg-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Image Modal */}
        <ImageModal
          isOpen={imageModalOpen}
          onClose={() => setImageModalOpen(false)}
          imageUrl={teacher?.profilePhotoUrl}
          altText={`${teacher?.user?.name || "Teacher"}'s Profile Photo`}
        />
      </div>
    </DashboardLayout>
  );
};

export default TeacherDetailsPage;
