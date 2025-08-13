"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Get user data from localStorage
    const data = localStorage.getItem("userData");
    if (data) {
      setUserData(JSON.parse(data));
    }
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleDropdown = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  const handleLogout = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    router.push("/login");
  };

  // Function to get initials from name
  const getInitials = (name) => {
    if (!name) return "";
    const names = name.split(" ");
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  };

  return (
    <nav className="w-full bg-[#f5f7f9] font-poppins">
      <div className="mx-auto bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 z-50 md:ms-10">
          <Image
            src="/infinity.jpg"
            alt="Brainforce Logo"
            width={80}
            height={80}
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-1 justify-center relative">
          {/* Centered Links */}
          <div className="flex items-center space-x-10">
            {[
              { name: "Home", href: "/" },
              { name: "Our Story", href: "/ourstory" },
              {
                name: "Find Tutor Jobs",
                dropdown: [
                  { name: "All Tutor Jobs", href: "/jobs/all" },
                  { name: "Online Tutor Jobs", href: "/jobs/online" },
                  { name: "Home Tutor Jobs", href: "/jobs/home" },
                ],
              },
              { name: "Research", href: "/research" },
              { name: "Contact Us", href: "/contactus" },
            ].map((item) => (
              <div key={item.name} className="relative group">
                {item.href ? (
                  <Link
                    href={item.href}
                    className="relative text-[15px] font-medium text-gray-900 transition-all duration-500 group"
                  >
                    <span className="relative z-10 block py-2">
                      {item.name}
                    </span>
                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-600 transition-all duration-500 group-hover:w-full"></span>
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() => toggleDropdown(item.name)}
                      className="relative text-[15px] font-medium text-gray-900 transition-all duration-500 group flex items-center"
                    >
                      <span className="relative z-10 block py-2">
                        {item.name}
                      </span>
                      <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-600 transition-all duration-500 group-hover:w-full"></span>
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
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {openDropdown === item.name && (
                      <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                        {item.dropdown?.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Profile */}
        {userData && (
          <div className="hidden md:flex items-center space-x-4 md:me-10">
            <div className="relative">
              <button
                onClick={() => toggleDropdown("profile")}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div className="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center text-white font-medium">
                  {getInitials(userData.name)}
                </div>
              </button>

              {openDropdown === "profile" && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-3 border-b">
                    <p className="text-sm font-medium text-gray-900">
                      {userData.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {userData.email}
                    </p>
                  </div>
                  <Link
                    href="/dashboard/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center space-x-4">
          <button
            onClick={toggleMobileMenu}
            className="text-gray-700 p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  isMobileMenuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={`fixed top-0 right-0 h-full w-72 bg-white shadow-lg z-50 transform transition-transform duration-150 ease-in-out ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-end px-4 py-4 border-b">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-600 hover:text-gray-900 transition"
              aria-label="Close menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {userData && (
            <div className="px-4 py-4 border-b ">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                  {getInitials(userData.name)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {userData.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {userData.email}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-base bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col px-4 py-6 space-y-4">
            {[
              { name: "Home", href: "/" },
              { name: "Our Story", href: "/ourstory" },
              { name: "Services", href: "/services" },
              {
                name: "Find Tutor Jobs",
                dropdown: [
                  { name: "All Tutor Jobs", href: "/jobs/all" },
                  { name: "Online Tutor Jobs", href: "/jobs/online" },
                  { name: "Home Tutor Jobs", href: "/jobs/home" },
                ],
              },
              { name: "Research", href: "/research" },
              { name: "Contact Us", href: "/contactus" },
            ].map((item) => (
              <div key={item.name}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className="text-gray-800 text-base font-medium border-b pb-2 border-gray-200 hover:text-blue-600 transition block"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ) : (
                  <div className="border-b border-gray-200 pb-2">
                    <button
                      onClick={() => toggleDropdown(item.name)}
                      className="text-gray-800 text-base font-medium hover:text-blue-600 transition flex items-center justify-between w-full"
                    >
                      {item.name}
                      <svg
                        className={`h-4 w-4 transform transition-transform ${
                          openDropdown === item.name ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {openDropdown === item.name && (
                      <div className="pl-4 mt-2 space-y-2">
                        {item.dropdown?.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className="block text-sm text-gray-700 hover:text-blue-600"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
