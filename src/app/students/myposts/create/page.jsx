"use client";
import { useState, useEffect, useRef } from "react";
import {
  createPostRequirement,
  getPostRequirementById as getPostRequirement,
  updatePostRequirement,
} from "../../../../api/postRequirement.api";
import Swal from "sweetalert2";
import StudentDashboardLayout from "../../../layout/student/DashboardLayout";
import { useRouter } from "next/navigation";

const RequestTeacherPage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [postId, setPostId] = useState(null);
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showCountryCodeDropdown, setShowCountryCodeDropdown] = useState(false);
  const [countryFilter, setCountryFilter] = useState("");
  const [countries, setCountries] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  const [formData, setFormData] = useState({
    location: "",
    phone: {
      countryCode: "+92",
      number: "",
    },
    description: "",
    subjects: [{ name: "", level: "" }],
    serviceType: "",
    meetingOptions: [],
    budget: {
      currency: "PKR",
      amount: "",
      frequency: "",
    },
    employmentType: "",
    languages: [""],
    image: null,
  });

  const GEOAPIFY_KEY = "216ee53519b343a5be36cba1a2fa6ed6";

  const levelOptions = [
    "Beginner",
    "Intermediate",
    "Advanced",
    "Expert",
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
    "Diploma",
    "Bachelor's",
    "Master's",
    "PhD",
  ];

  const frequencyOptions = [
    "Per Hour",
    "Per Day",
    "Per Week",
    "Per Month",
    "Per Year",
    "Fixed",
  ];
  const serviceTypes = ["Tutoring", "Assignment Help"];
  const meetingOptionsList = ["Online", "At my place", "Travel to tutor"];
  const employmentTypes = ["Part-time", "Full-time"];

  // Refs for dropdown containers
  const locationRef = useRef(null);
  const countryCodeRef = useRef(null);

  // Check if editing an existing post
  useEffect(() => {
    // Check if we're on client side before using searchParams
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");
      if (id) {
        setIsEditing(true);
        setPostId(id);
        fetchPostData(id);
      }
    }
  }, []);

  // Authentication check
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const user =
      typeof window !== "undefined" ? localStorage.getItem("userData") : null;

    if (token && user) {
      const userData = JSON.parse(user);

      // Check if user role is "student"
      if (userData.role !== "student") {
        Swal.fire({
          icon: "error",
          title: "Access Denied",
          text: "Only students can access this page.",
          confirmButtonText: "OK",
          confirmButtonColor: "#dc2626",
        }).then(() => {
          router.push("/login");
        });
        return;
      }

      setIsLoggedIn(true);
      setUserData(userData);
    } else {
      Swal.fire({
        icon: "warning",
        title: "Authentication Required",
        text: "Please login to continue.",
        confirmButtonText: "OK",
        confirmButtonColor: "#2563eb",
      }).then(() => {
        router.push("/login");
      });
    }
  }, [router]);

  // Fetch post data for editing
  const fetchPostData = async (id) => {
    setIsLoadingPost(true);
    try {
      const response = await getPostRequirement(id);
      if (response.data.success) {
        const postData = response.data.data;

        // Transform the API data to match our form structure
        setFormData({
          location: postData.location || "",
          phone: {
            countryCode: postData.phone?.countryCode || "+92",
            number: postData.phone?.number || "",
          },
          description: postData.description || "",
          subjects:
            postData.subjects && postData.subjects.length > 0
              ? postData.subjects
              : [{ name: "", level: "" }],
          serviceType: postData.serviceType || "",
          meetingOptions: postData.meetingOptions || [],
          budget: {
            currency: postData.budget?.currency || "PKR",
            amount: postData.budget?.amount || "",
            frequency: postData.budget?.frequency || "",
          },
          employmentType: postData.employmentType || "",
          languages:
            postData.languages && postData.languages.length > 0
              ? postData.languages
              : [""],
          image: null, // Handle image separately if needed
        });
      }
    } catch (error) {
      console.error("Error fetching post data:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load post data. Please try again.",
        confirmButtonText: "OK",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setIsLoadingPost(false);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setShowLocationDropdown(false);
      }

      if (
        countryCodeRef.current &&
        !countryCodeRef.current.contains(event.target)
      ) {
        setShowCountryCodeDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch countries for phone codes
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,idd,flag"
        );
        const data = await response.json();
        const formattedCountries = data
          .filter((country) => country.idd && country.idd.root)
          .map((country) => ({
            name: country.name.common,
            code:
              country.idd.root +
              (country.idd.suffixes ? country.idd.suffixes[0] : ""),
            flag: country.flag,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setCountries(formattedCountries);
      } catch (error) {
        console.error("Error fetching countries:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load country data.",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
        });
      }
    };
    fetchCountries();
  }, []);

  // Fetch languages
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=languages"
        );
        const data = await response.json();
        const languageSet = new Set();
        data.forEach((country) => {
          if (country.languages) {
            Object.values(country.languages).forEach((lang) =>
              languageSet.add(lang)
            );
          }
        });
        setLanguages([...languageSet].sort());
      } catch (error) {
        console.error("Error fetching languages:", error);
        setLanguages([
          "English",
          "Urdu",
          "Arabic",
          "Spanish",
          "French",
          "German",
          "Chinese",
          "Hindi",
        ]);
      }
    };
    fetchLanguages();
  }, []);

  // Fetch location suggestions from Geoapify Autocomplete API
  const fetchLocationSuggestions = async (query) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
          query
        )}&apiKey=${GEOAPIFY_KEY}&limit=5`
      );
      const data = await response.json();
      setLocationSuggestions(data.features || []);
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch location suggestions.",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
    }
  };

  // Get user's current location via browser & Geoapify reverse geocoding
  const getCurrentLocation = () => {
    setIsGeolocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${GEOAPIFY_KEY}`
            );
            const data = await response.json();
            if (data.features && data.features.length > 0) {
              setFormData((prev) => ({
                ...prev,
                location: data.features[0].properties.formatted,
              }));
              Swal.fire({
                icon: "success",
                title: "Location Found",
                text: "Your location has been automatically detected.",
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 3000,
              });
            }
            setIsGeolocating(false);
          } catch (error) {
            console.error("Error getting location:", error);
            setIsGeolocating(false);
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Failed to get your location.",
              toast: true,
              position: "top-end",
              showConfirmButton: false,
              timer: 3000,
            });
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setIsGeolocating(false);
          Swal.fire({
            icon: "error",
            title: "Location Access Denied",
            text: "Please allow location access.",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
          });
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
      setIsGeolocating(false);
    }
  };

  useEffect(() => {
    if (formData.location.length > 2) {
      const timer = setTimeout(() => {
        fetchLocationSuggestions(formData.location);
        setShowLocationDropdown(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setLocationSuggestions([]);
      setShowLocationDropdown(false);
    }
  }, [formData.location]);

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.phone.number.trim())
      newErrors.phoneNumber = "Phone number is required";
    if (!formData.serviceType)
      newErrors.serviceType = "Service type is required";
    if (!formData.employmentType)
      newErrors.employmentType = "Employment type is required";
    if (formData.meetingOptions.length === 0)
      newErrors.meetingOptions = "At least one meeting option is required";

    if (formData.subjects.some((s) => !s.name.trim() || !s.level)) {
      newErrors.subjects = "All subjects must have name and level";
    }

    if (!formData.budget.amount || formData.budget.amount <= 0) {
      newErrors.budgetAmount = "Valid budget amount is required";
    }

    if (!formData.budget.frequency)
      newErrors.budgetFrequency = "Budget frequency is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";

    if (formData.languages.some((l) => !l.trim())) {
      newErrors.languages = "All language fields must be filled";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleLocationSelect = (location) => {
    setFormData((prev) => ({
      ...prev,
      location: location.properties.formatted,
    }));
    setShowLocationDropdown(false);
    setLocationSuggestions([]);
  };

  const handleArrayChange = (index, field, value, arrayName) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) =>
        i === index
          ? typeof item === "object"
            ? { ...item, [field]: value }
            : value
          : item
      ),
    }));
  };

  const addArrayItem = (arrayName, defaultValue) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], defaultValue],
    }));
  };

  const removeArrayItem = (index, arrayName) => {
    if (formData[arrayName].length > 1) {
      setFormData((prev) => ({
        ...prev,
        [arrayName]: prev[arrayName].filter((_, i) => i !== index),
      }));
    }
  };

  const handleCheckboxChange = (value, checked) => {
    setFormData((prev) => ({
      ...prev,
      meetingOptions: checked
        ? [...prev.meetingOptions, value]
        : prev.meetingOptions.filter((option) => option !== value),
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
    }
  };

  // Clean data before submission
  const cleanFormData = () => {
    return {
      ...formData,
      subjects: formData.subjects.filter((s) => s.name.trim() && s.level),
      languages: formData.languages.filter((l) => l.trim()),
      description: formData.description.trim(),
      budget: {
        ...formData.budget,
        amount: Number(formData.budget.amount),
      },
    };
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const cleanedData = cleanFormData();
      const submitData = new FormData();

      // Add user ID
      if (userData) {
        submitData.append("userId", userData.id);
      }

      // Add cleaned data properly
      Object.keys(cleanedData).forEach((key) => {
        if (key === "phone" || key === "budget") {
          Object.keys(cleanedData[key]).forEach((subKey) => {
            submitData.append(`${key}.${subKey}`, cleanedData[key][subKey]);
          });
        } else if (key === "subjects") {
          cleanedData[key].forEach((subject, index) => {
            submitData.append(`subjects[${index}][name]`, subject.name);
            submitData.append(`subjects[${index}][level]`, subject.level);
          });
        } else if (key === "meetingOptions") {
          cleanedData[key].forEach((option, index) => {
            submitData.append(`meetingOptions[${index}]`, option);
          });
        } else if (key === "languages") {
          cleanedData[key].forEach((language, index) => {
            submitData.append(`languages[${index}]`, language);
          });
        } else if (key === "image" && cleanedData[key]) {
          submitData.append("image", cleanedData[key]);
        } else if (key !== "image") {
          submitData.append(key, cleanedData[key]);
        }
      });

      let response;
      if (isEditing && postId) {
        response = await updatePostRequirement(postId, submitData);
      } else {
        response = await createPostRequirement(submitData);
      }

      if (response.data?.success) {
        Swal.fire({
          icon: "success",
          title: isEditing ? "Post Updated!" : "Request Submitted!",
          text:
            response.data.message ||
            "Your requirement has been processed successfully.",
          confirmButtonText: "OK",
          confirmButtonColor: "#2563eb",
        }).then(() => {
          router.push("/students/myposts");
        });
      } else {
        throw new Error(response.data?.message || "Submission failed");
      }
    } catch (error) {
      console.error("Error submitting request:", error);

      let errorMessage = "Error processing request. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: errorMessage,
        confirmButtonText: "OK",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setLoading(false);
    }
  };

  // Location input with suggestions
  const renderLocationInput = () => {
    const filteredCountries = countries.filter(
      (country) =>
        country.name.toLowerCase().includes(countryFilter.toLowerCase()) ||
        country.code.includes(countryFilter)
    );

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isEditing ? "Edit Your Requirement" : "Post a New Requirement"}
          </h2>
          <p className="text-gray-600">
            {isEditing
              ? "Update your teaching requirement details"
              : "Find the perfect tutor by posting your requirement"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Contact Information
            </h3>

            <div className="space-y-4">
              <div className="relative" ref={locationRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    onFocus={() => setShowLocationDropdown(true)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.location ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your city/area"
                  />
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={isGeolocating}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200 disabled:opacity-50"
                    title="Use current location"
                  >
                    {isGeolocating ? "..." : "📍"}
                  </button>
                </div>

                {showLocationDropdown && locationSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {locationSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleLocationSelect(suggestion)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100"
                      >
                        <div className="font-medium">
                          {suggestion.properties.formatted}
                        </div>
                        <div className="text-sm text-gray-500">
                          {suggestion.properties.country}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {errors.location && (
                  <p className="text-red-500 text-sm mt-1">{errors.location}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                  <div className="relative" ref={countryCodeRef}>
                    <button
                      type="button"
                      onClick={() =>
                        setShowCountryCodeDropdown(!showCountryCodeDropdown)
                      }
                      className="flex items-center justify-between px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-40"
                    >
                      <span className="truncate mr-2">
                        {formData.phone.countryCode}
                      </span>
                      <svg
                        className="h-4 w-4 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {showCountryCodeDropdown && (
                      <div className="absolute z-50 mt-1 w-full sm:w-96 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        <div className="p-2 sticky top-0 bg-white">
                          <input
                            type="text"
                            placeholder="Search country..."
                            value={countryFilter}
                            onChange={(e) => setCountryFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            autoFocus
                          />
                        </div>
                        {filteredCountries.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                phone: {
                                  ...prev.phone,
                                  countryCode: country.code,
                                },
                              }));
                              setShowCountryCodeDropdown(false);
                              setCountryFilter("");
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 flex items-center"
                          >
                            <span className="mr-2">{country.flag}</span>
                            <span className="flex-1 truncate">
                              {country.name}
                            </span>
                            <span className="text-gray-500">
                              {country.code}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input
                    type="tel"
                    name="phone.number"
                    value={formData.phone.number}
                    onChange={handleInputChange}
                    className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.phoneNumber ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter phone number"
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Service Details
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Type *
                </label>
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.serviceType ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select service type</option>
                  {serviceTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.serviceType && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.serviceType}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employment Type *
                </label>
                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.employmentType ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select employment type</option>
                  {employmentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.employmentType && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.employmentType}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Options * (Select at least one)
                </label>
                <div className="space-y-2">
                  {meetingOptionsList.map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.meetingOptions.includes(option)}
                        onChange={(e) =>
                          handleCheckboxChange(option, e.target.checked)
                        }
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.meetingOptions && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.meetingOptions}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Subjects & Budget */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Subjects & Budget
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subjects *
                </label>
                {formData.subjects.map((subject, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 mb-2"
                  >
                    <input
                      type="text"
                      placeholder="Subject name (e.g., Mathematics)"
                      value={subject.name}
                      onChange={(e) =>
                        handleArrayChange(
                          index,
                          "name",
                          e.target.value,
                          "subjects"
                        )
                      }
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <select
                      value={subject.level}
                      onChange={(e) =>
                        handleArrayChange(
                          index,
                          "level",
                          e.target.value,
                          "subjects"
                        )
                      }
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:min-w-32"
                    >
                      <option value="">Select level</option>
                      {levelOptions.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                    {formData.subjects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem(index, "subjects")}
                        className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 sm:w-auto w-full"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    addArrayItem("subjects", { name: "", level: "" })
                  }
                  className="mt-2 px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 w-full sm:w-auto"
                >
                  + Add Subject
                </button>
                {errors.subjects && (
                  <p className="text-red-500 text-sm mt-1">{errors.subjects}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="number"
                      name="budget.amount"
                      value={formData.budget.amount}
                      onChange={handleInputChange}
                      placeholder="Amount"
                      min="1"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.budgetAmount
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.budgetAmount && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.budgetAmount}
                      </p>
                    )}
                  </div>
                  <div>
                    <select
                      name="budget.frequency"
                      value={formData.budget.frequency}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.budgetFrequency
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Select frequency</option>
                      {frequencyOptions.map((freq) => (
                        <option key={freq} value={freq}>
                          {freq}
                        </option>
                      ))}
                    </select>
                    {errors.budgetFrequency && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.budgetFrequency}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Currency: {formData.budget.currency}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Additional Details
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Describe your learning needs, goals, preferred teaching style, and any specific requirements..."
                  maxLength={500}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description}
                  </p>
                )}
                <div className="text-sm text-gray-500 mt-1">
                  {formData.description.length}/500 characters
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Languages *
                </label>
                {formData.languages.map((language, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 mb-2"
                  >
                    <select
                      value={language}
                      onChange={(e) =>
                        handleArrayChange(
                          index,
                          "",
                          e.target.value,
                          "languages"
                        )
                      }
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select language</option>
                      {languages.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                    {formData.languages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem(index, "languages")}
                        className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 sm:w-auto w-full"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem("languages", "")}
                  className="mt-2 px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 w-full sm:w-auto"
                >
                  + Add Language
                </button>
                {errors.languages && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.languages}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requirement Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="text-sm text-gray-500 mt-1">
                  Upload an image related to your requirement (max 5MB)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={loading || isLoadingPost}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
          >
            {loading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
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
                {isEditing ? "Updating..." : "Submitting..."}
              </span>
            ) : isEditing ? (
              "Update Requirement"
            ) : (
              "Post Requirement"
            )}
          </button>
        </div>

        {/* Required Fields Note */}
        <div className="mt-4 text-center text-sm text-gray-500">
          * Required fields
        </div>
      </div>
    );
  };

  if (isLoadingPost) {
    return (
      <StudentDashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading requirement data...</p>
          </div>
        </div>
      </StudentDashboardLayout>
    );
  }

  return (
    <StudentDashboardLayout>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">{renderLocationInput()}</div>
      </div>
    </StudentDashboardLayout>
  );
};

export default RequestTeacherPage;
