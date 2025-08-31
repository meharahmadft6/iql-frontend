"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleDropdown = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  return (
    <nav className="w-full bg-[#f5f7f9] font-poppins ">
      <div className="mx-auto bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 z-50 md:ms-10">
          <Image
            src="/infinity.jpg"
            alt="Infinity Logo"
            width={80}
            height={80}
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-1 justify-center-safe relative ">
          {/* Centered Links */}
          <div className="flex items-center space-x-10">
            {[
              { name: "Home", href: "/" },
              {
                name: "Find Tutors",
                dropdown: [
                  { name: "Request a tutor", href: "/request-a-teacher" },
                  { name: "All Tutors", href: "/tutors" },
                  { name: "Online Tutors", href: "/tutors/online-tutors" },
                  { name: "Home Tutors", href: "/tutors/home-tutors" },
                ],
              },
              {
                name: "Find Tutor Jobs",
                dropdown: [
                  { name: "All Tutor Jobs", href: "/jobs/all" },
                  { name: "Online Tutor Jobs", href: "/jobs/online" },
                  { name: "Home Tutor Jobs", href: "/jobs/home" },
                ],
              },
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

          {/* Auth Buttons */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center space-x-4">
            <Link
              href="/login"
              className="px-4 py-2 text-white bg-blue-500 font-medium rounded hover:bg-blue-600 transition-colors duration-300 hidden lg:block"
            >
              Login
            </Link>

            <Link
              href="/request-a-teacher"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full px-4 py-2 rounded text-center bg-green-600 text-white font-medium  hover:bg-green-700 transition-colors"
            >
              Request a tutor
            </Link>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center space-x-4">
          <button
            onClick={toggleMobileMenu}
            className="text-gray-700 p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
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

          <div className="flex flex-col px-4 py-6 space-y-4">
            {[
              { name: "Home", href: "/" },
              { name: "Our Story", href: "/ourstory" },
              { name: "Services", href: "/services" },
              {
                name: "Find Tutors",
                dropdown: [
                  { name: "All Tutors", href: "/tutors/all" },
                  { name: "Online Tutors", href: "/tutors/online" },
                  { name: "Home Tutors", href: "/tutors/home" },
                ],
              },
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

            <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full px-4 py-2 text-center text-blue-600 font-medium rounded-full border border-blue-600 hover:bg-blue-50 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full px-4 py-2 text-center bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors"
              >
                Sign Up
              </Link>
              <Link
                href="/request-a-teacher"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full px-4 py-2 text-center bg-green-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors"
              >
                Request a tutor
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
