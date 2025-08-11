"use client";
import React, { useState, useEffect } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import {
  Users,
  Search,
  Filter,
  ChevronRight,
  Check,
  X,
  MoreVertical,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getAllTeachers, approveTeacher } from "../../../api/teacher.api";
import Swal from "sweetalert2";

const TeachersPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    isApproved: null,
    speciality: "",
  });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await getAllTeachers();
        if (response.data.success) {
          setTeachers(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching teachers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.speciality.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesApproval =
      filters.isApproved === null || teacher.isApproved === filters.isApproved;

    const matchesSpeciality =
      !filters.speciality ||
      teacher.speciality
        .toLowerCase()
        .includes(filters.speciality.toLowerCase());

    return matchesSearch && matchesApproval && matchesSpeciality;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              Teachers Management
            </h1>
            <p className="text-gray-600">
              {filteredTeachers.length} teachers found
            </p>
          </div>
          <Link
            href="/dashboard/teachers/add"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full md:w-auto text-center"
          >
            Add New Teacher
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search teachers by name, email or speciality"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col md:flex-row items-center gap-2">
              <select
                className="w-full md:w-auto border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={filters.isApproved}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    isApproved:
                      e.target.value === "null"
                        ? null
                        : e.target.value === "true",
                  })
                }
              >
                <option value="null">All Approval Status</option>
                <option value="true">Approved</option>
                <option value="false">Not Approved</option>
              </select>
              <button className="w-full md:w-auto flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50">
                <Filter size={16} />
                <span>More Filters</span>
              </button>
            </div>
          </div>
        </div>

        {isMobile ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {filteredTeachers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No teachers found matching your criteria
              </div>
            ) : (
              filteredTeachers.map((teacher) => (
                <div
                  key={teacher._id}
                  className="p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="relative h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
                      {teacher.profilePhotoUrl ? (
                        <Image
                          src={teacher.profilePhotoUrl}
                          alt={teacher.user.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="bg-blue-100 h-full w-full flex items-center justify-center text-blue-600 font-medium">
                          {teacher.user.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <Link
                        href={`/dashboard/teachers/${teacher._id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {teacher.user.name}
                      </Link>
                      <p className="text-sm text-gray-500">
                        {teacher.currentRole}
                      </p>
                      <p className="text-sm text-gray-800 mt-1">
                        {teacher.user.email}
                      </p>
                      <p className="text-sm text-gray-500">
                        {teacher.phoneNumber}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          teacher.isApproved
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {teacher.isApproved ? "Approved" : "Pending"}
                      </span>
                      <div className="mt-2 flex items-center gap-1">
                        <Link
                          href={`/dashboard/teachers/${teacher._id}`}
                          className="p-1 text-gray-500 hover:text-blue-600"
                          title="View Details"
                        >
                          <MoreVertical size={16} />
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                    <div>
                      <p className="font-medium">Speciality</p>
                      <p className="text-gray-600">{teacher.speciality}</p>
                    </div>
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-gray-600">{teacher.location}</p>
                    </div>
                    <div>
                      <p className="font-medium">Total Exp</p>
                      <p className="text-gray-600">
                        {teacher.totalExperience} years
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Teaching Exp</p>
                      <p className="text-gray-600">
                        {teacher.teachingExperience} years
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-12 bg-gray-50 p-4 border-b border-gray-200 font-medium text-gray-700">
              <div className="col-span-3">Teacher</div>
              <div className="col-span-3">Contact</div>
              <div className="col-span-2">Speciality</div>
              <div className="col-span-2">Experience</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Actions</div>
            </div>

            {filteredTeachers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No teachers found matching your criteria
              </div>
            ) : (
              filteredTeachers.map((teacher) => (
                <div
                  key={teacher._id}
                  className="grid grid-cols-12 items-center p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="relative h-10 w-10 rounded-full overflow-hidden">
                      {teacher.profilePhotoUrl ? (
                        <Image
                          src={teacher.profilePhotoUrl}
                          alt={teacher.user.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="bg-blue-100 h-full w-full flex items-center justify-center text-blue-600 font-medium">
                          {teacher.user.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <Link
                        href={`/dashboard/teachers/${teacher._id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {teacher.user.name}
                      </Link>
                      <p className="text-sm text-gray-500">
                        {teacher.currentRole}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-3">
                    <p className="text-gray-800">{teacher.user.email}</p>
                    <p className="text-sm text-gray-500">
                      {teacher.phoneNumber}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-800">{teacher.speciality}</p>
                    <p className="text-sm text-gray-500">{teacher.location}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-800">
                      {teacher.totalExperience} years total
                    </p>
                    <p className="text-sm text-gray-500">
                      {teacher.teachingExperience} years teaching
                    </p>
                  </div>
                  <div className="col-span-1">
                    <span
                      className={`inline-flex items-center justify-center px-6 py-2 rounded-full text-xs font-medium ${
                        teacher.isApproved
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {teacher.isApproved ? "Approved" : "Pending Approval"}
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center justify-end gap-2">
                    <Link
                      href={`/dashboard/teachers/${teacher._id}`}
                      className="p-1 text-gray-500 hover:text-blue-600"
                      title="View Details"
                    >
                      <ChevronRight size={26} />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeachersPage;
