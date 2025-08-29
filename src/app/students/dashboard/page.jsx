"use client";
import { useState, useEffect } from "react";
import StudentDashboardLayout from "../../layout/student/DashboardLayout";
import {
  DocumentTextIcon,
  UserGroupIcon,
  CreditCardIcon,
  StarIcon,
  ChartBarIcon,
  CalendarIcon,
  BellIcon,
  PlusIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { getCurrentUser } from "../../../api/user.api";
import Link from "next/link";
const StudentDashboardPage = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await getCurrentUser();
        setStudentData(response.data.data);
      } catch (error) {
        console.error("Error fetching student data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  if (loading) {
    return (
      <StudentDashboardLayout title="Dashboard">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </StudentDashboardLayout>
    );
  }

  return (
    <StudentDashboardLayout title="Dashboard">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">
                  Welcome back, {studentData?.name?.split(" ")[0] || "Student"}!
                </h1>
                <p className="mt-2 text-blue-100 text-sm sm:text-base">
                  Ready to find your perfect tutor today? Let's explore your
                  learning journey.
                </p>
              </div>
              <div className="hidden sm:block">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                  <DocumentTextIcon className="h-8 w-8 text-white mx-auto mb-2" />
                  <p className="text-xs text-blue-100">Learning Hub</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            icon={<DocumentTextIcon className="h-6 w-6 text-blue-500" />}
            title="Total Posts"
            value="8"
            change="+2 this week"
            bgColor="bg-blue-50"
            borderColor="border-blue-200"
          />
          <StatCard
            icon={<UserGroupIcon className="h-6 w-6 text-green-500" />}
            title="Active Tutors"
            value="3"
            change="+1 this week"
            bgColor="bg-green-50"
            borderColor="border-green-200"
          />
          <StatCard
            icon={<CreditCardIcon className="h-6 w-6 text-yellow-500" />}
            title="Wallet Balance"
            value={`${studentData?.wallet?.coins || 150} Coins`}
            change="Ready to use"
            bgColor="bg-yellow-50"
            borderColor="border-yellow-200"
          />
          <StatCard
            icon={<StarIcon className="h-6 w-6 text-purple-500" />}
            title="Reviews Given"
            value="12"
            change="Keep reviewing!"
            bgColor="bg-purple-50"
            borderColor="border-purple-200"
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow-lg rounded-xl mb-8 border border-gray-100">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-semibold text-gray-900 flex items-center">
                <BellIcon className="h-5 w-5 mr-2 text-blue-500" />
                Recent Activity
              </h3>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                Last 7 days
              </span>
            </div>
          </div>
          <div className="px-6 py-5">
            <ul className="space-y-4">
              <ActivityItem
                icon={<BellIcon className="h-5 w-5 text-blue-500" />}
                title="New tutor application received"
                description="3 tutors applied for your Mathematics post"
                time="2 hours ago"
                priority="high"
              />
              <ActivityItem
                icon={
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-green-500" />
                }
                title="Message from tutor"
                description="Ahmed Khan sent you a message about your Physics requirement"
                time="4 hours ago"
                priority="medium"
              />
              <ActivityItem
                icon={<CalendarIcon className="h-5 w-5 text-purple-500" />}
                title="Session scheduled"
                description="Your Chemistry session with Sara Ali is confirmed for tomorrow 4:00 PM"
                time="1 day ago"
                priority="low"
              />
              <ActivityItem
                icon={<StarIcon className="h-5 w-5 text-yellow-500" />}
                title="Review reminder"
                description="Rate your recent session with John Smith"
                time="2 days ago"
                priority="low"
              />
            </ul>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Primary Actions */}
          <div className="bg-white shadow-lg rounded-xl border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-semibold text-gray-900">
                Quick Actions
              </h3>
            </div>
            <div className="px-6 py-5 space-y-4">
              <ActionCard
                title="Post New Requirement"
                description="Share what subject you need help with and find the perfect tutor"
                buttonText="Create Post"
                href="/student/my-posts/create"
                icon={<PlusIcon className="h-5 w-5" />}
                buttonColor="bg-blue-600 hover:bg-blue-700"
              />
              <ActionCard
                title="Find Tutors"
                description="Browse through our verified tutors and find your match"
                buttonText="Explore Tutors"
                href="/student/find-tutors"
                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                buttonColor="bg-green-600 hover:bg-green-700"
              />
            </div>
          </div>

          {/* Secondary Actions */}
          <div className="bg-white shadow-lg rounded-xl border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-semibold text-gray-900">
                Your Learning Hub
              </h3>
            </div>
            <div className="px-6 py-5 space-y-4">
              <ActionCard
                title="View My Posts"
                description="Manage your tutoring requirements and applications"
                buttonText="View Posts"
                href="/student/my-posts"
                icon={<EyeIcon className="h-5 w-5" />}
                buttonColor="bg-purple-600 hover:bg-purple-700"
              />
              <ActionCard
                title="Messages & Chat"
                description="Connect with tutors and discuss your learning needs"
                buttonText="Open Messages"
                href="/student/messages"
                icon={<ChatBubbleLeftRightIcon className="h-5 w-5" />}
                buttonColor="bg-indigo-600 hover:bg-indigo-700"
              />
            </div>
          </div>
        </div>

        {/* Recent Posts & Performance Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Posts */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-lg rounded-xl border border-gray-100">
              <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg leading-6 font-semibold text-gray-900">
                    Your Recent Posts
                  </h3>
                  <Link
                    href="/student/my-posts"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View all →
                  </Link>
                </div>
              </div>
              <div className="px-6 py-5">
                <div className="space-y-4">
                  <PostItem
                    title="Mathematics - Calculus Help Needed"
                    subject="Mathematics"
                    level="University Level"
                    applicants="5 applications"
                    status="active"
                    postedDate="2 days ago"
                  />
                  <PostItem
                    title="Physics - Mechanics and Thermodynamics"
                    subject="Physics"
                    level="A-Level"
                    applicants="3 applications"
                    status="active"
                    postedDate="5 days ago"
                  />
                  <PostItem
                    title="English Literature - Essay Writing"
                    subject="English"
                    level="High School"
                    applicants="7 applications"
                    status="closed"
                    postedDate="1 week ago"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Learning Progress & Tips */}
          <div className="space-y-6">
            {/* Learning Progress */}
            <div className="bg-white shadow-lg rounded-xl border border-gray-100">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-semibold text-gray-900">
                  Learning Progress
                </h3>
              </div>
              <div className="px-6 py-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Sessions Completed
                    </span>
                    <span className="text-sm font-bold text-blue-600">
                      12/15
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                      style={{ width: "80%" }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm font-medium text-gray-700">
                      Profile Completion
                    </span>
                    <span className="text-sm font-bold text-green-600">
                      90%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                      style={{ width: "90%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-indigo-900 mb-3">
                💡 Quick Tips
              </h4>
              <ul className="space-y-2 text-sm text-indigo-700">
                <li className="flex items-start space-x-2">
                  <span className="text-indigo-500 mt-1">•</span>
                  <span>Complete your profile to attract better tutors</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-indigo-500 mt-1">•</span>
                  <span>Be specific about your learning goals in posts</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-indigo-500 mt-1">•</span>
                  <span>Review tutors after sessions to help others</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </StudentDashboardLayout>
  );
};

const StatCard = ({ icon, title, value, change, bgColor, borderColor }) => {
  return (
    <div
      className={`bg-white overflow-hidden shadow-lg rounded-xl border ${borderColor} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
    >
      <div className="px-6 py-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${bgColor} rounded-xl p-3 shadow-sm`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-bold text-gray-900">{value}</div>
              <div className="ml-2 text-sm font-medium text-gray-500">
                {change}
              </div>
            </dd>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActivityItem = ({ icon, title, description, time, priority }) => {
  const priorityColors = {
    high: "border-l-4 border-red-400 bg-red-50",
    medium: "border-l-4 border-yellow-400 bg-yellow-50",
    low: "border-l-4 border-blue-400 bg-blue-50",
  };

  return (
    <li
      className={`py-4 px-4 rounded-lg ${priorityColors[priority]} transition-all duration-200 hover:shadow-md`}
    >
      <div className="flex space-x-4">
        <div className="flex-shrink-0 bg-white rounded-full p-2 shadow-sm">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
          <p className="text-xs text-gray-400 mt-2">{time}</p>
        </div>
        <div className="flex-shrink-0">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              priority === "high"
                ? "bg-red-100 text-red-800"
                : priority === "medium"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {priority}
          </span>
        </div>
      </div>
    </li>
  );
};

const ActionCard = ({
  title,
  description,
  buttonText,
  href,
  icon,
  buttonColor,
}) => {
  return (
    <div className="group border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all duration-300 bg-gradient-to-br from-gray-50 to-white">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg p-3 group-hover:from-blue-200 group-hover:to-indigo-200 transition-all duration-300">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            {description}
          </p>
          <Link
            href={href}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white ${buttonColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105`}
          >
            {buttonText}
            <svg
              className="ml-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

const PostItem = ({
  title,
  subject,
  level,
  applicants,
  status,
  postedDate,
}) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-300 bg-gradient-to-r from-gray-50 to-white">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="text-base font-semibold text-gray-900 mb-2">
            {title}
          </h4>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {subject}
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {level}
            </span>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                status === "active"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {status}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{applicants}</span>
            <span>{postedDate}</span>
          </div>
        </div>
        <div className="ml-4">
          <Link
            href="/student/my-posts"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View
            <EyeIcon className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardPage;
