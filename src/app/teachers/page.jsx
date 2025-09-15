// pages/teacher/profile/create.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createTeacherProfile } from "../../api/teacher.api";
import { getSubjects, createSubject } from "../../api/subject.api"; // Import subject APIs
import Navbar from "../../components/NavbarProfile";
import Footer from "../../components/Footer";

const CreateTeacherProfile = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Subject-related states
  const [subjectsData, setSubjectsData] = useState([]);
  const [subjectSuggestions, setSubjectSuggestions] = useState([[]]);
  const [showSubjectSuggestions, setShowSubjectSuggestions] = useState([false]);

  const GEOAPIFY_KEY = "216ee53519b343a5be36cba1a2fa6ed6";

  // Level options for dropdown
  const levelOptions = [
    // General proficiency levels
    "Beginner",
    "Intermediate",
    "Advanced",
    "Expert",
    "Proficiency",

    // School grades
    "Kindergarten",
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
    "Grade 7",
    "Grade 8",
    "Grade 9",
    "Grade 10",
    "Grade 11",
    "Grade 12",

    // International school levels
    "Primary",
    "Secondary",
    "IGCSE",
    "igcse",
    "O-Level",
    "AS-Level",
    "A-Level",
    "IB Middle Years",
    "IB Diploma",

    // Higher education
    "Certificate",
    "Diploma",
    "Associate",
    "Bachelor's",
    "Master's",
    "PhD",
    "Postdoctoral",

    // University year levels
    "Undergraduate - Year 1",
    "Undergraduate - Year 2",
    "Undergraduate - Year 3",
    "Undergraduate - Year 4",
    "Postgraduate - Year 1",
    "Postgraduate - Year 2",

    // Professional levels
    "Entry Level",
    "Junior",
    "Mid-Level",
    "Senior",
    "Executive",

    // Language proficiency
    "A1 (Beginner)",
    "A2 (Elementary)",
    "B1 (Intermediate)",
    "B2 (Upper-Intermediate)",
    "C1 (Advanced)",
    "C2 (Proficient)",

    // Other classifications
    "Introductory",
    "Foundation",
    "General",
    "Honors",
    "AP (Advanced Placement)",
    "Remedial",
    "Specialized",
    "Research",
    "Thesis",
    "Other",
  ];

  // Initial form state
  const [formData, setFormData] = useState({
    // Step 1 - Basic Details
    speciality: "",
    currentRole: "",
    gender: "",
    birthDate: "",

    // Step 2 - Contact Info
    location: "",
    phoneNumber: "",

    // Step 3 - Subjects
    subjects: [{ name: "", fromLevel: "", toLevel: "" }],

    // Step 4 - Education
    education: [
      {
        institution: "",
        city: "",
        degreeType: "",
        degreeName: "",
        association: "full-time",
      },
    ],

    // Step 5 - Experience (optional)
    experience: [],

    // Step 6 - Professional Details
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

    // Step 7 - Profile Completion
    profileDescription: "",
    idProofType: "",
    idProofFile: null,
    profilePhoto: null,
  });

  // Fetch subjects on component mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await getSubjects();
        if (response.data.success) {
          setSubjectsData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };

    fetchSubjects();
  }, []);

  // Handle input change for simple fields
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

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (!storedUser) {
      router.replace("/login");
      return;
    }
    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== "teacher") {
        router.replace("/unauthorized");
      } else {
        setAuthChecked(true);
      }
    } catch (err) {
      console.error("Invalid user data in localStorage", err);
      router.replace("/login");
    }
  }, [router]);

  if (!authChecked) {
    return null; // nothing will render until auth check is done
  }

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

  // Handle array field changes (subjects, education, experience)
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

  // Add new item to array
  const addArrayItem = (arrayName, template) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], { ...template }],
    }));

    // If adding a subject, also add to suggestions arrays
    if (arrayName === "subjects") {
      setSubjectSuggestions([...subjectSuggestions, []]);
      setShowSubjectSuggestions([...showSubjectSuggestions, false]);
    }
  };

  // Remove item from array
  const removeArrayItem = (arrayName, index) => {
    const updatedArray = formData[arrayName].filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      [arrayName]: updatedArray,
    }));

    // If removing a subject, also remove from suggestions arrays
    if (arrayName === "subjects") {
      const newSubjectSuggestions = [...subjectSuggestions];
      newSubjectSuggestions.splice(index, 1);
      setSubjectSuggestions(newSubjectSuggestions);

      const newShowSuggestions = [...showSubjectSuggestions];
      newShowSuggestions.splice(index, 1);
      setShowSubjectSuggestions(newShowSuggestions);
    }
  };

  // Handle file upload
  const handleFileUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: file,
      }));
    }
  };

  // Handle language selection
  const handleLanguageChange = (e) => {
    const { value, checked } = e.target;
    let updatedLanguages = [...formData.languages];

    if (checked) {
      updatedLanguages.push(value);
    } else {
      updatedLanguages = updatedLanguages.filter((lang) => lang !== value);
    }

    setFormData((prev) => ({
      ...prev,
      languages: updatedLanguages,
    }));
  };

  // Filter subjects based on input for a specific index
  const filterSubjectSuggestions = (index, query) => {
    if (query.length < 2) {
      const newSuggestions = [...subjectSuggestions];
      newSuggestions[index] = [];
      setSubjectSuggestions(newSuggestions);
      return;
    }

    const filtered = subjectsData.filter(
      (subj) =>
        subj.name.toLowerCase().includes(query.toLowerCase()) ||
        (subj.category &&
          subj.category.toLowerCase().includes(query.toLowerCase())) ||
        subj.level.toLowerCase().includes(query.toLowerCase())
    );

    const newSuggestions = [...subjectSuggestions];
    newSuggestions[index] = filtered;
    setSubjectSuggestions(newSuggestions);
  };

  // Handle subject input change with debouncing
  const handleSubjectInputChange = (index, value) => {
    // Update the subjects array directly
    const updatedSubjects = [...formData.subjects];
    updatedSubjects[index] = {
      ...updatedSubjects[index],
      name: value,
    };

    setFormData((prev) => ({
      ...prev,
      subjects: updatedSubjects,
    }));

    // Show suggestions when typing
    const newShowSuggestions = [...showSubjectSuggestions];
    newShowSuggestions[index] = true;
    setShowSubjectSuggestions(newShowSuggestions);

    // Filter suggestions with debounce
    setTimeout(() => {
      filterSubjectSuggestions(index, value);
    }, 300);
  };

  const selectSubject = async (index, subject) => {
    // Update the subjects array directly
    const updatedSubjects = [...formData.subjects];
    updatedSubjects[index] = {
      ...updatedSubjects[index],
      name: subject.name,
      fromLevel: subject.level,
      toLevel: subject.level,
    };

    setFormData((prev) => ({
      ...prev,
      subjects: updatedSubjects,
    }));

    // Hide suggestions for this input
    const newShowSuggestions = [...showSubjectSuggestions];
    newShowSuggestions[index] = false;
    setShowSubjectSuggestions(newShowSuggestions);
  };
  // Create a new subject if it doesn't exist
  const createNewSubject = async (index, subjectName) => {
    try {
      // Extract category from subject name (simple approach)
      const category = subjectName.split(" ")[0]; // First word as category

      const newSubject = {
        name: subjectName,
        category: category,
        level: "Other", // Default level
      };

      const response = await createSubject(newSubject);

      if (response.data.success) {
        // Add the new subject to our local data
        setSubjectsData([...subjectsData, response.data.data]);

        // Update the form with the new subject
        const nameEvent = {
          target: {
            name: "name",
            value: response.data.data.name,
          },
        };
        handleArrayChange("subjects", index, nameEvent);

        // Show success message or handle as needed
        console.log("New subject created successfully");
      }
    } catch (error) {
      console.error("Error creating new subject:", error);
      // Even if creation fails, we can still use the entered text
    }
  };

  // Form validation for current step
  const validateStep = () => {
    switch (step) {
      case 1:
        if (
          !formData.speciality ||
          !formData.currentRole ||
          !formData.gender ||
          !formData.birthDate
        ) {
          setError("Please fill all required fields");
          return false;
        }
        break;
      case 2:
        if (!formData.location || !formData.phoneNumber) {
          setError("Please fill all required fields");
          return false;
        }
        if (!/^[0-9]{10,15}$/.test(formData.phoneNumber)) {
          setError("Please enter a valid phone number");
          return false;
        }
        break;
      case 3:
        for (const subject of formData.subjects) {
          if (!subject.name || !subject.fromLevel || !subject.toLevel) {
            setError("Please fill all subject fields");
            return false;
          }
        }
        break;
      case 4:
        for (const edu of formData.education) {
          if (
            !edu.institution ||
            !edu.city ||
            !edu.degreeType ||
            !edu.degreeName
          ) {
            setError("Please fill all education fields");
            return false;
          }
        }
        break;
      case 6:
        if (
          !formData.fee ||
          !formData.feeDetails ||
          !formData.totalExperience ||
          !formData.teachingExperience ||
          !formData.onlineTeachingExperience ||
          !formData.opportunities ||
          formData.languages.length === 0
        ) {
          setError("Please fill all required fields");
          return false;
        }
        break;
      case 7:
        if (
          !formData.profileDescription ||
          !formData.idProofType ||
          !formData.idProofFile ||
          !formData.profilePhoto
        ) {
          setError("Please fill all required fields");
          return false;
        }
        if (formData.profileDescription.length > 1000) {
          setError("Description cannot exceed 1000 characters");
          return false;
        }
        break;
    }
    setError("");
    return true;
  };

  // Handle next step
  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  // Handle previous step
  const prevStep = () => {
    setStep(step - 1);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setLoading(true);
    try {
      // Create FormData for file uploads
      const formDataToSend = new FormData();

      // Append all fields
      for (const key in formData) {
        if (key === "subjects" || key === "education" || key === "experience") {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else if (key === "idProofFile" || key === "profilePhoto") {
          if (formData[key]) {
            formDataToSend.append(key, formData[key]);
          }
        } else {
          formDataToSend.append(key, formData[key]);
        }
      }
      console.log("Form Data to Send:", formDataToSend);
      // Before creating the profile, handle new subjects
      for (let i = 0; i < formData.subjects.length; i++) {
        const subject = formData.subjects[i];
        const existingSubject = subjectsData.find(
          (s) => s.name.toLowerCase() === subject.name.toLowerCase()
        );

        if (!existingSubject) {
          try {
            await createNewSubject(i, subject.name);
          } catch (error) {
            console.log(
              `Could not create subject ${subject.name}, but continuing...`
            );
          }
        }
      }
      await createTeacherProfile(formDataToSend);
      router.push("/teachers/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create profile");
    } finally {
      setLoading(false);
    }
  };

  // Common languages options
  const languageOptions = [
    "English",
    "Mandarin Chinese",
    "Hindi",
    "Spanish",
    "French",
    "Standard Arabic",
    "Bengali",
    "Portuguese",
    "Russian",
    "Urdu",
    "Indonesian",
    "German",
    "Japanese",
    "Punjabi",
    "Marathi",
    "Telugu",
    "Turkish",
    "Tamil",
    "Vietnamese",
    "Korean",
    "Italian",
    "Gujarati",
    "Polish",
    "Ukrainian",
    "Malayalam",
    "Kannada",
    "Odia",
    "Sindhi",
    "Pashto",
    "Balochi",
    "Persian (Farsi)",
    "Hebrew",
    "Thai",
    "Dutch",
    "Swedish",
    "Czech",
    "Greek",
    "Hungarian",
    "Finnish",
    "Romanian",
    "Slovak",
    "Serbian",
    "Bulgarian",
    "Malay",
    "Hausa",
    "Yoruba",
    "Zulu",
    "Amharic",
    "Burmese",
    "Nepali",
    "Sinhala",
    "Khmer",
    "Lao",
    "Tagalog (Filipino)",
    "Other",
  ];

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mt-10 mb-10 mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Create Teacher Profile
        </h1>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4, 5, 6, 7].map((stepNum) => (
              <div
                key={stepNum}
                className={`w-10 h-10 rounded-full flex items-center justify-center 
                ${step >= stepNum ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              >
                {stepNum}
              </div>
            ))}
          </div>
          <div className="text-sm text-gray-600 text-center">
            {step === 1 && "Basic Details"}
            {step === 2 && "Contact Information"}
            {step === 3 && "Subjects"}
            {step === 4 && "Education"}
            {step === 5 && "Experience"}
            {step === 6 && "Professional Details"}
            {step === 7 && "Profile Completion"}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Details */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Basic Information</h2>
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
          )}

          {/* Step 2: Contact Information */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Contact Information</h2>
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
          )}

          {/* Step 3: Subjects - UPDATED WITH SUGGESTIONS */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Subjects You Teach</h2>
              {formData.subjects.map((subject, index) => (
                <div key={index} className="border p-4 rounded-lg space-y-3">
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
                  <div className="relative">
                    <label className="block mb-1">Subject Name*</label>
                    <input
                      type="text"
                      name="name"
                      value={subject.name}
                      onChange={(e) =>
                        handleSubjectInputChange(index, e.target.value)
                      }
                      onFocus={() => {
                        const newShowSuggestions = [...showSubjectSuggestions];
                        newShowSuggestions[index] = true;
                        setShowSubjectSuggestions(newShowSuggestions);
                        filterSubjectSuggestions(index, subject.name);
                      }}
                      onBlur={() => {
                        setTimeout(() => {
                          const newShowSuggestions = [
                            ...showSubjectSuggestions,
                          ];
                          newShowSuggestions[index] = false;
                          setShowSubjectSuggestions(newShowSuggestions);
                        }, 200);
                      }}
                      className="w-full p-2 border rounded"
                      placeholder="e.g. Mathematics, Physics, etc."
                      required
                      autoComplete="off"
                    />
                    {showSubjectSuggestions[index] &&
                      subjectSuggestions[index] &&
                      subjectSuggestions[index].length > 0 && (
                        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                          {subjectSuggestions[index].map((suggestion) => (
                            <li
                              key={suggestion._id}
                              className="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                              onMouseDown={() =>
                                selectSubject(index, suggestion)
                              }
                            >
                              <div className="font-medium">
                                {suggestion.name}
                              </div>
                              <div className="text-sm text-gray-600 flex justify-between mt-1">
                                <span>{suggestion.category}</span>
                                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                  {suggestion.level}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1">From Level*</label>
                      <select
                        name="fromLevel"
                        value={subject.fromLevel}
                        onChange={(e) =>
                          handleArrayChange("subjects", index, e)
                        }
                        className="w-full p-2 border rounded h-10 text-sm"
                        style={{ maxHeight: "200px", overflowY: "auto" }}
                        required
                      >
                        <option value="">Select Level</option>
                        {levelOptions.map((level) => (
                          <option key={level} value={level} className="py-1">
                            {level}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1">To Level*</label>
                      <select
                        name="toLevel"
                        value={subject.toLevel}
                        onChange={(e) =>
                          handleArrayChange("subjects", index, e)
                        }
                        className="w-full p-2 border rounded h-10 text-sm"
                        style={{ maxHeight: "200px", overflowY: "auto" }}
                        required
                      >
                        <option value="">Select Level</option>
                        {levelOptions.map((level) => (
                          <option key={level} value={level} className="py-1">
                            {level}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {subject.name &&
                    !subjectsData.some(
                      (s) => s.name.toLowerCase() === subject.name.toLowerCase()
                    ) && (
                      <div className="text-sm text-blue-600">
                        This subject doesn't exist in our database. It will be
                        created automatically.
                      </div>
                    )}
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
          )}

          {/* Step 4: Education */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Education Background</h2>
              {formData.education.map((edu, index) => (
                <div key={index} className="border p-4 rounded-lg space-y-3">
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
                  <div className="grid grid-cols-2 gap-4">
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
          )}

          {/* Step 5: Experience (optional) */}
          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">
                Work Experience (Optional)
              </h2>
              <p className="text-gray-600">
                You can skip this step if you don't have any experience
              </p>

              {formData.experience.map((exp, index) => (
                <div key={index} className="border p-4 rounded-lg space-y-3">
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
                    <label className="block mb-1">Organization Name*</label>
                    <input
                      type="text"
                      name="organization"
                      value={exp.organization}
                      onChange={(e) =>
                        handleArrayChange("experience", index, e)
                      }
                      className="w-full p-2 border rounded"
                      placeholder="e.g. ABC School, XYZ College"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1">City*</label>
                    <input
                      type="text"
                      name="city"
                      value={exp.city}
                      onChange={(e) =>
                        handleArrayChange("experience", index, e)
                      }
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Designation*</label>
                    <input
                      type="text"
                      name="designation"
                      value={exp.designation}
                      onChange={(e) =>
                        handleArrayChange("experience", index, e)
                      }
                      className="w-full p-2 border rounded"
                      placeholder="e.g. Math Teacher, Professor"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1">Start Month*</label>
                      <input
                        type="text"
                        name="startMonth"
                        value={exp.startMonth}
                        onChange={(e) =>
                          handleArrayChange("experience", index, e)
                        }
                        className="w-full p-2 border rounded"
                        placeholder="e.g. January"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Start Year*</label>
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
                        required
                      />
                    </div>
                  </div>
                  {!exp.currentlyWorking && (
                    <div className="grid grid-cols-2 gap-4">
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
          )}

          {/* Step 6: Professional Details */}
          {step === 6 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Professional Details</h2>

              <div className="grid grid-cols-2 gap-4">
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

              <div>
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

              <div className="grid grid-cols-2 gap-4">
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

              <div>
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

              <div>
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

              <div className="grid grid-cols-2 gap-4 mt-4">
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
          )}

          {/* Step 7: Profile Completion */}
          {step === 7 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Complete Your Profile</h2>

              <div>
                <label className="block mb-1">Profile Description*</label>
                <textarea
                  name="profileDescription"
                  value={formData.profileDescription}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  rows="6"
                  placeholder="Tell students about yourself, your teaching style, qualifications, etc."
                  required
                />
                <p className="text-sm text-gray-500">
                  {formData.profileDescription.length}/1000 characters
                </p>
              </div>

              <div>
                <label className="block mb-1">ID Proof Type*</label>
                <select
                  name="idProofType"
                  value={formData.idProofType}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select ID Proof Type</option>
                  <option value="CNIC">CNIC</option>
                  <option value="Passport">Passport</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block mb-1">Upload ID Proof*</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e, "idProofFile")}
                  className="w-full p-2 border rounded"
                  required
                />
                {formData.idProofFile && (
                  <p className="text-sm text-green-600 mt-1">
                    File selected: {formData.idProofFile.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-1">Upload Profile Photo*</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "profilePhoto")}
                  className="w-full p-2 border rounded"
                  required
                />
                {formData.profilePhoto && (
                  <p className="text-sm text-green-600 mt-1">
                    File selected: {formData.profilePhoto.name}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="mt-8 flex justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="bg-gray-200 hover:bg-gray-300 px-6 py-2 rounded"
              >
                Back
              </button>
            ) : (
              <div></div>
            )}

            {step < 7 ? (
              <button
                type="button"
                onClick={nextStep}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Profile"}
              </button>
            )}
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default CreateTeacherProfile;
