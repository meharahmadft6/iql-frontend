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
  ExclamationTriangleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { getCurrentUser } from "../../../api/user.api";
import { getStudentPostRequirements } from "../../../api/postRequirement.api";
import Link from "next/link";

const StudentDashboardPage = () => {
  const [studentData, setStudentData] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await getCurrentUser();
        setStudentData(response.data.data);

        // Only fetch posts if user is verified
        if (response.data.data?.isVerified) {
          await fetchRecentPosts();
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchRecentPosts = async () => {
      try {
        setPostsLoading(true);
        const response = await getStudentPostRequirements();
        // Get the last 3 posts (most recent)
        const posts = response.data.data || [];
        setRecentPosts(posts.slice(0, 3));
      } catch (error) {
        console.error("Error fetching recent posts:", error);
      } finally {
        setPostsLoading(false);
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
                  {studentData?.isVerified
                    ? "Ready to find your perfect tutor today? Let's explore your learning journey."
                    : "Please verify your account to connect with tutors and post your requirements."}
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

        {/* Verification Alert for Unverified Users */}
        {!studentData?.isVerified && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Account Verification Required</strong>
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Please verify your email to connect with tutors and post your
                  requirements. Unverified accounts will have their posts marked
                  as pending and may be removed later.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            icon={<DocumentTextIcon className="h-6 w-6 text-blue-500" />}
            title="Total Posts"
            value={studentData?.isVerified ? "8" : "0"}
            change={studentData?.isVerified ? "+2 this week" : "Verify to post"}
            bgColor="bg-blue-50"
            borderColor="border-blue-200"
          />
          <StatCard
            icon={<UserGroupIcon className="h-6 w-6 text-green-500" />}
            title="Active Tutors"
            value={studentData?.isVerified ? "3" : "0"}
            change={
              studentData?.isVerified ? "+1 this week" : "Verify to connect"
            }
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
            value={studentData?.isVerified ? "12" : "0"}
            change={
              studentData?.isVerified ? "Keep reviewing!" : "Verify to review"
            }
            bgColor="bg-purple-50"
            borderColor="border-purple-200"
          />
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
                href="/students/myposts/create"
                icon={<PlusIcon className="h-5 w-5" />}
                buttonColor="bg-blue-600 hover:bg-blue-700"
                disabled={!studentData?.isVerified}
              />
              <ActionCard
                title="Find Tutors"
                description="Browse through our verified tutors and find your match"
                buttonText="Explore Tutors"
                href="/students/find-tutors"
                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                buttonColor="bg-green-600 hover:bg-green-700"
                disabled={!studentData?.isVerified}
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
                href="/students/myposts"
                icon={<EyeIcon className="h-5 w-5" />}
                buttonColor="bg-purple-600 hover:bg-purple-700"
                disabled={!studentData?.isVerified}
              />
              <ActionCard
                title="Messages & Chat"
                description="Connect with tutors and discuss your learning needs"
                buttonText="Open Messages"
                href="/students/messages"
                icon={<ChatBubbleLeftRightIcon className="h-5 w-5" />}
                buttonColor="bg-indigo-600 hover:bg-indigo-700"
                disabled={!studentData?.isVerified}
              />
            </div>
          </div>
        </div>

        {/* Recent Posts Section - Only show if verified */}
        {studentData?.isVerified && (
          <div className="bg-white shadow-lg rounded-xl border border-gray-100 mb-8">
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg leading-6 font-semibold text-gray-900">
                  Your Recent Posts
                </h3>
                <Link
                  href="/students/myposts"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all →
                </Link>
              </div>
            </div>
            <div className="px-6 py-4">
              {postsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : recentPosts.length > 0 ? (
                <div className="space-y-4">
                  {recentPosts.map((post) => (
                    <RecentPostCard key={post._id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DocumentTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    You haven't created any posts yet.
                  </p>
                  <Link
                    href="/students/myposts/create"
                    className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Create Your First Post
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Learning Progress Section */}
        <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Your Learning Progress
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <ClockIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900">Hours Learned</h4>
              <p className="text-2xl font-bold text-blue-600">24</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <StarIcon className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900">Sessions Completed</h4>
              <p className="text-2xl font-bold text-green-600">12</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900">Progress Rate</h4>
              <p className="text-2xl font-bold text-purple-600">78%</p>
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

const ActionCard = ({
  title,
  description,
  buttonText,
  href,
  icon,
  buttonColor,
  disabled = false,
}) => {
  return (
    <div
      className={`group border border-gray-200 rounded-lg p-6 transition-all duration-300 bg-gradient-to-br from-gray-50 to-white ${
        disabled ? "opacity-60" : "hover:border-blue-300 hover:shadow-md"
      }`}
    >
      <div className="flex items-start space-x-4">
        <div
          className={`flex-shrink-0 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg p-3 transition-all duration-300 ${
            disabled
              ? ""
              : "group-hover:from-blue-200 group-hover:to-indigo-200"
          }`}
        >
          {icon}
        </div>
        <div className="flex-1">
          <h3
            className={`text-lg font-semibold text-gray-900 mb-2 transition-colors ${
              disabled ? "" : "group-hover:text-blue-700"
            }`}
          >
            {title}
            {disabled && (
              <span className="ml-2 text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                Verify Required
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            {description}
          </p>
          <Link
            href={disabled ? "#" : href}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white ${buttonColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
              disabled ? "cursor-not-allowed opacity-50" : "hover:scale-105"
            }`}
            onClick={(e) => disabled && e.preventDefault()}
          >
            {buttonText}
            {!disabled && (
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
            )}
          </Link>
        </div>
      </div>
    </div>
  );
};

const RecentPostCard = ({ post }) => {
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-gray-900">
            {post.subjects.map((s) => s.name).join(", ")}
          </h4>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {post.description}
          </p>
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <span>{post.location}</span>
            <span className="mx-2">•</span>
            <span>{formatDate(post.createdAt)}</span>
          </div>
        </div>
        <div className="flex-shrink-0 ml-4">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              post.isVerified
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {post.isVerified ? "Verified" : "Pending"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardPage;
