"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import {
  Menu,
  X,
  Home,
  Users,
  BookOpen,
  GraduationCap,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";

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
  const isMobile = useIsMobile();

  const notificationList = [
    {
      image: "/images/user/user-15.png",
      title: "Piter Joined the Team!",
      subTitle: "Congratulate him",
    },
    {
      image: "/images/user/user-03.png",
      title: "New message",
      subTitle: "Devid sent a new message",
    },
    {
      image: "/images/user/user-26.png",
      title: "New Payment received",
      subTitle: "Check your earnings",
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (setIsDotVisible) setIsDotVisible(false);
        }}
        className="grid size-12 place-items-center rounded-full border bg-gray-100 text-gray-800 outline-none hover:text-primary focus-visible:border-primary focus-visible:text-primary"
        aria-label="View Notifications"
      >
        <span className="relative">
          <Bell size={20} />
          {isDotVisible && (
            <span className="absolute -top-1 -right-1 z-10 size-2 rounded-full bg-red-500 ring-2 ring-gray-100">
              <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-red-500 opacity-75" />
            </span>
          )}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 border border-gray-200 bg-white px-4 py-3 shadow-lg rounded-lg z-50">
          <div className="mb-1 flex items-center justify-between px-2 py-2">
            <span className="text-lg font-medium text-gray-800">
              Notifications
            </span>
            <span className="rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white">
              3 new
            </span>
          </div>

          <ul className="mb-3 max-h-80 space-y-2 overflow-y-auto">
            {notificationList.map((item, index) => (
              <li key={index}>
                <Link
                  href="#"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-4 rounded-lg px-2 py-2 outline-none hover:bg-gray-100 focus-visible:bg-gray-100"
                >
                  <div className="size-12 rounded-full bg-gray-200" />
                  <div>
                    <strong className="block text-sm font-medium text-gray-800">
                      {item.title}
                    </strong>
                    <span className="truncate text-sm font-medium text-gray-600">
                      {item.subTitle}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="#"
            onClick={() => setIsOpen(false)}
            className="block rounded-lg border border-blue-600 p-2 text-center text-sm font-medium text-blue-600 outline-none transition-colors hover:bg-blue-50 focus:bg-blue-50"
          >
            See all notifications
          </Link>
        </div>
      )}
    </div>
  );
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

          <div className="p-2 text-base text-gray-700">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100 hover:text-gray-800"
            >
              <Users size={16} />
              <span className="text-base font-medium">View profile</span>
            </Link>

            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100 hover:text-gray-800"
            >
              <Settings size={16} />
              <span className="text-base font-medium">Account Settings</span>
            </Link>
          </div>

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
  const { toggleSidebar, isMobile } = useSidebarContext();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-5 shadow-sm md:px-5 2xl:px-10">
      <button
        onClick={toggleSidebar}
        className="rounded-lg border px-2 py-1 lg:hidden"
      >
        <Menu size={20} />
        <span className="sr-only">Toggle Sidebar</span>
      </button>

      {isMobile && (
        <Link href="/" className="ml-2 max-[430px]:hidden min-[375px]:ml-4">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white font-bold">IQ</span>
          </div>
        </Link>
      )}

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
    { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
    { icon: Bell, label: "Notifications", href: "/dashboard/notifications" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ];

  // Function to check if a link is active (exact match only)
  const isActiveLink = (href) => {
    return pathname === href;
  };
  const toggleExpanded = (title) => {
    setExpandedItems((prev) => (prev.includes(title) ? [] : [title]));
  };

  // Function to check if a link is active

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
              <h2 className="mb-5 text-sm font-medium text-gray-500">
                MAIN MENU
              </h2>

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

// Main Layout Component
// Main Layout Component
export default function DashboardLayout({ children, user }) {
  const [isOpen, setIsOpen] = useState(true);
  const isMobile = useIsMobile();
  const router = useRouter();

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

  // Handle logout directly in this component
  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem("token");
    // Redirect to login page
    router.push("/");
  };

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
