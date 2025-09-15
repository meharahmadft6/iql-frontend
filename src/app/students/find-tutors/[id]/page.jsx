"use client";

import { useEffect, useState } from "react";
import { getPublicTeacherProfile } from "../../../../api/teacher.api";
import StudentDashboardLayout from "../../../layout/student/DashboardLayout";
const TeacherProfilePage = ({ params }) => {
  const { id } = params;
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("message");

  useEffect(() => {
    if (!id) return;

    const fetchTeacher = async () => {
      try {
        const res = await getPublicTeacherProfile(id);
        setTeacher(res.data.data);
        setLoading(false);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to fetch teacher profile"
        );
        setLoading(false);
      }
    };

    fetchTeacher();
  }, [id]);

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (error)
    return <div className="text-center py-20 text-red-500">{error}</div>;
  if (!teacher)
    return <div className="text-center py-20">Teacher not found</div>;

  return (
    <StudentDashboardLayout title="Tutor Profile">
      <div className="min-h-screen flex flex-col ">
        <main className="flex-grow container mx-auto px-4 py-8 md:px-12">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-blue-600 p-6 text-white">
              <div className="flex flex-col md:flex-row items-center">
                {teacher.profilePhotoUrl && (
                  <img
                    src={teacher.profilePhotoUrl}
                    alt={teacher.user.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md mb-4 md:mb-0 md:mr-6"
                  />
                )}
                <div>
                  <h1 className="text-3xl font-bold">{teacher.user.name}</h1>
                  <p className="text-xl opacity-90">{teacher.speciality}</p>
                  <p className="mt-2 flex items-center">
                    <svg
                      className="w-5 h-5 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {teacher.location}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="md:col-span-2">
                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 border-b pb-2">
                      About Me
                    </h2>
                    <p className="text-gray-700 whitespace-pre-line">
                      {teacher.profileDescription}
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 border-b pb-2">
                      Teaching Experience
                    </h2>
                    <div className="space-y-4">
                      {teacher.experience.map((exp, idx) => (
                        <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-lg">
                            {exp.designation}
                          </h3>
                          <p className="text-gray-600">
                            {exp.organization}, {exp.city}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {exp.startMonth} {exp.startYear} -{" "}
                            {exp.currentlyWorking
                              ? "Present"
                              : `${exp.endMonth} ${exp.endYear}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 border-b pb-2">
                      Education
                    </h2>
                    <div className="space-y-4">
                      {teacher.education.map((edu, idx) => (
                        <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-lg">
                            {edu.degreeName}
                          </h3>
                          <p className="text-gray-600">
                            {edu.institution}, {edu.city}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {edu.degreeType} ({edu.association})
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                {/* Right Column */}
                <div>
                  <section className="bg-gray-50 p-6 rounded-lg mb-6">
                    <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                      Teaching Details
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Hourly Rate</p>
                        <p className="font-medium text-lg">
                          {teacher.fee} {teacher.feeDetails}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">
                          Total Experience
                        </p>
                        <p className="font-medium">
                          {teacher.totalExperience} years
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">
                          Teaching Experience
                        </p>
                        <p className="font-medium">
                          {teacher.teachingExperience} years
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">Online Teaching</p>
                        <p className="font-medium">
                          {teacher.availableForOnline
                            ? "Available"
                            : "Not Available"}{" "}
                          ({teacher.onlineTeachingExperience} years experience)
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">
                          Willing to Travel
                        </p>
                        <p className="font-medium">
                          {teacher.willingToTravel ? "Yes" : "No"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">
                          Helps with Homework
                        </p>
                        <p className="font-medium">
                          {teacher.helpsWithHomework ? "Yes" : "No"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">Digital Pen</p>
                        <p className="font-medium">
                          {teacher.hasDigitalPen ? "Yes" : "No"}
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="bg-gray-50 p-6 rounded-lg mb-6">
                    <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                      Subjects
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {teacher.subjects.map((subject, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          {subject.name} ({subject.fromLevel}-{subject.toLevel})
                        </span>
                      ))}
                    </div>
                  </section>

                  <section className="bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                      Languages
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {teacher.languages.map((lang, idx) => (
                        <span
                          key={idx}
                          className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </section>
                </div>
              </div>

              {/* Action Tabs */}
              <div className="mt-8 border rounded-lg overflow-hidden">
                <div className="flex border-b">
                  <button
                    onClick={() => setActiveTab("message")}
                    className={`flex-1 py-3 px-4 font-medium text-center ${
                      activeTab === "message"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Message
                  </button>
                  <button
                    onClick={() => setActiveTab("phone")}
                    className={`flex-1 py-3 px-4 font-medium text-center ${
                      activeTab === "phone"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Phone
                  </button>

                  <button
                    onClick={() => setActiveTab("review")}
                    className={`flex-1 py-3 px-4 font-medium text-center ${
                      activeTab === "review"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Review
                  </button>
                </div>

                <div className="p-6">
                  {activeTab === "message" && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">
                        Send Message
                      </h3>
                      <form>
                        <div className="mb-4">
                          <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            rows="4"
                            placeholder="Write your message here..."
                          ></textarea>
                        </div>
                        <button
                          type="submit"
                          className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 transition-colors"
                        >
                          Send Message
                        </button>
                      </form>
                    </div>
                  )}

                  {activeTab === "phone" && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">
                        Contact via Phone
                      </h3>
                      <div className="bg-blue-50 p-4 rounded-lg mb-4">
                        <p className="text-gray-700 mb-2">
                          Phone number will be displayed after payment
                          confirmation
                        </p>
                        <button className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 transition-colors">
                          Request Contact
                        </button>
                      </div>
                    </div>
                  )}

                    {activeTab === "review" && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Reviews</h3>
                      <div className="space-y-4">
                        <div className="border-b pb-4">
                          <div className="flex items-center mb-2">
                            <div className="flex items-center text-yellow-400 mr-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  className="w-5 h-5"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="font-medium">John D.</span>
                          </div>
                          <p className="text-gray-700">
                            "Mr. O Gariseb is an excellent tutor. His teaching
                            methods are very effective and he's very strict with
                            progress."
                          </p>
                        </div>
                        <div className="border-b pb-4">
                          <div className="flex items-center mb-2">
                            <div className="flex items-center text-yellow-400 mr-2">
                              {[1, 2, 3, 4].map((star) => (
                                <svg
                                  key={star}
                                  className="w-5 h-5"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                              <svg
                                className="w-5 h-5 text-gray-300"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </div>
                            <span className="font-medium">Sarah M.</span>
                          </div>
                          <p className="text-gray-700">
                            "Very knowledgeable in chemistry and physics. My
                            grades improved significantly after just a few
                            sessions."
                          </p>
                        </div>
                        <form className="mt-6">
                          <h4 className="font-medium mb-2">Write a Review</h4>
                          <div className="mb-3">
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  className="text-gray-300 hover:text-yellow-400 focus:outline-none"
                                >
                                  <svg
                                    className="w-6 h-6"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                </button>
                              ))}
                            </div>
                          </div>
                          <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
                            rows="3"
                            placeholder="Share your experience..."
                          ></textarea>
                          <button
                            type="submit"
                            className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 transition-colors"
                          >
                            Submit Review
                          </button>
                        </form>
                      </div>
                    </div>
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

export default TeacherProfilePage;
