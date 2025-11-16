"use client";
import { useState, useEffect } from "react";
import StudentDashboardLayout from "../../layout/student/DashboardLayout";
import {
  DocumentTextIcon,
  UserGroupIcon,
  CreditCardIcon,
  StarIcon,
  ChartBarIcon,
  BookOpenIcon,
  PlusIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { getCurrentUser } from "../../../api/user.api";
import { getStudentPostRequirements } from "../../../api/postRequirement.api";
import {
  getStudentDashboard,
  getStudentStats,
} from "../../../api/dashboard.api";
import Link from "next/link";

const StudentDashboardPage = () => {
  const [studentData, setStudentData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        console.log("Fetching dashboard data...");

        // Fetch user data first
        const userResponse = await getCurrentUser();
        console.log("User data:", userResponse.data.data);
        setStudentData(userResponse.data.data);

        // Only fetch dashboard data if user is verified
        if (userResponse.data.data?.isVerified) {
          console.log("User is verified, fetching dashboard data...");
          const [dashboardResponse, statsResponse] = await Promise.all([
            getStudentDashboard(),
            getStudentStats(),
          ]);

          setDashboardData(dashboardResponse.data.data);
          setStatsData(statsResponse.data.data);
          await fetchRecentPosts();
        } else {
          console.log("User is not verified, skipping dashboard data");
          setDashboardData(null);
          setStatsData(null);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Even if dashboard fails, we still have user data
        if (!studentData) {
          const userResponse = await getCurrentUser();
          setStudentData(userResponse.data.data);
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchRecentPosts = async () => {
      try {
        setPostsLoading(true);
        const response = await getStudentPostRequirements();
        const posts = response.data.data || [];
        setRecentPosts(posts.slice(0, 3));
      } catch (error) {
        console.error("Error fetching recent posts:", error);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Debug current state
  useEffect(() => {
    if (studentData) {
      console.log("Current student data:", studentData);
      console.log("Is verified:", studentData.isVerified);
    }
  }, [studentData]);

  if (loading) {
    return (
      <StudentDashboardLayout title="Dashboard">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </StudentDashboardLayout>
    );
  }

  return (
    <StudentDashboardLayout title="Dashboard">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Section */}
        <WelcomeSection
          studentData={studentData}
          dashboardData={dashboardData}
        />

        {/* Verification Alert - Only show if NOT verified */}
        {studentData && !studentData.isVerified && <VerificationAlert />}

        {/* Stats Grid - Show even if not verified, but with placeholder data */}
        <StatsGrid studentData={studentData} dashboardData={dashboardData} />

        {/* Quick Actions Grid */}
        <QuickActions studentData={studentData} />

        {/* Show dashboard content only if verified and data is available */}
        {studentData?.isVerified && dashboardData && (
          <>
            {/* Course Requests Status */}
            {dashboardData?.courseRequests && (
              <CourseRequestsSection dashboardData={dashboardData} />
            )}

            {/* Recent Posts Section */}
            <RecentPostsSection
              recentPosts={recentPosts}
              postsLoading={postsLoading}
            />

            {/* Learning Progress Section */}
            <LearningProgressSection
              dashboardData={dashboardData}
              statsData={statsData}
            />

            {/* Statistics Overview */}
            {statsData && <StatisticsOverview statsData={statsData} />}
          </>
        )}

        {/* Show empty state if verified but no dashboard data */}
        {studentData?.isVerified && !dashboardData && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <AcademicCapIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Welcome to Your Dashboard
            </h3>
            <p className="text-gray-500 mb-4">
              Start your learning journey by creating your first post
              requirement.
            </p>
            <Link
              href="/students/myposts/create"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              Create Your First Post
            </Link>
          </div>
        )}
      </div>
    </StudentDashboardLayout>
  );
};

// Sub-components remain the same as your previous implementation
const WelcomeSection = ({ studentData, dashboardData }) => (
  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl">
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
      <div className="flex-1">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          Welcome back, {studentData?.name?.split(" ")[0] || "Student"}! 👋
        </h1>
        <p className="text-blue-100 text-lg mb-4 max-w-2xl">
          {studentData?.isVerified
            ? "Ready to continue your learning journey? Here's your progress overview."
            : "Complete your account verification to unlock all features and connect with tutors."}
        </p>

        {studentData?.isVerified && dashboardData && (
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="text-sm text-blue-100">Learning Progress</div>
              <div className="text-white font-semibold">
                {dashboardData.quickStats?.completedCourses || 0} Courses
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="text-sm text-blue-100">Active Connections</div>
              <div className="text-white font-semibold">
                {dashboardData.overview?.totalCourseRequests || 0} Requests
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="hidden lg:block mt-6 lg:mt-0">
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 text-center border border-white/30">
          <AcademicCapIcon className="h-12 w-12 text-white mx-auto mb-3" />
          <p className="text-white font-semibold">Learning Hub</p>
          <p className="text-blue-100 text-sm mt-1">Your educational journey</p>
        </div>
      </div>
    </div>
  </div>
);

const VerificationAlert = () => (
  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
    <div className="flex items-start">
      <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500 mt-0.5 flex-shrink-0" />
      <div className="ml-4">
        <h3 className="text-lg font-semibold text-yellow-800">
          Account Verification Required
        </h3>
        <p className="text-yellow-700 mt-1">
          Please verify your email address to unlock all features including
          posting requirements, connecting with tutors, and accessing learning
          materials.
        </p>
        <div className="mt-3">
          <Link
            href="/verify-email"
            className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Verify Email Address
          </Link>
        </div>
      </div>
    </div>
  </div>
);

const StatsGrid = ({ studentData, dashboardData }) => {
  const stats = [
    {
      icon: <DocumentTextIcon className="h-7 w-7 text-blue-600" />,
      title: "Total Posts",
      value: dashboardData?.overview?.totalPostRequirements || 0,
      change: studentData?.isVerified ? "+2 this week" : "Verify to post",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      trend: "up",
    },
    {
      icon: <UserGroupIcon className="h-7 w-7 text-green-600" />,
      title: "Course Requests",
      value: dashboardData?.overview?.totalCourseRequests || 0,
      change: studentData?.isVerified
        ? `${dashboardData?.courseRequests?.approved || 0} approved`
        : "Verify to connect",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      trend: "neutral",
    },
    {
      icon: <CreditCardIcon className="h-7 w-7 text-purple-600" />,
      title: "Wallet Balance",
      value: `${dashboardData?.overview?.walletBalance || 150} Coins`,
      change: "Ready to use",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      trend: "stable",
    },
    {
      icon: <StarIcon className="h-7 w-7 text-amber-600" />,
      title: "Learning Score",
      value: dashboardData?.quickStats?.averageRating
        ? `${dashboardData.quickStats.averageRating}/5`
        : "N/A",
      change: studentData?.isVerified ? "Based on activity" : "Verify to track",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      trend: "up",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

const StatCard = ({
  icon,
  title,
  value,
  change,
  bgColor,
  borderColor,
  trend,
}) => {
  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      case "stable":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div
      className={`bg-white rounded-xl border ${borderColor} p-6 shadow-sm hover:shadow-md transition-all duration-300`}
    >
      <div className="flex items-center justify-between">
        <div className={`rounded-xl p-3 ${bgColor} shadow-sm`}>{icon}</div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className={`text-sm font-medium ${getTrendColor()} mt-1`}>
            {change}
          </p>
        </div>
      </div>
      <p className="text-sm font-medium text-gray-600 mt-4">{title}</p>
    </div>
  );
};

const QuickActions = ({ studentData }) => {
  const actions = [
    {
      title: "Post New Requirement",
      description:
        "Share what subject you need help with and find the perfect tutor",
      buttonText: "Create Post",
      href: "/students/myposts/create",
      icon: <PlusIcon className="h-6 w-6" />,
      buttonColor: "bg-blue-600 hover:bg-blue-700",
      disabled: !studentData?.isVerified,
    },
    {
      title: "Find Tutors",
      description: "Browse through our verified tutors and find your match",
      buttonText: "Explore Tutors",
      href: "/students/find-tutors",
      icon: <MagnifyingGlassIcon className="h-6 w-6" />,
      buttonColor: "bg-green-600 hover:bg-green-700",
      disabled: !studentData?.isVerified,
    },
    {
      title: "View My Posts",
      description: "Manage your tutoring requirements and applications",
      buttonText: "View Posts",
      href: "/students/myposts",
      icon: <EyeIcon className="h-6 w-6" />,
      buttonColor: "bg-purple-600 hover:bg-purple-700",
      disabled: !studentData?.isVerified,
    },
    {
      title: "Start Studying",
      description:
        "Explore available courses and continue your learning journey at your own pace.",
      buttonText: "View Courses",
      href: "/students/study",
      icon: <BookOpenIcon className="h-6 w-6" />,
      buttonColor: "bg-indigo-600 hover:bg-indigo-700",
      disabled: !studentData?.isVerified,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {actions.map((action, index) => (
        <ActionCard key={index} {...action} />
      ))}
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
      className={`bg-white rounded-xl border border-gray-200 p-6 transition-all duration-300 ${
        disabled ? "opacity-60" : "hover:border-blue-300 hover:shadow-md"
      }`}
    >
      <div className="flex items-start space-x-4">
        <div
          className={`flex-shrink-0 rounded-lg p-3 ${
            disabled ? "bg-gray-100" : "bg-blue-50"
          }`}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
            {title}
            {disabled && (
              <span className="ml-2 text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                Verify Required
              </span>
            )}
          </h3>
          <p className="text-gray-600 mb-4 text-sm leading-relaxed">
            {description}
          </p>
          <Link
            href={disabled ? "#" : href}
            className={`inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-white ${buttonColor} transition-all duration-200 ${
              disabled
                ? "cursor-not-allowed"
                : "hover:shadow-lg transform hover:-translate-y-0.5"
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

const CourseRequestsSection = ({ dashboardData }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">
      Course Access Requests
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="flex items-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <ClockIcon className="h-8 w-8 text-yellow-600 mr-3" />
        <div>
          <p className="text-sm text-yellow-800">Pending</p>
          <p className="text-2xl font-bold text-yellow-900">
            {dashboardData.courseRequests.pending}
          </p>
        </div>
      </div>
      <div className="flex items-center p-4 bg-green-50 rounded-lg border border-green-200">
        <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
        <div>
          <p className="text-sm text-green-800">Approved</p>
          <p className="text-2xl font-bold text-green-900">
            {dashboardData.courseRequests.approved}
          </p>
        </div>
      </div>
      <div className="flex items-center p-4 bg-red-50 rounded-lg border border-red-200">
        <XCircleIcon className="h-8 w-8 text-red-600 mr-3" />
        <div>
          <p className="text-sm text-red-800">Rejected</p>
          <p className="text-2xl font-bold text-red-900">
            {dashboardData.courseRequests.rejected}
          </p>
        </div>
      </div>
    </div>
  </div>
);

const RecentPostsSection = ({ recentPosts, postsLoading }) => (
  <div className="bg-white rounded-xl border border-gray-200">
    <div className="px-6 py-5 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Recent Requirements
        </h3>
        <Link
          href="/students/myposts"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
        >
          View all
          <svg
            className="ml-1 h-4 w-4"
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
    <div className="p-6">
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
          <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">
            No requirements posted yet
          </p>
          <p className="text-gray-400 text-sm mb-4">
            Start by creating your first learning requirement
          </p>
          <Link
            href="/students/myposts/create"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Your First Post
          </Link>
        </div>
      )}
    </div>
  </div>
);

const RecentPostCard = ({ post }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h4 className="font-semibold text-gray-900 text-lg">
              {post.subjects?.map((s) => s.name).join(", ") || "Untitled"}
            </h4>
            <span
              className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                post.isVerified
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {post.isVerified ? "Verified" : "Pending"}
            </span>
          </div>
          <p className="text-gray-600 line-clamp-2 mb-3">{post.description}</p>
          <div className="flex items-center text-sm text-gray-500">
            <span>{post.location}</span>
            <span className="mx-2">•</span>
            <span>{post.serviceType}</span>
            <span className="mx-2">•</span>
            <span>{formatDate(post.createdAt)}</span>
          </div>
        </div>
        <Link
          href={`/students/myposts/${post._id}`}
          className="ml-4 inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
        >
          View
        </Link>
      </div>
    </div>
  );
};

const LearningProgressSection = ({ dashboardData, statsData }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-6">
      Learning Overview
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
          <AcademicCapIcon className="h-6 w-6 text-blue-600" />
        </div>
        <h4 className="font-medium text-gray-900 text-sm">Courses Completed</h4>
        <p className="text-2xl font-bold text-blue-600 mt-1">
          {dashboardData?.quickStats?.completedCourses || 0}
        </p>
      </div>
      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
          <ClockIcon className="h-6 w-6 text-green-600" />
        </div>
        <h4 className="font-medium text-gray-900 text-sm">Learning Hours</h4>
        <p className="text-2xl font-bold text-green-600 mt-1">
          {dashboardData?.quickStats?.totalSpent || 0}
        </p>
      </div>
      <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
        <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
          <StarIcon className="h-6 w-6 text-amber-600" />
        </div>
        <h4 className="font-medium text-gray-900 text-sm">Average Rating</h4>
        <p className="text-2xl font-bold text-amber-600 mt-1">
          {dashboardData?.quickStats?.averageRating || "N/A"}
        </p>
      </div>
      <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
        <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
          <ChartBarIcon className="h-6 w-6 text-purple-600" />
        </div>
        <h4 className="font-medium text-gray-900 text-sm">Success Rate</h4>
        <p className="text-2xl font-bold text-purple-600 mt-1">
          {dashboardData?.quickStats?.activePostRequirements || 0}%
        </p>
      </div>
    </div>
  </div>
);

const StatisticsOverview = ({ statsData }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-6">
      Detailed Statistics
    </h3>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Post Requirements by Type */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Requirements by Type</h4>
        <div className="space-y-3">
          {statsData.postRequirements?.byType?.map((type, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{type._id}</span>
              <span className="font-semibold text-gray-900">{type.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Course Requests by Status */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Requests by Status</h4>
        <div className="space-y-3">
          {statsData.courseAccess?.byStatus?.map((status, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm text-gray-600 capitalize">
                {status._id}
              </span>
              <span className="font-semibold text-gray-900">
                {status.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default StudentDashboardPage;
