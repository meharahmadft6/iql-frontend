import React from "react";
import Link from "next/link";
import {
  BookOpen,
  Home,
  Laptop,
  PenSquare,
  Briefcase,
  Users,
  Globe,
  FileEdit,
} from "lucide-react";

const TeachingSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Explore{" "}
            <span className="bg-gradient-to-r from-blue-900 via-sky-400 to-green-500 bg-clip-text text-transparent">
              Teaching
            </span>{" "}
            Opportunities
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with students or find your perfect teaching position
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* tutors Column */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center">
                <div className="bg-emerald-100 p-3 rounded-lg">
                  <BookOpen className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="ml-4 text-2xl font-bold text-gray-800">
                  Find Educators
                </h3>
              </div>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {[
                  {
                    title: "Qualified tutors",
                    href: "/tutors",
                    icon: <BookOpen className="h-6 w-6 text-emerald-600" />,
                    desc: "Find certified educators for all subjects",
                  },
                  {
                    title: "Home Tutors",
                    href: "/tutors/home-tutors",
                    icon: <Home className="h-6 w-6 text-emerald-600" />,
                    desc: "Personalized learning at your location",
                  },
                  {
                    title: "Online Instructors",
                    href: "/tutors/online-tutors",
                    icon: <Laptop className="h-6 w-6 text-emerald-600" />,
                    desc: "Learn from anywhere with virtual classes",
                  },
                  {
                    title: "Assignment Help",
                    href: "/tutors/assignment-help",
                    icon: <PenSquare className="h-6 w-6 text-emerald-600" />,
                    desc: "Get expert guidance on your work",
                  },
                ].map((item, index) => (
                  <li key={index}>
                    <Link
                      href={item.href}
                      className="flex items-start p-4 rounded-lg hover:bg-gray-50 transition-all duration-200"
                    >
                      <span className="mr-4 mt-1">{item.icon}</span>
                      <div>
                        <p className="text-lg font-medium text-gray-800">
                          {item.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {item.desc}
                        </p>
                      </div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="ml-auto h-5 w-5 text-gray-400 mt-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Link
                  href="/tutors"
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-medium rounded-lg transition duration-200"
                >
                  <BookOpen className="h-5 w-5" />
                  Browse All tutors
                </Link>
              </div>
            </div>
          </div>

          {/* Teaching Jobs Column */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center">
                <div className="bg-amber-100 p-3 rounded-lg">
                  <Briefcase className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="ml-4 text-2xl font-bold text-gray-800">
                  Teaching Positions
                </h3>
              </div>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {[
                  {
                    title: "Full-time Positions",
                    href: "/teaching-jobs",
                    icon: <Briefcase className="h-6 w-6 text-amber-600" />,
                    desc: "Stable teaching roles at institutions",
                  },
                  {
                    title: "Private Tutoring",
                    href: "/teaching-jobs/home",
                    icon: <Users className="h-6 w-6 text-amber-600" />,
                    desc: "One-on-one teaching opportunities",
                  },
                  {
                    title: "Online Teaching",
                    href: "/teaching-jobs/online-jobs",
                    icon: <Globe className="h-6 w-6 text-amber-600" />,
                    desc: "Teach remotely from anywhere",
                  },
                  {
                    title: "Academic Writing",
                    href: "/teaching-jobs/assignment-jobs",
                    icon: <FileEdit className="h-6 w-6 text-amber-600" />,
                    desc: "Create educational content",
                  },
                ].map((item, index) => (
                  <li key={index}>
                    <Link
                      href={item.href}
                      className="flex items-start p-4 rounded-lg hover:bg-gray-50 transition-all duration-200"
                    >
                      <span className="mr-4 mt-1">{item.icon}</span>
                      <div>
                        <p className="text-lg font-medium text-gray-800">
                          {item.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {item.desc}
                        </p>
                      </div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="ml-auto h-5 w-5 text-gray-400 mt-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Link
                  href="/teaching-jobs"
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-amber-50 hover:bg-amber-100 text-amber-600 font-medium rounded-lg transition duration-200"
                >
                  <Briefcase className="h-5 w-5" />
                  View All Job Openings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeachingSection;
