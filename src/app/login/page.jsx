"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaEnvelope,
  FaLock,
  FaChalkboardTeacher,
  FaBookOpen,
} from "react-icons/fa";
import Swal from "sweetalert2";
import Image from "next/image";
import { baseURL } from "../../api/api";
export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      Swal.fire({
        title: "Authenticating...",
        html: "Please wait while we verify your credentials",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await fetch(`${baseURL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      console.log("Api response", response);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // ✅ Save token to localStorage
      localStorage.setItem("token", data.token);

      Swal.fire({
        icon: "success",
        title: "Login Successful!",
        text: `Welcome back to Infinity Quotient Learning`,
        showConfirmButton: false,
        timer: 1500,
      });

      // Redirect after success
      setTimeout(() => {
        router.push(
          data.role === "teacher" ? "/teacher-dashboard" : "/dashboard"
        );
      }, 1500);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: "Invalid credentials. Please try again.",
        confirmButtonColor: "#155dfc",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Full Page Background with Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 p-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/assets/pattern.svg')] bg-repeat"></div>
        </div>

        {/* Semi-transparent overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full w-full text-white">
          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm mr-3">
                <FaBookOpen className="w-6 h-6" />
              </div>
              <div>
                <Link href={"/"}>
                  <h3 className="text-2xl font-bold">
                    Infinity Quotient Learning
                  </h3>
                </Link>
                <p className="text-sm opacity-80">
                  Elevate Your Learning Experience
                </p>
              </div>
            </div>
          </div>

          {/* Hero Content */}
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="max-w-md">
              <h1 className="text-6xl font-bold mb-4">Welcome Back!</h1>
              <p className="text-lg opacity-90 leading-relaxed mb-6">
                Join thousands of students and teachers who are transforming
                education through our platform.
              </p>

              <div className="flex justify-center space-x-6">
                <div className="flex items-center">
                  <FaChalkboardTeacher className="text-blue-300 mr-2" />
                  <span>Interactive Lessons</span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-blue-300 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span>Secure Platform</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-sm opacity-70">
            © {new Date().getFullYear()} Infinity Quotient Learning. All rights
            reserved.
          </div>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-start justify-start mb-4">
              <Link
                href="/"
                className="flex items-center space-x-2 z-50 md:ms-10"
              >
                <Image
                  src="/infinity.jpg"
                  alt="Brainforce Logo"
                  width={80}
                  height={80}
                />
              </Link>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-black">Sign In</h2>
            <p className="text-gray-500 mt-3 text-sm md:text-base">
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                className="block text-gray-700 text-sm font-medium mb-2"
                htmlFor="email"
              >
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <FaEnvelope />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label
                className="block text-gray-700 text-sm font-medium mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <FaLock />
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <label className="flex items-center text-sm text-gray-600">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-indigo-500 mr-2"
                  />
                  Remember me
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:underline hover:text-indigo-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-blue-600 hover:underline font-medium transition-colors"
            >
              Create one now
            </Link>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6 text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
