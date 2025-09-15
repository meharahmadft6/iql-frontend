"use client";
import { useState, useEffect } from "react";
import StudentDashboardLayout from "../../layout/student/DashboardLayout";
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import {
  getCurrentUser,
  updateProfile,
  requestVerificationEmail,
} from "../../../api/user.api";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [requestingVerification, setRequestingVerification] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
  });
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getCurrentUser();
        const user = response.data.data;
        setUserData(user);
        setFormData({
          name: user.name || "",
          mobile: user.mobile || "",
        });

        // Check if we need to set a cooldown
        if (user.verificationExpire && !user.isVerified) {
          const expireTime = new Date(user.verificationExpire).getTime();
          const currentTime = Date.now();

          if (expireTime > currentTime) {
            // Set cooldown in seconds
            const remainingSeconds = Math.ceil(
              (expireTime - currentTime) / 1000
            );
            setCooldown(remainingSeconds);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setMessage({ type: "error", text: "Failed to load profile data" });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Cooldown timer effect
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await updateProfile(formData);
      if (response.data.success) {
        setUserData((prev) => ({ ...prev, ...formData }));
        setMessage({ type: "success", text: "Profile updated successfully!" });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleRequestVerification = async () => {
    setRequestingVerification(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await requestVerificationEmail();
      if (response.data.success) {
        // Update user data with new expiration
        const updatedUser = await getCurrentUser();
        setUserData(updatedUser.data.data);

        // Set cooldown based on new expiration
        const expireTime = new Date(
          updatedUser.data.data.verificationExpire
        ).getTime();
        const currentTime = Date.now();
        const remainingSeconds = Math.ceil((expireTime - currentTime) / 1000);
        setCooldown(remainingSeconds);

        setMessage({
          type: "success",
          text: "Verification email sent! Please check your inbox.",
        });
      }
    } catch (error) {
      console.error("Error requesting verification:", error);
      setMessage({
        type: "error",
        text:
          error.response?.data?.message || "Failed to send verification email",
      });
    } finally {
      setRequestingVerification(false);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <StudentDashboardLayout title="Profile">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </StudentDashboardLayout>
    );
  }

  return (
    <StudentDashboardLayout title="Profile Management">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Verification Status */}
        {!userData?.isVerified && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Your account is not verified</strong>
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Please verify your email to access all features. Check your
                  inbox or request a new verification email.
                </p>

                {cooldown > 0 ? (
                  <div className="mt-2 flex items-center text-sm text-yellow-700">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    <span>
                      You can request another verification email in{" "}
                      {formatTime(cooldown)}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={handleRequestVerification}
                    disabled={requestingVerification || cooldown > 0}
                    className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                  >
                    {requestingVerification
                      ? "Sending..."
                      : "Resend Verification Email"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {message.text && (
          <div
            className={`mb-6 rounded-md p-4 ${
              message.type === "success"
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                {message.type === "success" ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-400" />
                ) : (
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                )}
              </div>
              <div className="ml-3">
                <p
                  className={`text-sm font-medium ${
                    message.type === "success"
                      ? "text-green-800"
                      : "text-red-800"
                  }`}
                >
                  {message.text}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg leading-6 font-semibold text-gray-900">
              Profile Information
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Update your personal information and contact details.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Name Field */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserCircleIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Your full name"
                  />
                </div>
              </div>

              {/* Email Field (read-only) */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={userData?.email || ""}
                    disabled
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Email cannot be changed
                </p>
              </div>

              {/* Verification Status Field (read-only) */}
              <div>
                <label
                  htmlFor="verification"
                  className="block text-sm font-medium text-gray-700"
                >
                  Verification Status
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ShieldCheckIcon
                      className={`h-5 w-5 ${
                        userData?.isVerified
                          ? "text-green-400"
                          : "text-yellow-400"
                      }`}
                    />
                  </div>
                  <input
                    type="text"
                    id="verification"
                    value={userData?.isVerified ? "Verified" : "Not Verified"}
                    disabled
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      userData?.isVerified
                        ? "border-green-300 bg-green-50 text-green-900"
                        : "border-yellow-300 bg-yellow-50 text-yellow-900"
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={updating}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {updating ? "Updating..." : "Update Profile"}
              </button>
            </div>
          </form>
        </div>

        {/* Account Information */}
        <div className="mt-8 bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg leading-6 font-semibold text-gray-900">
              Account Information
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Details about your account creation and status.
            </p>
          </div>

          <div className="px-6 py-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Account Created
              </p>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(userData?.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">User Role</p>
              <p className="mt-1 text-sm text-gray-900 capitalize">
                {userData?.role}
              </p>
            </div>

            {userData?.verificationExpire && !userData?.isVerified && (
              <div className="sm:col-span-2">
                <p className="text-sm font-medium text-gray-500">
                  Verification Expires
                </p>
                <p className="mt-1 text-sm text-yellow-700">
                  {new Date(userData.verificationExpire).toLocaleDateString()}{" "}
                  at{" "}
                  {new Date(userData.verificationExpire).toLocaleTimeString()}
                </p>
                {cooldown > 0 && (
                  <p className="mt-1 text-sm text-yellow-700 flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    You can request another email in {formatTime(cooldown)}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </StudentDashboardLayout>
  );
};

export default ProfilePage;
