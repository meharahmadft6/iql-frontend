"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { FaLock, FaCheck } from "react-icons/fa";
import Swal from "sweetalert2";
import Image from "next/image";
import { resetPassword } from "../../../api/user.api";
import Link from "next/link";
export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = useParams();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate password match
    if (name === "confirmPassword" || name === "password") {
      if (formData.password && value !== formData.password) {
        setPasswordError("Passwords do not match");
      } else {
        setPasswordError("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      Swal.fire({
        title: "Processing...",
        html: "Please wait while we update your password",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await resetPassword(token, formData.password);

      Swal.fire({
        icon: "success",
        title: "Password Updated!",
        text: "Your password has been successfully updated. You can now login with your new password.",
        confirmButtonColor: "#155dfc",
      }).then(() => {
        router.push("/login");
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Something went wrong. Please try again.",
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
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div>
                <Link href={"/"}>
                  <h3 className="text-2xl font-bold">
                    Infinity Quotient Learning
                  </h3>
                </Link>
                <p className="text-sm opacity-80">Secure Password Reset</p>
              </div>
            </div>
          </div>

          {/* Hero Content */}
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="max-w-md">
              <h1 className="text-6xl font-bold mb-4">New Password</h1>
              <p className="text-lg opacity-90 leading-relaxed mb-6">
                Create a strong, secure password to protect your account.
              </p>
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
            <h2 className="text-4xl font-bold text-black">Reset Password</h2>
            <p className="text-gray-500 mt-3 text-sm md:text-base">
              Enter your new password below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                className="block text-gray-700 text-sm font-medium mb-2"
                htmlFor="password"
              >
                New Password
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
                  minLength={8}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters
              </p>
            </div>

            <div>
              <label
                className="block text-gray-700 text-sm font-medium mb-2"
                htmlFor="confirmPassword"
              >
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <FaCheck />
                </span>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
              {passwordError && (
                <p className="text-xs text-red-500 mt-1">{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || passwordError}
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
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            Remember your password?{" "}
            <Link
              href="/login"
              className="text-blue-600 hover:underline font-medium transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
