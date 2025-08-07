"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="w-full bg-[#f5f7f9]  font-poppins">
      <div className=" mx-auto bg-white  shadow-sm px-6 py-4 flex items-center justify-between">
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
              { name: "About Us", href: "/about" },
              { name: "Services", href: "/services" },
              { name: "Contact Us", href: "/contact" },
              { name: "Portfolio", href: "/portfolio" },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="relative text-[15px] font-medium text-gray-900 transition-all duration-500 group"
              >
                <span className="relative z-10 block py-2">{item.name}</span>
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-600 transition-all duration-500 group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center space-x-4">
            <Link
              href="/login"
              className="px-4 py-2 text-blue-600 font-medium rounded-full hover:bg-blue-50 transition-colors duration-300 hidden lg:block"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors duration-300 shadow-sm"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center space-x-4">
          {/* Mobile Auth Buttons (visible on small screens) */}

          {/* Mobile Menu Button */}
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
              { name: "About Us", href: "/about" },
              { name: "Services", href: "/services" },
              { name: "Contact Us", href: "/contact" },
              { name: "Portfolio", href: "/portfolio" },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-800 text-base font-medium border-b pb-2 border-gray-200 hover:text-blue-600 transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
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
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
