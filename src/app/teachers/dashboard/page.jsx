import DashboardLayout from "../../layout/teacher/DashboardLayout";
import {
  AcademicCapIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  UserGroupIcon,
  CalendarIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

const DashboardPage = () => {
  return (
    <DashboardLayout title="Teacher Dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back! Here's what's happening with your account today.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            icon={<AcademicCapIcon className="h-6 w-6 text-blue-500" />}
            title="Total Jobs Applied"
            value="12"
            change="+2 this week"
          />
          <StatCard
            icon={<UserGroupIcon className="h-6 w-6 text-green-500" />}
            title="Active Students"
            value="5"
            change="+1 this week"
          />
          <StatCard
            icon={<CurrencyDollarIcon className="h-6 w-6 text-yellow-500" />}
            title="Connects Left"
            value="87"
            change="-3 this week"
          />
          <StatCard
            icon={<ChartBarIcon className="h-6 w-6 text-purple-500" />}
            title="Profile Strength"
            value="85%"
            change="Complete your profile"
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Activity
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <ul className="divide-y divide-gray-200">
              <ActivityItem
                icon={<BellIcon className="h-5 w-5 text-blue-500" />}
                title="New job matching your profile"
                description="Mathematics tutor needed for 10th grade student"
                time="2 hours ago"
              />
              <ActivityItem
                icon={<CheckCircleIcon className="h-5 w-5 text-green-500" />}
                title="Application accepted"
                description="Your application for Physics tutor position was accepted"
                time="1 day ago"
              />
              <ActivityItem
                icon={<CalendarIcon className="h-5 w-5 text-purple-500" />}
                title="Upcoming session"
                description="You have a session with John Doe tomorrow at 3:00 PM"
                time="2 days ago"
              />
            </ul>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Quick Actions
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ActionCard
                title="Update Profile"
                description="Keep your profile updated to get better job matches"
                buttonText="Edit Profile"
                href="/teacher/profile"
              />
              <ActionCard
                title="Browse Jobs"
                description="Find new teaching opportunities"
                buttonText="View Jobs"
                href="/teacher/jobs"
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const StatCard = ({ icon, title, value, change }) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-blue-50 rounded-md p-3">{icon}</div>
          <div className="ml-5 w-0 flex-1">
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">
                {value}
              </div>
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

const ActivityItem = ({ icon, title, description, time }) => {
  return (
    <li className="py-4">
      <div className="flex space-x-3">
        <div className="flex-shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <div className="flex-shrink-0 self-center text-sm text-gray-500">
          {time}
        </div>
      </div>
    </li>
  );
};

const ActionCard = ({ title, description, buttonText, href }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <a
        href={href}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        {buttonText}
      </a>
    </div>
  );
};

export default DashboardPage;
