"use client";
import { useEffect, useState } from "react";
import { API } from "../../../api/api";
import DashboardLayout from "../../layout/teacher/DashboardLayout";
import Link from "next/link";
import {
  UserCircleIcon,
  CakeIcon,
  MapPinIcon,
  PhoneIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  GlobeAltIcon,
  PencilIcon,
  IdentificationIcon,
  CheckBadgeIcon,
  BookOpenIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import Modal from "../../../components/Modal";

const TeacherProfilePage = () => {
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    const fetchTeacherProfile = async () => {
      try {
        const response = await API.get("/teachers/me");
        setTeacherData(response.data.data);
      } catch (error) {
        console.error("Error fetching teacher profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherProfile();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Teacher Profile">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!teacherData) {
    return (
      <DashboardLayout title="Teacher Profile">
        <div className="text-center py-10">
          <p className="text-gray-600">Failed to load profile data.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Teacher Profile">
      {/* Image Zoom Modal */}
      <Modal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        title="Profile Photo"
      >
        <div className="flex justify-center p-4">
          <img
            src={teacherData.profilePhotoUrl || "/default-avatar.png"}
            alt="Profile"
            className="max-h-[80vh] max-w-full rounded-lg object-contain"
          />
        </div>
      </Modal>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4">
              <div
                className="relative cursor-pointer"
                onClick={() => setIsImageModalOpen(true)}
              >
                <img
                  src={teacherData.profilePhotoUrl || "/default-avatar.png"}
                  alt="Profile"
                  className="w-20 h-20 rounded-full border-4 border-white/30 object-cover hover:border-white/50 transition-all duration-200"
                />
                {teacherData.isApproved && (
                  <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1">
                    <CheckBadgeIcon className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{teacherData.user.name}</h1>
                <p className="text-blue-100">{teacherData.speciality}</p>
                <p className="text-sm text-blue-200 mt-1">
                  {teacherData.currentRole}
                </p>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <Link
                href="/teachers/profile/edit"
                className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-md font-medium hover:bg-blue-50 transition-colors shadow-sm"
              >
                <PencilIcon className="h-5 w-5 mr-2" />
                Edit Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-1">
            {/* Personal Information */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <UserCircleIcon className="h-5 w-5 mr-2 text-blue-500" />
                Personal Information
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{teacherData.user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{teacherData.user.email}</p>
                </div>
                <div className="flex items-start">
                  <CakeIcon className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="font-medium">
                      {new Date(teacherData.birthDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPinIcon className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{teacherData.location}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <PhoneIcon className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium">{teacherData.phoneNumber}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <IdentificationIcon className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">ID Proof</p>
                    <p className="font-medium">{teacherData.idProofType}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Summary */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <BriefcaseIcon className="h-5 w-5 mr-2 text-blue-500" />
                Professional Summary
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Speciality</p>
                  <p className="font-medium">{teacherData.speciality}</p>
                </div>
                <div className="flex items-start">
                  <CurrencyDollarIcon className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Fee</p>
                    <p className="font-medium">{teacherData.fee} PKR/hour</p>
                    <p className="text-xs text-gray-500">
                      {teacherData.feeDetails}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Experience</p>
                  <p className="font-medium">
                    {teacherData.totalExperience} years
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Teaching Experience</p>
                  <p className="font-medium">
                    {teacherData.teachingExperience} years
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    Online Teaching Experience
                  </p>
                  <p className="font-medium">
                    {teacherData.onlineTeachingExperience} years
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column */}
          <div className="space-y-6 lg:col-span-1">
            {/* Subjects */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <BookOpenIcon className="h-5 w-5 mr-2 text-blue-500" />
                Subjects Offered
              </h2>
              <div className="space-y-4">
                {teacherData.subjects?.length > 0 ? (
                  teacherData.subjects.map((subject, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-blue-400 pl-4"
                    >
                      <h3 className="font-medium text-gray-800">
                        {subject.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Levels: {subject.fromLevel} - {subject.toLevel}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No subjects added</p>
                )}
              </div>
            </div>

            {/* Education */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <AcademicCapIcon className="h-5 w-5 mr-2 text-blue-500" />
                Education
              </h2>
              <div className="space-y-4">
                {teacherData.education?.length > 0 ? (
                  teacherData.education.map((edu, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-blue-400 pl-4"
                    >
                      <h3 className="font-medium text-gray-800">
                        {edu.degreeName} ({edu.degreeType})
                      </h3>
                      <p className="text-sm text-gray-600">
                        {edu.institution}, {edu.city}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {edu.association}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No education details added</p>
                )}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <BuildingOfficeIcon className="h-5 w-5 mr-2 text-blue-500" />
                Experience
              </h2>
              <div className="space-y-4">
                {teacherData.experience?.length > 0 ? (
                  teacherData.experience.map((exp, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-blue-400 pl-4"
                    >
                      <h3 className="font-medium text-gray-800">
                        {exp.designation}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {exp.organization}, {exp.city}
                      </p>
                      <p className="text-sm text-gray-600">
                        {exp.startMonth} {exp.startYear} -{" "}
                        {exp.currentlyWorking
                          ? "Present"
                          : `${exp.endMonth} ${exp.endYear}`}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No experience details added</p>
                )}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <GlobeAltIcon className="h-5 w-5 mr-2 text-blue-500" />
                Availability & Preferences
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-gray-500">Willing to Travel</p>
                  <p className="font-medium">
                    {teacherData.willingToTravel ? "Yes" : "No"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Available Online</p>
                  <p className="font-medium">
                    {teacherData.availableForOnline ? "Yes" : "No"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Has Digital Pen</p>
                  <p className="font-medium">
                    {teacherData.hasDigitalPen ? "Yes" : "No"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Helps with Homework</p>
                  <p className="font-medium">
                    {teacherData.helpsWithHomework ? "Yes" : "No"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Currently Employed</p>
                  <p className="font-medium">
                    {teacherData.currentlyEmployed ? "Yes" : "No"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Opportunities</p>
                  <p className="font-medium capitalize">
                    {teacherData.opportunities}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6 lg:col-span-1">
            {/* Experience */}

            {/* Additional Information */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <TrophyIcon className="h-5 w-5 mr-2 text-blue-500" />
                Additional Information
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Languages</p>
                  <p className="font-medium">
                    {teacherData.languages?.join(", ")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Profile Description</p>
                  <p className="font-medium text-gray-700 whitespace-pre-line">
                    {teacherData.profileDescription}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Approval Status</p>
                  <p className="font-medium">
                    {teacherData.isApproved ? (
                      <span className="text-green-600">Approved</span>
                    ) : (
                      <span className="text-yellow-600">Pending Approval</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherProfilePage;
