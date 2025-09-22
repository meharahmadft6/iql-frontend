"use client";
import { useEffect, useState } from "react";
import { getTeacherApplications } from "../../../api/teacherApplications.api";
import DashboardLayout from "../../layout/teacher/DashboardLayout";
import Link from "next/link";
import {
  AcademicCapIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  PhoneIcon,
  EyeIcon,
  ClockIcon,
  CheckBadgeIcon,
  XCircleIcon,
  EnvelopeIcon,
  UserCircleIcon,
  ChartBarIcon,
  TrendingUpIcon,
  BanknotesIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import ContactInfoModal from "../../../components/ContactInfoModal";
const TeacherApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedContactInfo, setSelectedContactInfo] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        const teacherId = userData.id || "current-teacher-id";

        const response = await getTeacherApplications(teacherId);
        setApplications(response.data.data || []);
        setStats(response.data.stats || {});
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleViewContact = (application) => {
    if (application.contactInfo) {
      setSelectedApplication(application); // Store the full application
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: ClockIcon,
        label: "Pending",
      },
      contacted: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: EyeIcon,
        label: "Contacted",
      },
      accepted: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckBadgeIcon,
        label: "Accepted",
      },
      rejected: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XCircleIcon,
        label: "Rejected",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}
      >
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const StatCard = ({ title, value, icon: Icon, color, description }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${color}`}>
          {Icon && <Icon className="h-6 w-6 text-white" />}
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  );

  const ContactInfoCard = ({ contactInfo, onClose }) => {
    if (!contactInfo) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="mt-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Contact Information
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center mb-4">
                <UserCircleIcon className="h-10 w-10 text-blue-500" />
                <div className="ml-3">
                  <h4 className="text-lg font-medium text-gray-900">
                    {contactInfo.student.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Student Contact Details
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">
                      {contactInfo.student.email}
                    </p>
                  </div>
                </div>

                {contactInfo.student.phone && (
                  <div className="flex items-center">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="text-sm text-gray-900">
                        {contactInfo.student.phone.countryCode}{" "}
                        {contactInfo.student.phone.number}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <DashboardLayout title="My Applications">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Applications">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Applications"
          value={stats.total || 0}
          icon={DocumentTextIcon}
          color="bg-blue-500"
          description="All time applications"
        />
        <StatCard
          title="This Month"
          value={stats.thisMonth || 0}
          icon={TrendingUpIcon}
          color="bg-green-500"
          description="Applications this month"
        />
        <StatCard
          title="Response Rate"
          value={`${
            stats.total > 0
              ? Math.round(
                  ((stats.contacted + stats.accepted) / stats.total) * 100
                )
              : 0
          }%`}
          icon={ChartBarIcon}
          color="bg-purple-500"
          description="Contacted + Accepted"
        />
        <StatCard
          title="Total Cost"
          value={`${stats.totalCostSpent || 0} Coins`}
          icon={BanknotesIcon}
          color="bg-orange-500"
          description="Application fees spent"
        />
      </div>

      {/* Status Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Application Status Summary
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending || 0}
            </div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.contacted || 0}
            </div>
            <div className="text-sm text-gray-500">Contacted</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.accepted || 0}
            </div>
            <div className="text-sm text-gray-500">Accepted</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.rejected || 0}
            </div>
            <div className="text-sm text-gray-500">Rejected</div>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            All Applications
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            View and manage your teaching applications
          </p>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-12">
            <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No applications found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              You haven't applied to any teaching positions yet.
            </p>
            <div className="mt-6">
              <Link
                href="/teachers/jobs"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Browse Available Jobs
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {applications.map((application) => (
              <div
                key={application._id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {application.postRequirement.user.name}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          {getStatusBadge(application.status)}
                          <span className="text-sm text-gray-500">
                            Applied{" "}
                            {new Date(
                              application.appliedAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {application.postRequirement.description.length > 200
                          ? `${application.postRequirement.description.substring(
                              0,
                              200
                            )}...`
                          : application.postRequirement.description}
                      </p>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Subjects Required:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {application.postRequirement.subjects.map(
                          (subject, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {subject.name} ({subject.level})
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center text-gray-500">
                        <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">
                          {application.postRequirement.location.split(",")[0]}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <CurrencyDollarIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>
                          {application.postRequirement.budget.amount}{" "}
                          {application.postRequirement.budget.currency} /{" "}
                          {application.postRequirement.budget.frequency}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <PhoneIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>
                          {application.postRequirement.meetingOptions.join(
                            ", "
                          )}
                        </span>
                      </div>
                    </div>

                    {application.contactedAt && (
                      <div className="mt-3 text-sm text-green-600">
                        <EyeIcon className="h-4 w-4 inline mr-1" />
                        Contacted on{" "}
                        {new Date(application.contactedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 lg:mt-0 lg:ml-6 flex-shrink-0">
                    <div className="flex flex-col gap-2">
                      {application.contactInfo ? (
                        <button
                          onClick={() => handleViewContact(application)}
                          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <EnvelopeIcon className="h-4 w-4 mr-2" />
                          View Contact Info
                        </button>
                      ) : (
                        <span className="inline-flex items-center justify-center px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-md">
                          <ClockIcon className="h-4 w-4 mr-2" />
                          Awaiting Response
                        </span>
                      )}

                      <div className="text-xs text-gray-500 text-center">
                        Cost: {application.applicationCost} Coins
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact Info Modal */}
      <ContactInfoModal
        isOpen={!!selectedApplication}
        onClose={() => setSelectedApplication(null)}
        application={selectedApplication}
      />
    </DashboardLayout>
  );
};

export default TeacherApplicationsPage;
