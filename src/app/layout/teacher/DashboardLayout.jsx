"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  HomeIcon,
  UserCircleIcon,
  BriefcaseIcon,
  ChatAlt2Icon,
  CreditCardIcon,
  ClockIcon,
  XCircleIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import {
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { API } from "../../../api/api";

const DashboardLayout = ({ children, title = "Dashboard" }) => {
  const router = useRouter();
  const [teachersData, setTeachersData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchTeachersProfile = async () => {
      try {
        const response = await API.get("/teachers/me");
        console.log("Teachers Profile Data:", response.data);
        setTeachersData(response.data.data);

        // Redirect if not approved
        if (
          !response.data.data.isApproved &&
          router.pathname !== "/teachers/dashboard"
        ) {
          router.push("/teachers/dashboard");
        }
      } catch (error) {
        console.error("Error fetching teachers profile:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchTeachersProfile();
  }, [router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // Remove userData and token from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    localStorage.removeItem("refreshToken");

    // Close dropdown
    setProfileDropdownOpen(false);

    // Redirect to login
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-40 md:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        ></div>
        <div className="relative flex flex-col w-72 max-w-xs bg-white h-full">
          <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200">
            <div className="text-lg font-medium text-gray-900">
              Teachers Dashboard
            </div>
            <button
              type="button"
              className="text-gray-500 hover:text-gray-600"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
            <NavItem
              href="/teachers/dashboard"
              icon={<HomeIcon className="h-5 w-5" />}
              text="Dashboard"
              active={router.pathname === "/teachers/dashboard"}
              mobile
            />
            <NavItem
              href="/teachers/profile"
              icon={<UserCircleIcon className="h-5 w-5" />}
              text="Profile"
              active={router.pathname === "/teachers/profile"}
              mobile
            />
            {teachersData?.isApproved && (
              <>
                <NavItem
                  href="/teachers/jobs"
                  icon={<BriefcaseIcon className="h-5 w-5" />}
                  text="Browse Jobs"
                  active={router.pathname === "/teachers/jobs"}
                  mobile
                />
                <NavItem
                  href="/teachers/applications"
                  icon={<ClipboardDocumentListIcon className="h-5 w-5" />}
                  text="My Applications"
                  active={router.pathname === "/teachers/applications"}
                  mobile
                />
                <NavItem
                  href="/teachers/chat"
                  icon={<ChatBubbleLeftRightIcon className="h-5 w-5" />}
                  text="Messages"
                  active={router.pathname === "/teachers/chat"}
                  mobile
                />
                <NavItem
                  href="/teachers/wallet"
                  icon={<CreditCardIcon className="h-5 w-5" />}
                  text="Wallet"
                  active={router.pathname === "/teachers/wallet"}
                  mobile
                />
              </>
            )}
          </nav>
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
          <div className="flex items-center h-32 px-4 border-gray-200 justify-center mt-2">
            <div className="relative w-32 h-32 mb-2">
              <img
                src="/infinity.jpg"
                alt="Infinity Quotient Logo"
                className="w-full h-full rounded-xl object-contain"
              />
            </div>
          </div>
          <div className="flex flex-col flex-1 overflow-y-auto justify-center">
            <nav className="flex-1 px-3 py-6 space-y-2">
              <NavItem
                href="/teachers/dashboard"
                icon={<HomeIcon className="h-6 w-6" />}
                text="Dashboard"
                active={router.pathname === "/teachers/dashboard"}
              />
              <NavItem
                href="/teachers/profile"
                icon={<UserCircleIcon className="h-6 w-6" />}
                text="Profile"
                active={router.pathname === "/teachers/profile"}
              />
              {teachersData?.isApproved && (
                <>
                  <NavItem
                    href="/teachers/jobs"
                    icon={<BriefcaseIcon className="h-6 w-6" />}
                    text="Browse Jobs"
                    active={router.pathname === "/teachers/jobs"}
                  />
                  <NavItem
                    href="/teachers/applications"
                    icon={<ClipboardDocumentListIcon className="h-6 w-6" />}
                    text="My Applications"
                    active={router.pathname === "/teachers/applications"}
                  />
                  <NavItem
                    href="/teachers/chat"
                    icon={<ChatBubbleLeftRightIcon className="h-6 w-6" />}
                    text="Messages"
                    active={router.pathname === "/teachers/chat"}
                  />
                  <NavItem
                    href="/teachers/wallet"
                    icon={<CreditCardIcon className="h-6 w-6" />}
                    text="Wallet"
                    active={router.pathname === "/teachers/wallet"}
                  />
                </>
              )}
            </nav>
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-base font-medium text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-700 transition-all duration-200 group"
              >
                <ArrowRightOnRectangleIcon className="h-6 w-6 mr-3 group-hover:text-red-600 transition-colors" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Enhanced Top header */}
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 border-b border-gray-200 bg-white shadow-sm">
          {/* Left side - Mobile menu button and title */}
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="md:hidden text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 p-2 rounded-md"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div className="flex items-center">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">
                {title}
              </h1>
            </div>
          </div>

          {/* Right side - Wallet and Profile */}
          <div className="flex items-center space-x-3 sm:space-x-6">
            {/* Wallet Display */}
            <div className="hidden sm:flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-full">
              <CreditCardIcon className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                {teachersData?.wallet?.coins || 150} Connects
              </span>
            </div>

            {/* Mobile Wallet (Compact) */}
            <div className="sm:hidden flex items-center space-x-1 bg-blue-50 px-2 py-1 rounded-full">
              <CreditCardIcon className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">
                {teachersData?.wallet?.coins || 150}
              </span>
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 sm:space-x-3 p-1 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <img
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-gray-200"
                  src={teachersData?.profilePhotoUrl || "/default-avatar.png"}
                  alt="Profile"
                />
                <div className="hidden sm:flex items-center space-x-1">
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-700 truncate max-w-32">
                      {teachersData?.user?.name || "Teachers"}
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-32">
                      {teachersData?.user?.email || "teachers@example.com"}
                    </p>
                  </div>
                  <ChevronDownIcon
                    className={`h-4 w-4 text-gray-400 transition-transform ${
                      profileDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {/* Mobile chevron */}
                <ChevronDownIcon
                  className={`sm:hidden h-4 w-4 text-gray-400 transition-transform ${
                    profileDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    {/* Profile Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <img
                          className="w-10 h-10 rounded-full object-cover"
                          src={
                            teachersData?.profilePhotoUrl ||
                            "/default-avatar.png"
                          }
                          alt="Profile"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {teachersData?.user?.name || "Teachers"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {teachersData?.user?.email ||
                              "teachers@example.com"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Wallet Info (Mobile Only) */}
                    <div className="sm:hidden px-4 py-2 border-b border-gray-100">
                      <div className="flex items-center space-x-2">
                        <CreditCardIcon className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-gray-700">
                          {teachersData?.wallet?.coins || 150} Connects
                        </span>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <Link
                      href="/teachers/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <UserCircleIcon className="h-4 w-4 mr-3" />
                      View Profile
                    </Link>

                    <Link
                      href="/teachers/wallet"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <CreditCardIcon className="h-4 w-4 mr-3" />
                      Wallet
                    </Link>

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {!teachersData?.isApproved ? (
            <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Your profile is under review. You'll have full access to the
                    dashboard once approved by our team. This usually takes 1-2
                    business days.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    Your profile has been approved! You now have full access to
                    all features.
                  </p>
                </div>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

const NavItem = ({ href, icon, text, active, mobile = false }) => {
  return (
    <Link
      href={href}
      className={`group flex items-center px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 relative overflow-hidden ${
        active
          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
          : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 hover:shadow-md"
      } ${mobile ? "mx-2" : ""}`}
    >
      {/* Active indicator bar */}
      {active && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>
      )}

      {/* Icon with enhanced effects */}
      <span
        className={`flex-shrink-0 mr-4 transition-all duration-200 ${
          active ? "text-white" : "text-gray-500 group-hover:text-blue-600"
        }`}
      >
        {icon}
      </span>

      {/* Text with letter spacing */}
      <span
        className={`transition-all duration-200 tracking-wide ${
          active ? "text-white font-semibold" : "group-hover:font-semibold"
        }`}
      >
        {text}
      </span>

      {/* Hover effect background */}
      <div
        className={`absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
          active ? "opacity-0" : ""
        }`}
      ></div>
    </Link>
  );
};

export default DashboardLayout;
