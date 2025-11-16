"use client";

import { useEffect, useState } from "react";
import {
  getPublicTeacherProfile,
  initiateContact,
  getContactStatus,
  createReview,
  getTeacherReviews,
} from "../../../../api/teacher.api";
import StudentDashboardLayout from "../../../layout/student/DashboardLayout";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaUserTie,
  FaBriefcase,
  FaGraduationCap,
  FaChartBar,
  FaBook,
  FaLanguage,
  FaComments,
  FaPhone,
  FaStar,
  FaEdit,
  FaMapMarkerAlt,
  FaEnvelope,
  FaLock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaSpinner,
  FaUserGraduate,
} from "react-icons/fa";
import {
  HiAcademicCap,
  HiLocationMarker,
  HiMail,
  HiPhone,
} from "react-icons/hi";

const TeacherProfilePage = ({ params }) => {
  const { id } = params;
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("message");
  const [contactStatus, setContactStatus] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [message, setMessage] = useState("");
  const [reviewForm, setReviewForm] = useState({
    title: "",
    text: "",
    rating: 0,
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [teacherRes, contactRes, reviewsRes] = await Promise.all([
          getPublicTeacherProfile(id),
          getContactStatus(id),
          getTeacherReviews(id),
        ]);

        setTeacher(teacherRes.data.data);
        setContactStatus(contactRes.data.data);
        setReviews(reviewsRes.data.data);
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Failed to fetch teacher data";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleContact = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message before contacting");
      return;
    }

    try {
      setActionLoading(true);
      const res = await initiateContact(id, { message });
      setContactStatus(res.data.data);
      setMessage("");
      toast.success(
        "Contact initiated successfully! 50 coins deducted from your wallet.",
        {
          position: "top-right",
          autoClose: 5000,
        }
      );
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to initiate contact";
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!contactStatus) {
      toast.warning(
        "You need to contact this teacher first before leaving a review"
      );
      setActiveTab("message");
      return;
    }

    if (reviewForm.rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      setActionLoading(true);
      await createReview(id, reviewForm);
      toast.success("Review submitted successfully!");
      setReviewForm({ title: "", text: "", rating: 0 });

      // Refresh reviews
      const reviewsRes = await getTeacherReviews(id);
      setReviews(reviewsRes.data.data);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to submit review";
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const canReview = contactStatus && contactStatus.status === "contacted";

  // Skeleton Loader Component
  const SkeletonLoader = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-gray-300 to-gray-400 p-6 h-48 animate-pulse"></div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-center -mt-20">
              <div className="w-32 h-32 bg-gray-300 rounded-full border-4 border-white shadow-md mb-4 md:mb-0 md:mr-6 animate-pulse"></div>
              <div className="flex-1 text-center md:text-left">
                <div className="h-8 bg-gray-300 rounded w-64 mb-2 animate-pulse"></div>
                <div className="h-6 bg-gray-300 rounded w-48 mb-4 animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded w-56 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="bg-white rounded-lg shadow-md p-6 animate-pulse"
              >
                <div className="h-6 bg-gray-300 rounded w-48 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-300 rounded w-4/6"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="bg-white rounded-lg shadow-md p-6 animate-pulse"
              >
                <div className="h-6 bg-gray-300 rounded w-40 mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((subItem) => (
                    <div key={subItem} className="flex justify-between">
                      <div className="h-4 bg-gray-300 rounded w-24"></div>
                      <div className="h-4 bg-gray-300 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return <SkeletonLoader />;

  if (error)
    return (
      <StudentDashboardLayout title="Tutor Profile">
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
              <div className="text-red-500 text-6xl mb-4 flex justify-center">
                <FaExclamationTriangle className="w-16 h-16" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Error Loading Profile
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center mx-auto"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </StudentDashboardLayout>
    );

  if (!teacher)
    return (
      <StudentDashboardLayout title="Tutor Profile">
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
              <div className="text-gray-500 text-6xl mb-4 flex justify-center">
                <FaUserGraduate className="w-16 h-16" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Teacher Not Found
              </h2>
              <p className="text-gray-600">
                The teacher profile you're looking for doesn't exist.
              </p>
            </div>
          </div>
        </div>
      </StudentDashboardLayout>
    );

  return (
    <StudentDashboardLayout title="Tutor Profile">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-8">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 border border-gray-200">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-white relative">
              <div className="absolute inset-0 bg-black opacity-10"></div>
              <div className="relative flex flex-col md:flex-row items-center justify-between">
                <div className="flex flex-col md:flex-row items-center">
                  <div className="relative">
                    {teacher.profilePhotoUrl ? (
                      <img
                        src={teacher.profilePhotoUrl}
                        alt={teacher.user.name}
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-2xl mb-4 md:mb-0 md:mr-8 transform hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-indigo-300 border-4 border-white shadow-2xl flex items-center justify-center text-white text-4xl font-bold mb-4 md:mb-0 md:mr-8">
                        {teacher.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="text-center md:text-left">
                    <h1 className="text-4xl font-bold mb-2">
                      {teacher.user.name}
                    </h1>
                    <p className="text-xl opacity-95 mb-3 font-medium">
                      {teacher.speciality}
                    </p>
                    <p className="flex items-center justify-center md:justify-start text-indigo-100">
                      <HiLocationMarker className="w-5 h-5 mr-2" />
                      {teacher.location}
                    </p>
                  </div>
                </div>

                {/* Contact Status Badge */}
                {contactStatus && (
                  <div className="mt-6 md:mt-0">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold shadow-md flex items-center ${
                        contactStatus.status === "contacted"
                          ? "bg-green-500 text-white"
                          : "bg-yellow-500 text-white"
                      }`}
                    >
                      {contactStatus.status === "contacted" ? (
                        <>
                          <FaCheckCircle className="w-4 h-4 mr-2" />
                          Contact Established
                        </>
                      ) : (
                        <>
                          <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
                          Pending Contact
                        </>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Teacher Information */}
                <div className="lg:col-span-2 space-y-8">
                  {/* About Me Section */}
                  <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200 flex items-center">
                      <span className="bg-indigo-100 text-indigo-600 p-3 rounded-lg mr-3">
                        <FaUserTie className="w-6 h-6" />
                      </span>
                      About Me
                    </h2>
                    <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                      {teacher.profileDescription || "No description provided."}
                    </p>
                  </section>

                  {/* Teaching Experience */}
                  {teacher.experience?.length > 0 && (
                    <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200 flex items-center">
                        <span className="bg-blue-100 text-blue-600 p-3 rounded-lg mr-3">
                          <FaBriefcase className="w-6 h-6" />
                        </span>
                        Teaching Experience
                      </h2>
                      <div className="space-y-4">
                        {teacher.experience.map((exp, idx) => (
                          <div
                            key={idx}
                            className="bg-gray-50 p-5 rounded-lg border-l-4 border-blue-500 hover:shadow-md transition-shadow"
                          >
                            <h3 className="font-bold text-lg text-gray-800">
                              {exp.designation}
                            </h3>
                            <p className="text-gray-600 font-medium">
                              {exp.organization}, {exp.city}
                            </p>
                            <p className="text-gray-500 text-sm mt-1">
                              {exp.startMonth} {exp.startYear} -{" "}
                              {exp.currentlyWorking ? (
                                <span className="text-green-600 font-semibold">
                                  Present
                                </span>
                              ) : (
                                `${exp.endMonth} ${exp.endYear}`
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Education */}
                  {teacher.education?.length > 0 && (
                    <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200 flex items-center">
                        <span className="bg-green-100 text-green-600 p-3 rounded-lg mr-3">
                          <HiAcademicCap className="w-6 h-6" />
                        </span>
                        Education
                      </h2>
                      <div className="space-y-4">
                        {teacher.education.map((edu, idx) => (
                          <div
                            key={idx}
                            className="bg-gray-50 p-5 rounded-lg border-l-4 border-green-500 hover:shadow-md transition-shadow"
                          >
                            <h3 className="font-bold text-lg text-gray-800">
                              {edu.degreeName}
                            </h3>
                            <p className="text-gray-600 font-medium">
                              {edu.institution}, {edu.city}
                            </p>
                            <p className="text-gray-500 text-sm mt-1">
                              {edu.degreeType} ({edu.association})
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>

                {/* Right Column - Details & Actions */}
                <div className="space-y-6">
                  {/* Teaching Details Card */}
                  <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 pb-3 border-b border-gray-200 flex items-center">
                      <span className="bg-purple-100 text-purple-600 p-3 rounded-lg mr-3">
                        <FaChartBar className="w-5 h-5" />
                      </span>
                      Teaching Details
                    </h2>
                    <div className="space-y-4">
                      <DetailItem
                        label="Hourly Rate"
                        value={`${teacher.fee} ${teacher.feeDetails}`}
                      />
                      <DetailItem
                        label="Total Experience"
                        value={`${teacher.totalExperience} years`}
                      />
                      <DetailItem
                        label="Teaching Experience"
                        value={`${teacher.teachingExperience} years`}
                      />
                      <DetailItem
                        label="Online Teaching"
                        value={`${
                          teacher.availableForOnline
                            ? "Available"
                            : "Not Available"
                        } (${
                          teacher.onlineTeachingExperience
                        } years experience)`}
                      />
                      <DetailItem
                        label="Willing to Travel"
                        value={teacher.willingToTravel ? "Yes" : "No"}
                      />
                      <DetailItem
                        label="Helps with Homework"
                        value={teacher.helpsWithHomework ? "Yes" : "No"}
                      />
                      <DetailItem
                        label="Digital Pen"
                        value={teacher.hasDigitalPen ? "Yes" : "No"}
                      />
                    </div>
                  </section>

                  {/* Subjects Card */}
                  {teacher.subjects?.length > 0 && (
                    <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <h2 className="text-xl font-bold text-gray-800 mb-4 pb-3 border-b border-gray-200 flex items-center">
                        <span className="bg-blue-100 text-blue-600 p-3 rounded-lg mr-3">
                          <FaBook className="w-5 h-5" />
                        </span>
                        Subjects
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {teacher.subjects.map((subject, idx) => (
                          <span
                            key={idx}
                            className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium border border-blue-200 hover:bg-blue-100 transition-colors"
                          >
                            {subject.name} ({subject.fromLevel}-
                            {subject.toLevel})
                          </span>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Languages Card */}
                  {teacher.languages?.length > 0 && (
                    <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <h2 className="text-xl font-bold text-gray-800 mb-4 pb-3 border-b border-gray-200 flex items-center">
                        <span className="bg-green-100 text-green-600 p-3 rounded-lg mr-3">
                          <FaLanguage className="w-5 h-5" />
                        </span>
                        Languages
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {teacher.languages.map((lang, idx) => (
                          <span
                            key={idx}
                            className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm font-medium border border-green-200 hover:bg-green-100 transition-colors"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              </div>

              {/* Action Tabs */}
              <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex border-b border-gray-200">
                  {[
                    { id: "message", label: "Send Message", icon: FaComments },
                    { id: "contact", label: "Contact Info", icon: FaPhone },
                    {
                      id: "review",
                      label: `Reviews (${reviews.length})`,
                      icon: FaStar,
                    },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 py-4 px-6 font-semibold text-center transition-all duration-300 flex items-center justify-center ${
                        activeTab === tab.id
                          ? "bg-indigo-600 text-white shadow-inner"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <tab.icon className="w-5 h-5 mr-2" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  {/* Message Tab */}
                  {activeTab === "message" && (
                    <MessageTab
                      contactStatus={contactStatus}
                      message={message}
                      setMessage={setMessage}
                      handleContact={handleContact}
                      actionLoading={actionLoading}
                    />
                  )}

                  {/* Contact Info Tab */}
                  {activeTab === "contact" && (
                    <ContactInfoTab
                      contactStatus={contactStatus}
                      teacher={teacher}
                      setActiveTab={setActiveTab}
                    />
                  )}

                  {/* Review Tab */}
                  {activeTab === "review" && (
                    <ReviewTab
                      reviews={reviews}
                      teacher={teacher}
                      canReview={canReview}
                      reviewForm={reviewForm}
                      setReviewForm={setReviewForm}
                      handleReviewSubmit={handleReviewSubmit}
                      actionLoading={actionLoading}
                      setActiveTab={setActiveTab}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </StudentDashboardLayout>
  );
};

// Reusable Detail Item Component
const DetailItem = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
    <span className="text-sm font-medium text-gray-600">{label}</span>
    <span className="text-sm font-semibold text-gray-800 text-right">
      {value}
    </span>
  </div>
);

// Message Tab Component
const MessageTab = ({
  contactStatus,
  message,
  setMessage,
  handleContact,
  actionLoading,
}) => (
  <div className="max-w-2xl">
    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
      <span className="bg-indigo-100 text-indigo-600 p-3 rounded-lg mr-3">
        <FaComments className="w-6 h-6" />
      </span>
      Send Message
    </h3>

    {contactStatus ? (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
        <div className="flex items-center">
          <div className="bg-green-100 p-2 rounded-full mr-3">
            <FaCheckCircle className="text-green-600 text-lg" />
          </div>
          <div>
            <p className="text-green-800 font-semibold">Contact Established!</p>
            <p className="text-green-700 text-sm mt-1">
              You can now send messages directly to this teacher.
            </p>
          </div>
        </div>
      </div>
    ) : (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-center">
          <div className="bg-blue-100 p-2 rounded-full mr-3">
            <FaMoneyBillWave className="text-blue-600 text-lg" />
          </div>
          <div>
            <p className="text-blue-800 font-semibold">Contact This Teacher</p>
            <p className="text-blue-700 text-sm mt-1">
              Initiating contact costs 50 coins. After payment, you'll get
              access to messaging and contact information.
            </p>
          </div>
        </div>
      </div>
    )}

    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Your Message {!contactStatus && <span className="text-red-500">*</span>}
      </label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
        rows="5"
        placeholder={
          contactStatus
            ? "Write your message to the teacher..."
            : "Introduce yourself and explain why you'd like to connect..."
        }
        disabled={actionLoading}
      ></textarea>
    </div>

    <button
      onClick={handleContact}
      disabled={actionLoading || (!contactStatus && !message.trim())}
      className={`py-3 px-8 rounded-xl font-semibold transition-all duration-300 flex items-center ${
        contactStatus
          ? "bg-green-600 hover:bg-green-700 text-white"
          : "bg-indigo-600 hover:bg-indigo-700 text-white"
      } disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg`}
    >
      {actionLoading ? (
        <>
          <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
          {contactStatus ? "Sending..." : "Processing..."}
        </>
      ) : contactStatus ? (
        <>
          <FaComments className="w-4 h-4 mr-2" />
          Send Message
        </>
      ) : (
        <>
          <FaMoneyBillWave className="w-4 h-4 mr-2" />
          Initiate Contact (50 coins)
        </>
      )}
    </button>
  </div>
);

// Contact Info Tab Component
const ContactInfoTab = ({ contactStatus, teacher, setActiveTab }) => (
  <div>
    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
      <span className="bg-blue-100 text-blue-600 p-3 rounded-lg mr-3">
        <FaPhone className="w-6 h-6" />
      </span>
      Contact Information
    </h3>

    {contactStatus ? (
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-full mr-3">
              <FaCheckCircle className="text-green-600 text-lg" />
            </div>
            <div>
              <p className="text-green-800 font-semibold">Access Granted</p>
              <p className="text-green-700 text-sm mt-1">
                You have access to this teacher's contact information
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ContactCard
            icon={HiPhone}
            title="Phone Number"
            value={teacher.phoneNumber}
            type="phone"
          />
          <ContactCard
            icon={HiMail}
            title="Email Address"
            value={teacher.user.email}
            type="email"
          />
          <div className="md:col-span-2">
            <ContactCard
              icon={HiLocationMarker}
              title="Location"
              value={teacher.location}
              type="location"
            />
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start">
            <div className="bg-yellow-100 p-2 rounded-full mr-3 mt-1">
              <FaExclamationTriangle className="text-yellow-600 text-lg" />
            </div>
            <div>
              <p className="text-yellow-800 font-semibold">
                Professional Etiquette
              </p>
              <p className="text-yellow-700 text-sm mt-1">
                Please be respectful when contacting the teacher. Mention that
                you found them through our platform and maintain professional
                communication.
              </p>
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
        <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <FaLock className="text-blue-600 text-2xl" />
        </div>
        <h4 className="text-xl font-semibold text-blue-800 mb-2">
          Contact Information Locked
        </h4>
        <p className="text-blue-700 mb-6 max-w-md mx-auto">
          To access this teacher's contact information, you need to initiate
          contact first. This helps maintain quality interactions on our
          platform.
        </p>
        <button
          onClick={() => setActiveTab("message")}
          className="bg-indigo-600 text-white py-3 px-8 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg flex items-center mx-auto"
        >
          <FaComments className="w-4 h-4 mr-2" />
          Go to Message Tab
        </button>
      </div>
    )}
  </div>
);

// Contact Card Component
const ContactCard = ({ icon: Icon, title, value, type }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center mb-3">
      <Icon className="text-2xl text-indigo-600 mr-3" />
      <h4 className="font-semibold text-gray-800 text-lg">{title}</h4>
    </div>
    <p className="text-gray-700 font-medium text-lg break-words">{value}</p>
    {type === "phone" && (
      <a
        href={`tel:${value}`}
        className="inline-block mt-3 bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center"
      >
        <HiPhone className="w-4 h-4 mr-2" />
        Call Now
      </a>
    )}
    {type === "email" && (
      <a
        href={`mailto:${value}`}
        className="inline-block mt-3 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
      >
        <HiMail className="w-4 h-4 mr-2" />
        Send Email
      </a>
    )}
  </div>
);

// Review Tab Component
const ReviewTab = ({
  reviews,
  teacher,
  canReview,
  reviewForm,
  setReviewForm,
  handleReviewSubmit,
  actionLoading,
  setActiveTab,
}) => (
  <div>
    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
      <span className="bg-yellow-100 text-yellow-600 p-3 rounded-lg mr-3">
        <FaStar className="w-6 h-6" />
      </span>
      Reviews
      {teacher.averageRating && (
        <span className="ml-3 text-lg font-normal text-gray-600 bg-gray-100 px-3 py-1 rounded-full flex items-center">
          {teacher.averageRating.toFixed(1)}{" "}
          <FaStar className="w-4 h-4 mx-1 text-yellow-400" /> ({reviews.length}{" "}
          review{reviews.length !== 1 ? "s" : ""})
        </span>
      )}
    </h3>

    {/* Existing Reviews */}
    <div className="space-y-6 mb-8">
      {reviews.length > 0 ? (
        reviews.map((review) => <ReviewCard key={review._id} review={review} />)
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <div className="text-6xl mb-4 flex justify-center">
            <FaEdit className="w-16 h-16 text-gray-400" />
          </div>
          <h4 className="text-xl font-semibold text-gray-700 mb-2">
            No Reviews Yet
          </h4>
          <p className="text-gray-600 max-w-md mx-auto">
            Be the first to share your experience with this teacher and help
            others make informed decisions.
          </p>
        </div>
      )}
    </div>

    {/* Review Form */}
    {canReview ? (
      <form
        onSubmit={handleReviewSubmit}
        className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
      >
        <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="bg-indigo-100 text-indigo-600 p-3 rounded-lg mr-3">
            <FaEdit className="w-5 h-5" />
          </span>
          Write a Review
        </h4>

        {/* Rating */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Your Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                className="text-3xl focus:outline-none transition-transform hover:scale-110"
              >
                <span
                  className={
                    star <= reviewForm.rating
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }
                >
                  ★
                </span>
              </button>
            ))}
            <span className="ml-4 text-lg font-semibold text-gray-700">
              {reviewForm.rating > 0
                ? `${reviewForm.rating} star${reviewForm.rating > 1 ? "s" : ""}`
                : "Select rating"}
            </span>
          </div>
        </div>

        {/* Review Title */}
        <div className="mb-6">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-3"
          >
            Review Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={reviewForm.title}
            onChange={(e) =>
              setReviewForm({ ...reviewForm, title: e.target.value })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            placeholder="Brief summary of your experience..."
            required
          />
        </div>

        {/* Review Text */}
        <div className="mb-6">
          <label
            htmlFor="text"
            className="block text-sm font-medium text-gray-700 mb-3"
          >
            Your Review <span className="text-red-500">*</span>
          </label>
          <textarea
            id="text"
            value={reviewForm.text}
            onChange={(e) =>
              setReviewForm({ ...reviewForm, text: e.target.value })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
            rows="5"
            placeholder="Share your detailed experience with this teacher. What did you like? What could be improved?"
            required
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={actionLoading || reviewForm.rating === 0}
          className="bg-indigo-600 text-white py-3 px-8 rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg w-full sm:w-auto flex items-center justify-center"
        >
          {actionLoading ? (
            <>
              <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
              Submitting Review...
            </>
          ) : (
            <>
              <FaEdit className="w-4 h-4 mr-2" />
              Submit Review
            </>
          )}
        </button>
      </form>
    ) : (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
        <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <FaLock className="text-blue-600 text-2xl" />
        </div>
        <h4 className="text-xl font-semibold text-blue-800 mb-2">
          Review Access Required
        </h4>
        <p className="text-blue-700 mb-6 max-w-md mx-auto">
          You need to contact this teacher before you can leave a review. This
          ensures that reviews come from actual students.
        </p>
        <button
          onClick={() => setActiveTab("message")}
          className="bg-indigo-600 text-white py-3 px-8 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg flex items-center mx-auto"
        >
          <FaComments className="w-4 h-4 mr-2" />
          Contact Teacher First
        </button>
      </div>
    )}
  </div>
);

// Review Card Component
const ReviewCard = ({ review }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
      <div className="flex items-center mb-3 sm:mb-0">
        <div className="flex items-center text-yellow-400 mr-3">
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              className={`w-5 h-5 ${
                i < review.rating ? "text-yellow-400" : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <span className="font-bold text-gray-800 text-lg">
          {review.user.name}
        </span>
      </div>
      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
        {new Date(review.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </span>
    </div>
    <h4 className="font-bold text-xl text-gray-800 mb-3">{review.title}</h4>
    <p className="text-gray-700 leading-relaxed">{review.text}</p>
  </div>
);

export default TeacherProfilePage;
