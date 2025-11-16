"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import {
  Menu,
  X,
  Home,
  Users,
  BookOpen,
  GraduationCap,
  LogOut,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentUser } from "../../api/user.api"; // Adjust path as needed

// Sidebar Context
const SidebarContext = createContext(null);

export function useSidebarContext() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebarContext must be used within a SidebarProvider");
  }
  return context;
}

// Custom hook for mobile detection
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return isMobile;
}

// Notification Component
function Notification() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDotVisible, setIsDotVisible] = useState(true);

  return <div className="relative"></div>;
}

// User Info Component
function UserInfo({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded align-middle outline-none ring-blue-600 ring-offset-2 focus-visible:ring-1"
      >
        <span className="sr-only">My Account</span>
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-medium">
              {user?.name?.charAt(0) || "A"}
            </span>
          </div>
          <div className="flex items-center gap-1 font-medium text-gray-800 max-lg:hidden">
            <span>{user?.name || "Admin"}</span>
            <ChevronUp
              className={`rotate-180 transition-transform ${
                isOpen && "rotate-0"
              }`}
              strokeWidth={1.5}
              size={16}
            />
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 border border-gray-200 bg-white shadow-lg rounded-lg z-50">
          <div className="flex items-center gap-3 px-5 py-4">
            <div className="size-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-medium">
                {user?.name?.charAt(0) || "A"}
              </span>
            </div>
            <div className="space-y-1 text-base font-medium">
              <div className="mb-2 leading-none text-gray-800">
                {user?.name || "Admin User"}
              </div>
              <div className="leading-none text-gray-600">
                {user?.email || "admin@iql.com"}
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          <hr className="border-gray-200" />

          <div className="p-2 text-base text-gray-700">
            <button
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100 hover:text-gray-800"
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
            >
              <LogOut size={16} />
              <span className="text-base font-medium">Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Header Component
function Header({ user, onLogout }) {
  const { toggleSidebar } = useSidebarContext();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-5 shadow-sm md:px-5 2xl:px-10">
      <button
        onClick={toggleSidebar}
        className="rounded-lg border px-2 py-1 lg:hidden"
      >
        <Menu size={20} />
        <span className="sr-only">Toggle Sidebar</span>
      </button>

      <div className="max-xl:hidden">
        <h1 className="mb-1 text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="font-medium text-gray-600">Admin Dashboard Solution</p>
      </div>

      <div className="flex items-center justify-end gap-4">
        <Notification />
        <div className="shrink-0">
          <UserInfo user={user} onLogout={onLogout} />
        </div>
      </div>
    </header>
  );
}

// Sidebar Component
function Sidebar({ user }) {
  const { isOpen, setIsOpen, isMobile, toggleSidebar } = useSidebarContext();
  const pathname = usePathname();

  const sidebarItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: Users, label: "Teachers", href: "/dashboard/teachers" },
    { icon: GraduationCap, label: "Students", href: "/dashboard/students" },
    { icon: BookOpen, label: "Courses", href: "/dashboard/courses" },
    {
      icon: BookOpen,
      label: "Enrollment Requests",
      href: "/dashboard/course-requests",
    },
    { icon: BookOpen, label: "Subjects", href: "/dashboard/subjects" },
  ];

  const isActiveLink = (href) => {
    return pathname === href;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`max-w-72 overflow-hidden border-r border-gray-200 bg-white transition-[width] duration-200 ease-linear ${
          isMobile ? "fixed bottom-0 top-0 z-50" : "sticky top-0 h-screen"
        } ${isOpen ? "w-full" : "w-0"}`}
        aria-label="Main navigation"
        aria-hidden={!isOpen}
      >
        <div className="flex h-full flex-col py-10 pl-6 pr-2">
          <div className="relative pr-5">
            <Link
              href="/dashboard"
              onClick={() => isMobile && toggleSidebar()}
              className="px-0 py-3 min-[850px]:py-0"
            >
              <div className="flex flex-col items-center justify-center mb-4">
                <div className="relative w-32 h-32 mb-2">
                  <Image
                    src="/infinity.jpg"
                    alt="Infinity Quotient Logo"
                    fill
                    className="rounded-xl object-contain"
                    priority
                  />
                </div>
              </div>
            </Link>

            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="absolute right-5 top-4 text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close Menu</span>
                <X size={24} />
              </button>
            )}
          </div>

          {/* Navigation */}
          <div className="mt-6 flex-1 overflow-y-auto pr-3 min-[850px]:mt-10">
            <div className="mb-6">
              <nav role="navigation" aria-label="Main Menu">
                <ul className="space-y-2">
                  {sidebarItems.map((item, index) => {
                    const isActive = isActiveLink(item.href);
                    return (
                      <li key={index}>
                        <Link
                          href={item.href}
                          onClick={() => isMobile && toggleSidebar()}
                          className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors group ${
                            isActive
                              ? "text-blue-600 bg-blue-50"
                              : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center">
                            <item.icon
                              size={20}
                              className={`mr-3 ${
                                isActive
                                  ? "text-blue-600"
                                  : "text-gray-400 group-hover:text-gray-600"
                              }`}
                            />
                            {item.label}
                          </div>
                          {item.count && (
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                isActive
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-200 text-gray-600"
                              }`}
                            >
                              {item.count}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

// Loading Component
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Verifying authentication...</p>
      </div>
    </div>
  );
}

// Unauthorized Component
function UnauthorizedScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md p-8">
        <div className="text-red-600 text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. This area is restricted
          to administrators only.
        </p>
        <Link
          href="/"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Return to Login
        </Link>
      </div>
    </div>
  );
}

// Main Layout Component with Authentication
export default function DashboardLayout({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const isMobile = useIsMobile();
  const router = useRouter();

  // Verify authentication on mount and route changes
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        setIsLoading(true);

        // Check if token exists
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("No token found, redirecting to login");
          router.push("/");
          return;
        }

        // Fetch current user from server
        const response = await getCurrentUser();
        // API returns { success, data: { user info }, walletBalance }
        const userData = response.data.data;

        console.log("Verified user:", userData);

        // CRITICAL: Check if user role is admin from SERVER response
        if (userData.role !== "admin") {
          console.log("User is not admin, access denied");
          setIsAuthorized(false);
          setIsLoading(false);

          // Clear invalid data
          localStorage.removeItem("token");
          localStorage.removeItem("userData");
          return;
        }

        // User is verified admin
        setUser(userData);
        setIsAuthorized(true);

        // Update localStorage with verified data (optional)
        localStorage.setItem("userData", JSON.stringify(userData));
      } catch (error) {
        console.error("Authentication error:", error);
        setIsAuthorized(false);

        // Clear tokens on auth failure
        localStorage.removeItem("token");
        localStorage.removeItem("userData");

        // Redirect to login
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [router]);

  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, [isMobile]);

  function toggleSidebar() {
    setIsOpen((prev) => !prev);
  }

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem("token");
    localStorage.removeItem("userData");

    // Redirect to login
    router.push("/");
  };

  // Show loading screen while verifying
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Show unauthorized screen if not admin
  if (!isAuthorized) {
    return <UnauthorizedScreen />;
  }

  // User is verified admin, show dashboard
  return (
    <SidebarContext.Provider
      value={{
        state: isOpen ? "expanded" : "collapsed",
        isOpen,
        setIsOpen,
        isMobile,
        toggleSidebar,
      }}
    >
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar user={user} />
        <div className="flex-1 flex flex-col min-w-0">
          <Header user={user} onLogout={handleLogout} />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
