// pages/teacher/profile/edit.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getCurrentTeacher,
  updateTeacherProfile,
} from "../../../../api/teacher.api";
import DashboardLayout from "../../../layout/teacher/DashboardLayout";

const EditTeacherProfile = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [teacher, setTeacher] = useState(null);

  const GEOAPIFY_KEY = "216ee53519b343a5be36cba1a2fa6ed6";
  // Form state
  const [formData, setFormData] = useState({
    speciality: "",
    currentRole: "",
    gender: "",
    birthDate: "",
    location: "",
    phoneNumber: "",
    subjects: [{ name: "", fromLevel: "", toLevel: "" }],
    education: [
      {
        institution: "",
        city: "",
        degreeType: "",
        degreeName: "",
        association: "full-time",
      },
    ],
    experience: [],
    fee: "",
    feeDetails: "",
    totalExperience: "",
    teachingExperience: "",
    onlineTeachingExperience: "",
    willingToTravel: false,
    availableForOnline: true,
    hasDigitalPen: false,
    helpsWithHomework: false,
    currentlyEmployed: false,
    opportunities: "",
    languages: [],
    profileDescription: "",
    profilePhoto: null,
    existingProfilePhoto: "",
  });

  useEffect(() => {
    const checkAuthAndFetchProfile = async () => {
      const storedUser = localStorage.getItem("userData");
      if (!storedUser) {
        router.replace("/login");
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== "teacher") {
          router.replace("/unauthorized");
          return;
        }

        setAuthChecked(true);

        // Fetch existing profile data
        const profileRes = await getCurrentTeacher();
        if (profileRes?.data) {
          const teacherData = profileRes.data.data;
          console.log("Fetched Teacher Data:", teacherData);
          setTeacher(teacherData);

          // Transform languages data to ensure it's always an array
          let languagesData = [];
          try {
            if (Array.isArray(teacherData.languages)) {
              languagesData = teacherData.languages;
            } else if (typeof teacherData.languages === "string") {
              // Handle case where languages is a stringified array
              languagesData = JSON.parse(
                teacherData.languages.replace(/\\"/g, '"')
              );
            }
          } catch (e) {
            console.error("Error parsing languages:", e);
            languagesData = [];
          }

          const transformedData = {
            speciality: teacherData.speciality || "",
            currentRole: teacherData.currentRole || "",
            gender: teacherData.gender || "",
            birthDate: teacherData.birthDate
              ? teacherData.birthDate.split("T")[0]
              : "",
            location: teacherData.location || "",
            phoneNumber: teacherData.phoneNumber || "",
            subjects: teacherData.subjects || [
              { name: "", fromLevel: "", toLevel: "" },
            ],
            education: teacherData.education || [
              {
                institution: "",
                city: "",
                degreeType: "",
                degreeName: "",
                association: "full-time",
              },
            ],
            experience: teacherData.experience || [],
            fee: teacherData.fee || "",
            feeDetails: teacherData.feeDetails || "",
            totalExperience: teacherData.totalExperience || "",
            teachingExperience: teacherData.teachingExperience || "",
            onlineTeachingExperience:
              teacherData.onlineTeachingExperience || "",
            willingToTravel: teacherData.willingToTravel || false,
            availableForOnline: teacherData.availableForOnline !== false,
            hasDigitalPen: teacherData.hasDigitalPen || false,
            helpsWithHomework: teacherData.helpsWithHomework || false,
            currentlyEmployed: teacherData.currentlyEmployed || false,
            opportunities: teacherData.opportunities || "",
            languages: languagesData,
            profileDescription: teacherData.profileDescription || "",
            profilePhoto: null,
            existingProfilePhoto: teacherData.profilePhoto || "",
          };

          setFormData(transformedData);
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Failed to load profile data");
      } finally {
        setProfileLoading(false);
      }
    };

    checkAuthAndFetchProfile();
  }, [router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  useEffect(() => {
    if (formData.location.length > 2) {
      const timer = setTimeout(() => {
        fetchSuggestions(formData.location);
      }, 300); // debounce
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [formData.location]);

  const fetchSuggestions = async (query) => {
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
          query
        )}&apiKey=${GEOAPIFY_KEY}&limit=5`
      );
      const data = await response.json();
      // Geoapify returns suggestions in data.features array
      setSuggestions(data.features || []);
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    // Geoapify's format for place name is different than Mapbox
    const placeName = suggestion.properties.formatted;
    setFormData((prev) => ({
      ...prev,
      location: placeName,
    }));
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleArrayChange = (arrayName, index, e) => {
    const { name, value, type, checked } = e.target;
    const updatedArray = [...formData[arrayName]];
    updatedArray[index] = {
      ...updatedArray[index],
      [name]: type === "checkbox" ? checked : value,
    };
    setFormData((prev) => ({
      ...prev,
      [arrayName]: updatedArray,
    }));
  };

  const addArrayItem = (arrayName, template) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], { ...template }],
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    const updatedArray = formData[arrayName].filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      [arrayName]: updatedArray,
    }));
  };

  const handleFileUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: file,
      }));
    }
  };

  const handleLanguageChange = (e) => {
    const { value, checked } = e.target;
    let updatedLanguages = [...formData.languages];

    if (checked) {
      if (!updatedLanguages.includes(value)) {
        updatedLanguages.push(value);
      }
    } else {
      updatedLanguages = updatedLanguages.filter((lang) => lang !== value);
    }

    setFormData((prev) => ({
      ...prev,
      languages: updatedLanguages,
    }));
  };

  const validateForm = () => {
    // Basic details validation
    if (
      !formData.speciality ||
      !formData.currentRole ||
      !formData.gender ||
      !formData.birthDate
    ) {
      setError("Please fill all basic information fields");
      return false;
    }

    // Contact info validation
    if (!formData.location || !formData.phoneNumber) {
      setError("Please fill all contact information fields");
      return false;
    }
    if (!/^[0-9]{10,15}$/.test(formData.phoneNumber)) {
      setError("Please enter a valid phone number");
      return false;
    }

    // Subjects validation
    for (const subject of formData.subjects) {
      if (!subject.name || !subject.fromLevel || !subject.toLevel) {
        setError("Please fill all subject fields");
        return false;
      }
    }

    // Education validation
    for (const edu of formData.education) {
      if (!edu.institution || !edu.city || !edu.degreeType || !edu.degreeName) {
        setError("Please fill all education fields");
        return false;
      }
    }

    // Professional details validation
    if (
      !formData.fee ||
      !formData.feeDetails ||
      !formData.totalExperience ||
      !formData.teachingExperience ||
      !formData.onlineTeachingExperience ||
      !formData.opportunities ||
      formData.languages.length === 0
    ) {
      setError("Please fill all professional details fields");
      return false;
    }

    // Profile description validation
    if (!formData.profileDescription) {
      setError("Please provide a profile description");
      return false;
    }
    if (formData.profileDescription.length < 200) {
      setError("Profile description must be at least 200 characters");
      return false;
    }
    if (formData.profileDescription.length > 1000) {
      setError("Description cannot exceed 1000 characters");
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const formDataToSend = new FormData();

      // Append all text fields
      for (const key in formData) {
        if (key === "profilePhoto" || key === "existingProfilePhoto") continue;

        if (
          key === "subjects" ||
          key === "education" ||
          key === "experience" ||
          key === "languages"
        ) {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      }

      // Always append profile photo (even if it's null/undefined)
      if (formData.profilePhoto) {
        formDataToSend.append("profilePhoto", formData.profilePhoto);
      } else {
        // Send a flag to indicate no new photo
        formDataToSend.append("keepExistingPhoto", "true");
      }

      await updateTeacherProfile(teacher._id, formDataToSend);
      router.push("/teachers/profile");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };
  const languageOptions = [
    "English",
    "Urdu",
    "Punjabi",
    "Hindi",
    "Spanish",
    "French",
    "Arabic",
    "Bengali",
    "Russian",
    "Other",
  ];

  if (!authChecked || profileLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <DashboardLayout title="Edit Teacher Profile">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Edit Teacher Profile
          </h1>

          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Basic Information Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Speciality*</label>
                  <input
                    type="text"
                    name="speciality"
                    value={formData.speciality}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    placeholder="e.g. Mathematics, Physics, etc."
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Current Role*</label>
                  <input
                    type="text"
                    name="currentRole"
                    value={formData.currentRole}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    placeholder="e.g. High School Teacher, Professor, etc."
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Gender*</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Birth Date*</label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block mb-1">Location*</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() =>
                      setTimeout(() => setShowSuggestions(false), 200)
                    }
                    className="w-full p-2 border rounded"
                    placeholder="Town/City, Country"
                    required
                    autoComplete="on"
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                      {suggestions.map((suggestion) => (
                        <li
                          key={suggestion.properties.place_id}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion.properties.formatted}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <label className="block mb-1">Phone Number*</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    placeholder="e.g. 1234567890"
                    required
                  />
                  <p className="text-sm text-gray-500">10-15 digits only</p>
                </div>
              </div>
            </div>

            {/* Subjects Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                Subjects You Teach
              </h2>
              {formData.subjects.map((subject, index) => (
                <div
                  key={index}
                  className="border p-4 rounded-lg space-y-3 mb-4"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Subject {index + 1}</h3>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem("subjects", index)}
                        className="text-red-500 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="block mb-1">Subject Name*</label>
                    <input
                      type="text"
                      name="name"
                      value={subject.name}
                      onChange={(e) => handleArrayChange("subjects", index, e)}
                      className="w-full p-2 border rounded"
                      placeholder="e.g. Mathematics, Physics, etc."
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1">From Level*</label>
                      <input
                        type="text"
                        name="fromLevel"
                        value={subject.fromLevel}
                        onChange={(e) =>
                          handleArrayChange("subjects", index, e)
                        }
                        className="w-full p-2 border rounded"
                        placeholder="e.g. Grade 5, Beginner, etc."
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1">To Level*</label>
                      <input
                        type="text"
                        name="toLevel"
                        value={subject.toLevel}
                        onChange={(e) =>
                          handleArrayChange("subjects", index, e)
                        }
                        className="w-full p-2 border rounded"
                        placeholder="e.g. Grade 12, Advanced, etc."
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  addArrayItem("subjects", {
                    name: "",
                    fromLevel: "",
                    toLevel: "",
                  })
                }
                className="mt-2 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
              >
                + Add Another Subject
              </button>
            </div>

            {/* Education Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                Education Background
              </h2>
              {formData.education.map((edu, index) => (
                <div
                  key={index}
                  className="border p-4 rounded-lg space-y-3 mb-4"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Education {index + 1}</h3>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem("education", index)}
                        className="text-red-500 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="block mb-1">Institution Name*</label>
                    <input
                      type="text"
                      name="institution"
                      value={edu.institution}
                      onChange={(e) => handleArrayChange("education", index, e)}
                      className="w-full p-2 border rounded"
                      placeholder="e.g. University of XYZ"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1">City*</label>
                    <input
                      type="text"
                      name="city"
                      value={edu.city}
                      onChange={(e) => handleArrayChange("education", index, e)}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1">Degree Type*</label>
                      <input
                        type="text"
                        name="degreeType"
                        value={edu.degreeType}
                        onChange={(e) =>
                          handleArrayChange("education", index, e)
                        }
                        className="w-full p-2 border rounded"
                        placeholder="e.g. Bachelor's, Master's, etc."
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Degree Name*</label>
                      <input
                        type="text"
                        name="degreeName"
                        value={edu.degreeName}
                        onChange={(e) =>
                          handleArrayChange("education", index, e)
                        }
                        className="w-full p-2 border rounded"
                        placeholder="e.g. Computer Science, Mathematics, etc."
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1">Association Type*</label>
                    <select
                      name="association"
                      value={edu.association}
                      onChange={(e) => handleArrayChange("education", index, e)}
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="correspondence">Correspondence</option>
                    </select>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  addArrayItem("education", {
                    institution: "",
                    city: "",
                    degreeType: "",
                    degreeName: "",
                    association: "full-time",
                  })
                }
                className="mt-2 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
              >
                + Add Another Education
              </button>
            </div>

            {/* Experience Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                Work Experience (Optional)
              </h2>
              <p className="text-gray-600 mb-4">
                You can skip this section if you don't have any experience
              </p>

              {formData.experience.map((exp, index) => (
                <div
                  key={index}
                  className="border p-4 rounded-lg space-y-3 mb-4"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Experience {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeArrayItem("experience", index)}
                      className="text-red-500 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div>
                    <label className="block mb-1">Organization Name</label>
                    <input
                      type="text"
                      name="organization"
                      value={exp.organization}
                      onChange={(e) =>
                        handleArrayChange("experience", index, e)
                      }
                      className="w-full p-2 border rounded"
                      placeholder="e.g. ABC School, XYZ College"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={exp.city}
                      onChange={(e) =>
                        handleArrayChange("experience", index, e)
                      }
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Designation</label>
                    <input
                      type="text"
                      name="designation"
                      value={exp.designation}
                      onChange={(e) =>
                        handleArrayChange("experience", index, e)
                      }
                      className="w-full p-2 border rounded"
                      placeholder="e.g. Math Teacher, Professor"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1">Start Month</label>
                      <input
                        type="text"
                        name="startMonth"
                        value={exp.startMonth}
                        onChange={(e) =>
                          handleArrayChange("experience", index, e)
                        }
                        className="w-full p-2 border rounded"
                        placeholder="e.g. January"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Start Year</label>
                      <input
                        type="number"
                        name="startYear"
                        value={exp.startYear}
                        onChange={(e) =>
                          handleArrayChange("experience", index, e)
                        }
                        className="w-full p-2 border rounded"
                        min="1900"
                        max={new Date().getFullYear()}
                      />
                    </div>
                  </div>
                  {!exp.currentlyWorking && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1">End Month</label>
                        <input
                          type="text"
                          name="endMonth"
                          value={exp.endMonth || ""}
                          onChange={(e) =>
                            handleArrayChange("experience", index, e)
                          }
                          className="w-full p-2 border rounded"
                          placeholder="e.g. December"
                        />
                      </div>
                      <div>
                        <label className="block mb-1">End Year</label>
                        <input
                          type="number"
                          name="endYear"
                          value={exp.endYear || ""}
                          onChange={(e) =>
                            handleArrayChange("experience", index, e)
                          }
                          className="w-full p-2 border rounded"
                          min="1900"
                          max={new Date().getFullYear()}
                        />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="currentlyWorking"
                        checked={exp.currentlyWorking}
                        onChange={(e) =>
                          handleArrayChange("experience", index, e)
                        }
                        className="mr-2"
                      />
                      Currently working here
                    </label>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  addArrayItem("experience", {
                    organization: "",
                    city: "",
                    designation: "",
                    startMonth: "",
                    startYear: "",
                    currentlyWorking: false,
                  })
                }
                className="mt-2 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
              >
                + Add Experience
              </button>
            </div>

            {/* Professional Details Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                Professional Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-1">Fee (per hour/session)*</label>
                  <input
                    type="number"
                    name="fee"
                    value={formData.fee}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">
                    Total Experience (years)*
                  </label>
                  <input
                    type="number"
                    name="totalExperience"
                    value={formData.totalExperience}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block mb-1">Fee Details*</label>
                <textarea
                  name="feeDetails"
                  value={formData.feeDetails}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  placeholder="Explain your fee structure, discounts, etc."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-1">
                    Teaching Experience (years)*
                  </label>
                  <input
                    type="number"
                    name="teachingExperience"
                    value={formData.teachingExperience}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">
                    Online Teaching Experience (years)*
                  </label>
                  <input
                    type="number"
                    name="onlineTeachingExperience"
                    value={formData.onlineTeachingExperience}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block mb-1">
                  Opportunities Interested In*
                </label>
                <select
                  name="opportunities"
                  value={formData.opportunities}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select Option</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="both">Both</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block mb-1">
                  Languages You Can Teach In*
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {languageOptions.map((lang) => (
                    <label key={lang} className="flex items-center">
                      <input
                        type="checkbox"
                        value={lang}
                        checked={formData.languages.includes(lang)}
                        onChange={handleLanguageChange}
                        className="mr-2"
                      />
                      {lang}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="willingToTravel"
                    checked={formData.willingToTravel}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Willing to travel for teaching
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="availableForOnline"
                    checked={formData.availableForOnline}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Available for online teaching
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="hasDigitalPen"
                    checked={formData.hasDigitalPen}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  I have a digital pen/tablet
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="helpsWithHomework"
                    checked={formData.helpsWithHomework}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Can help with homework
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="currentlyEmployed"
                    checked={formData.currentlyEmployed}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Currently employed elsewhere
                </label>
              </div>
            </div>

            {/* Profile Completion Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                Profile Completion
              </h2>
              <div className="mb-4">
                <label className="block mb-1">Profile Description*</label>
                <textarea
                  name="profileDescription"
                  value={formData.profileDescription}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  rows="6"
                  placeholder="Tell students about yourself, your teaching style, qualifications, etc. (Minimum 200 characters)"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.profileDescription.length}/1000 characters
                  {formData.profileDescription.length < 200 && (
                    <span className="text-red-500 ml-2">
                      (Minimum 200 characters required)
                    </span>
                  )}
                </p>
              </div>

              <div className="mb-4">
                <label className="block mb-1">Profile Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "profilePhoto")}
                  className="w-full p-2 border rounded"
                />
                {formData.profilePhoto ? (
                  <p className="text-sm text-green-600 mt-1">
                    New photo selected: {formData.profilePhoto.name}
                  </p>
                ) : formData.existingProfilePhoto ? (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Current photo:</p>
                    <img
                      src={formData.existingProfilePhoto}
                      alt="Current profile"
                      className="h-20 w-20 rounded-full object-cover mt-1"
                    />
                  </div>
                ) : null}
                <p className="text-sm text-gray-500 mt-1">
                  Leave empty to keep existing photo
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end mt-8">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
              >
                {loading ? "Updating Profile..." : "Update Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditTeacherProfile;
