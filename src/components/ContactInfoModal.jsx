"use client";
import { useState, useEffect } from "react";
import { getContactInformation } from "../api/teacherApplications.api";
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

const ContactInfoModal = ({ isOpen, onClose, application }) => {
  const [contactInfo, setContactInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const fetchContactInfo = async () => {
    if (!application || !application._id) return;

    setLoading(true);
    setError(null);
    try {
      const response = await getContactInformation(application._id);
      setContactInfo(response.data.data);
    } catch (err) {
      setError("Failed to fetch contact information");
      console.error("Error fetching contact info:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && application && application._id) {
      setIsVisible(true);
      fetchContactInfo();
    } else {
      setIsVisible(false);
      setTimeout(() => {
        setContactInfo(null);
        setError(null);
      }, 300);
    }
  }, [isOpen, application]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a toast notification here
      console.log(`${type} copied to clipboard`);
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto transition-all duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300" />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative w-full max-w-md lg:max-w-lg xl:max-w-xl bg-white rounded-2xl shadow-2xl transform transition-all duration-300 ${
            isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <ChatBubbleLeftRightIcon className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                  Contact Information
                </h3>
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  Student contact details
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1 md:p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
            >
              <XMarkIcon className="h-5 w-5 md:h-6 md:w-6 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 md:p-6 max-h-[70vh] overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 md:py-12">
                <div className="relative">
                  <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-3 border-blue-200"></div>
                  <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-3 border-blue-600 border-t-transparent absolute top-0"></div>
                </div>
                <p className="text-gray-500 mt-3 md:mt-4 font-medium text-sm md:text-base">
                  Loading contact information...
                </p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <ExclamationCircleIcon className="h-5 w-5 md:h-6 md:w-6 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-red-800 font-medium text-sm md:text-base">
                      {error}
                    </h4>
                    <p className="text-red-700 text-xs md:text-sm mt-1">
                      Please try again later or contact support if the problem
                      persists.
                    </p>
                    <button
                      onClick={fetchContactInfo}
                      className="mt-2 text-xs md:text-sm bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 md:px-3 md:py-1.5 rounded-lg transition-colors duration-200"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            ) : contactInfo ? (
              <div className="space-y-4 md:space-y-6">
                {/* Student Profile */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 md:p-5">
                  <div className="flex items-center space-x-3 md:space-x-4 mb-3 md:mb-4">
                    <div className="p-2 md:p-3 bg-blue-500 rounded-xl">
                      <UserCircleIcon className="h-6 w-6 md:h-8 md:w-8 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg md:text-xl font-semibold text-gray-900">
                        {contactInfo.student.name}
                      </h4>
                      <p className="text-blue-600 font-medium text-sm md:text-base">
                        Student
                      </p>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="space-y-3 md:space-y-4">
                    {/* Email */}
                    <div className="bg-white/70 backdrop-blur rounded-xl p-3 md:p-4 border border-white/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 md:space-x-3">
                          <div className="p-1.5 md:p-2 bg-green-100 rounded-lg">
                            <EnvelopeIcon className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs md:text-sm font-medium text-gray-600">
                              Email Address
                            </p>
                            <p className="text-gray-900 font-medium text-sm md:text-base truncate">
                              {contactInfo.student.email}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            copyToClipboard(contactInfo.student.email, "Email")
                          }
                          className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 md:p-2 rounded-lg hover:bg-gray-100 ml-2"
                        >
                          <svg
                            className="h-4 w-4 md:h-5 md:w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Phone */}
                    {contactInfo.student.phone && (
                      <div className="bg-white/70 backdrop-blur rounded-xl p-3 md:p-4 border border-white/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 md:space-x-3">
                            <div className="p-1.5 md:p-2 bg-purple-100 rounded-lg">
                              <PhoneIcon className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs md:text-sm font-medium text-gray-600">
                                Phone Number
                              </p>
                              <p className="text-gray-900 font-medium text-sm md:text-base">
                                {contactInfo.student.phone.countryCode}{" "}
                                {contactInfo.student.phone.number}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              copyToClipboard(
                                `${contactInfo.student.phone.countryCode}${contactInfo.student.phone.number}`,
                                "Phone"
                              )
                            }
                            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 md:p-2 rounded-lg hover:bg-gray-100 ml-2"
                          >
                            <svg
                              className="h-4 w-4 md:h-5 md:w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Professional Tip */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 md:p-4">
                  <div className="flex items-start space-x-2 md:space-x-3">
                    <div className="p-1 bg-amber-200 rounded-lg flex-shrink-0 mt-0.5">
                      <svg
                        className="h-3 w-3 md:h-4 md:w-4 text-amber-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h5 className="font-semibold text-amber-800 text-sm md:text-base mb-1">
                        Professional Tip
                      </h5>
                      <p className="text-xs md:text-sm text-amber-700 leading-relaxed">
                        When contacting the student, introduce yourself
                        professionally and reference the specific subjects you
                        applied to teach. Mention your qualifications and
                        availability to make a great first impression.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                  <a
                    href={`mailto:${contactInfo.student.email}`}
                    className="flex items-center justify-center space-x-1 md:space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 md:px-4 md:py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 text-sm md:text-base"
                  >
                    <EnvelopeIcon className="h-4 w-4 md:h-5 md:w-5" />
                    <span>Send Email</span>
                  </a>
                  {contactInfo.student.phone && (
                    <a
                      href={`tel:${contactInfo.student.phone.countryCode}${contactInfo.student.phone.number}`}
                      className="flex items-center justify-center space-x-1 md:space-x-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 md:px-4 md:py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 text-sm md:text-base"
                    >
                      <PhoneIcon className="h-4 w-4 md:h-5 md:w-5" />
                      <span>Call Now</span>
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 md:py-12">
                <div className="p-3 md:p-4 bg-gray-100 rounded-xl inline-block mb-3 md:mb-4">
                  <ExclamationCircleIcon className="h-6 w-6 md:h-8 md:w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium text-sm md:text-base">
                  No contact information available
                </p>
                <p className="text-gray-400 text-xs md:text-sm mt-1">
                  Contact information will be available once the student
                  responds to your application.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-2 md:space-x-3 px-4 md:px-6 py-3 md:py-4 bg-gray-50 rounded-b-2xl sticky bottom-0">
            <button
              onClick={handleClose}
              className="px-4 py-1.5 md:px-6 md:py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-100 transition-colors duration-200 text-sm md:text-base"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfoModal;
