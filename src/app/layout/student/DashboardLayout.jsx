"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  HomeIcon,
  UserCircleIcon,
  ClipboardDocumentListIcon,
  AcademicCapIcon,
  CreditCardIcon,
  StarIcon,
  ClockIcon,
  XCircleIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { BookOpen } from "lucide-react";
import * as userApi from "../../../api/user.api";

const DashboardLayout = ({ children, title = "Dashboard" }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [walletBalance, setWalletBalance] = useState(0);
  const [userData, setUserData] = useState(null);
  const [studentsStats, setStudentsStats] = useState({
    totalPosts: 0,
    walletCoins: 0,
    tutorsApplied: 0,
    activeTutors: 0,
  });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await userApi.getCurrentUser();
        setUserData(response.data.data);
        setWalletBalance(response.data.walletBalance);
        setStudentsStats({
          totalPosts: 5,
          walletCoins: 150,
          tutorsApplied: 12,
          activeTutors: 3,
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  useEffect(() => {
    // Check if alert was already shown
    const alertShown = localStorage.getItem("verificationAlertShown");

    if (!alertShown) {
      // Show alert only once after login
      setShowVerificationAlert(true);

      // Save flag so it won't show again
      localStorage.setItem("verificationAlertShown", "true");
    }
  }, []);

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
    localStorage.removeItem("verificationAlertShown");

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
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Background Blur Layer */}
        <div
          className="absolute inset-0 backdrop-blur-md bg-white/30"
          onClick={() => setSidebarOpen(false)}
        ></div>

        {/* Sidebar Panel */}
        <div className="relative flex flex-col w-72 max-w-xs bg-white/80 backdrop-blur-xl h-full shadow-2xl border-r border-white/40">
          <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200/50">
            <div className="text-lg font-medium text-gray-900">Dashboard</div>
            <button
              type="button"
              className="text-gray-500 hover:text-gray-600"
              onClick={() => setSidebarOpen(false)}
            >
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
            <NavItem
              href="/students/dashboard"
              icon={<HomeIcon className="h-5 w-5" />}
              text="Dashboard"
              active={pathname === "/students/dashboard"} // Changed to use pathname
              mobile
            />
            <NavItem
              href="/students/profile"
              icon={<UserCircleIcon className="h-5 w-5" />}
              text="Profile"
              active={pathname === "/students/profile"} // Changed to use pathname
              mobile
            />
            <NavItem
              href="/students/study"
              icon={<BookOpen className="h-5 w-5" />}
              text="Start Studying"
              active={pathname === "/students/study"}
              mobile
            />
            {userData?.isVerified && (
              <>
                <NavItem
                  href="/students/myposts"
                  icon={<ClipboardDocumentListIcon className="h-5 w-5" />}
                  text="My Posts"
                  active={pathname === "/students/myposts"} // Changed to use pathname
                  mobile
                />
                <NavItem
                  href="/students/find-tutors"
                  icon={<AcademicCapIcon className="h-5 w-5" />}
                  text="Find Tutors"
                  active={pathname === "/students/find-tutors"} // Changed to use pathname
                  mobile
                />
                <NavItem
                  href="/students/wallet"
                  icon={<CreditCardIcon className="h-5 w-5" />}
                  text="Wallet"
                  active={pathname === "/students/wallet"} // Changed to use pathname
                  mobile
                />
                <NavItem
                  href="/students/reviews"
                  icon={<StarIcon className="h-5 w-5" />}
                  text="Reviews"
                  active={pathname === "/students/reviews"} // Changed to use pathname
                  mobile
                />
              </>
            )}
          </nav>
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
                href="/students/dashboard"
                icon={<HomeIcon className="h-6 w-6" />}
                text="Dashboard"
                active={pathname === "/students/dashboard"} // Changed to use pathname
              />
              <NavItem
                href="/students/profile"
                icon={<UserCircleIcon className="h-6 w-6" />}
                text="Profile"
                active={pathname === "/students/profile"} // Changed to use pathname
              />
              <NavItem
                href="/students/study"
                icon={<BookOpen className="h-5 w-5" />}
                text="Start Studing"
                active={pathname === "/students/study"} // Changed to use pathname
                mobile
              />
              {userData?.isVerified && (
                <>
                  <NavItem
                    href="/students/myposts"
                    icon={<ClipboardDocumentListIcon className="h-6 w-6" />}
                    text="My Posts"
                    active={pathname === "/students/myposts"} // Changed to use pathname
                  />
                  <NavItem
                    href="/students/find-tutors"
                    icon={<AcademicCapIcon className="h-6 w-6" />}
                    text="Find Tutors"
                    active={pathname === "/students/find-tutors"} // Changed to use pathname
                  />
                  <NavItem
                    href="/students/wallet"
                    icon={<CreditCardIcon className="h-6 w-6" />}
                    text="Wallet"
                    active={pathname === "/students/wallet"} // Changed to use pathname
                  />
                  <NavItem
                    href="/students/reviews"
                    icon={<StarIcon className="h-6 w-6" />}
                    text="Reviews"
                    active={pathname === "/students/reviews"} // Changed to use pathname
                  />
                </>
              )}{" "}
            </nav>
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
                {walletBalance} Connects
              </span>
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 sm:space-x-3 p-1 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                {userData?.profilePhotoUrl ? (
                  <img
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-gray-200"
                    src={userData.profilePhotoUrl}
                    alt="Profile"
                  />
                ) : (
                  <UserCircleIcon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                )}
                <div className="hidden sm:flex items-center space-x-1">
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-700 truncate max-w-32">
                      {userData?.name || "Students"}
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-32">
                      {userData?.email || "students@example.com"}
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
                        {userData?.profilePhotoUrl ? (
                          <img
                            className="w-10 h-10 rounded-full object-cover"
                            src={userData.profilePhotoUrl}
                            alt="Profile"
                          />
                        ) : (
                          <UserCircleIcon className="w-10 h-10 text-gray-400" />
                        )}{" "}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {userData?.name || "Students"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {userData?.email || "students@example.com"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Wallet Info (Mobile Only) */}
                    <div className="sm:hidden px-4 py-2 border-b border-gray-100">
                      <div className="flex items-center space-x-2">
                        <CreditCardIcon className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-gray-700">
                          {walletBalance} Connects
                        </span>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <Link
                      href="/students/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <UserCircleIcon className="h-4 w-4 mr-3" />
                      View Profile
                    </Link>

                    <Link
                      href="/students/wallet"
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
          {showVerificationAlert && (
            <>
              {!userData?.isVerified ? (
                <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <ClockIcon className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Your account is not verified. Please verify your email
                        to access all features.
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
                        Your account has been verified! You now have full access
                        to all features.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
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
