"use client";
import { useState, useEffect, useRef } from "react";
import { createPostRequirement } from "../../api/postRequirement.api";
import Swal from "sweetalert2";
import Navbar from "../../components/NavbarProfile";
import Footer from "../../components/Footer";
import { useRouter } from "next/navigation";
import { getSubjects } from "../../api/subject.api"; // Import the subjects API

const RequestTeacherPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
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
  const [subjectSuggestions, setSubjectSuggestions] = useState([]);
  const [showSubjectSuggestions, setShowSubjectSuggestions] = useState([]);
  const [subjectsData, setSubjectsData] = useState([]);

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    location: "",
    country: "", // Added to store country name
    phone: {
      countryCode: "+92",
      number: "",
    },
    description: "",
    subjects: [{ name: "", level: "" }],
    serviceType: "",
    meetingOptions: [],
    budget: {
      currency: "PKR", // Default currency
      amount: "",
      frequency: "",
    },
    employmentType: "",
    languages: [""],
    image: null,
  });

  // Function to fetch currency based on country name
  const fetchCurrencyByCountry = async (countryName) => {
    try {
      // First try to use our static mapping for better performance
      const staticMapping = {
        pakistan: "PKR",
        "united states": "USD",
        "united kingdom": "GBP",
        canada: "CAD",
        australia: "AUD",
        india: "INR",
        germany: "EUR",
        france: "EUR",
        spain: "EUR",
        italy: "EUR",
        netherlands: "EUR",
        japan: "JPY",
        china: "CNY",
        uae: "AED",
        "saudi arabia": "SAR",
      };

      const lowerCaseCountry = countryName.toLowerCase();
      if (staticMapping[lowerCaseCountry]) {
        return staticMapping[lowerCaseCountry];
      }

      // Fallback to API if not found in static mapping
      const response = await fetch(
        `https://restcountries.com/v3.1/name/${countryName}`
      );
      const data = await response.json();

      if (data && data[0] && data[0].currencies) {
        const currencyCode = Object.keys(data[0].currencies)[0];
        return currencyCode;
      }
    } catch (error) {
      console.error("Error fetching currency:", error);
    }

    return "USD"; // Default fallback
  };
  const GEOAPIFY_KEY = "216ee53519b343a5be36cba1a2fa6ed6";

  const levelOptions = [
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
    "Diploma",
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
  const languageRefs = useRef([]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close location dropdown
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setShowLocationDropdown(false);
      }

      // Close country code dropdown
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
        // Show error toast
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load country data. Please refresh the page.",
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
        // Fallback languages
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
      // Show error toast
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch location suggestions. Please try again.",
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
              // Show success toast
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
            // Show error toast
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Failed to get your location. Please enter it manually.",
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
          // Show error toast
          Swal.fire({
            icon: "error",
            title: "Location Access Denied",
            text: "Please allow location access or enter your location manually.",
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

  const [accessDenied, setAccessDenied] = useState(false);

  // Update the useEffect for checking login status
  useEffect(() => {
    // Check if user is logged in
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const user =
      typeof window !== "undefined" ? localStorage.getItem("userData") : null;

    if (token && user) {
      const userData = JSON.parse(user);

      // Check if user role is "user"
      if (userData.role !== "student") {
        setAccessDenied(true);
        Swal.fire({
          icon: "error",
          title: "Access Denied",
          text: "Only users can access this page. Please login with a user account.",
          confirmButtonText: "OK",
          confirmButtonColor: "#dc2626",
        }).then(() => {
          // Redirect to login or home page
          window.location.href = "/login"; // or wherever you want to redirect
        });
        return;
      }

      setIsLoggedIn(true);
      setUserData(userData);
      setCurrentStep(2); // Start from step 2 (renderStep2) instead of 1
    }
  }, []);
  // Validation functions
  const validateStep = (step) => {
    const newErrors = {};

    if (!isLoggedIn && step === 1) {
      if (!formData.email.trim()) newErrors.email = "Email is required";
      if (!formData.name.trim()) newErrors.name = "Name is required";
      if (!formData.password.trim())
        newErrors.password = "Password is required";
      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Please enter a valid email";
      }
    }

    // For logged in users, step 2 is contact info (location/phone)
    if (isLoggedIn && step === 2) {
      if (!formData.location.trim())
        newErrors.location = "Location is required";
      if (!formData.phone.number.trim())
        newErrors.phoneNumber = "Phone number is required";
    }

    // For non-logged in users, step 2 is contact info
    if (!isLoggedIn && step === 2) {
      if (!formData.location.trim())
        newErrors.location = "Location is required";
      if (!formData.phone.number.trim())
        newErrors.phoneNumber = "Phone number is required";
    }

    // Service details step - step 3 for logged in, step 3 for non-logged in
    if ((isLoggedIn && step === 3) || (!isLoggedIn && step === 3)) {
      if (!formData.serviceType)
        newErrors.serviceType = "Service type is required";
      if (!formData.employmentType)
        newErrors.employmentType = "Employment type is required";
      if (formData.meetingOptions.length === 0)
        newErrors.meetingOptions = "At least one meeting option is required";
    }

    // Subjects & budget step
    if ((isLoggedIn && step === 4) || (!isLoggedIn && step === 4)) {
      if (formData.subjects.some((s) => !s.name.trim() || !s.level)) {
        newErrors.subjects = "All subjects must have name and level";
      }
      if (!formData.budget.amount || formData.budget.amount <= 0) {
        newErrors.budgetAmount = "Valid budget amount is required";
      }
      if (!formData.budget.frequency)
        newErrors.budgetFrequency = "Budget frequency is required";
    }

    // Final details step
    if ((isLoggedIn && step === 5) || (!isLoggedIn && step === 5)) {
      if (!formData.description.trim())
        newErrors.description = "Description is required";
      if (formData.languages.some((l) => !l.trim())) {
        newErrors.languages = "All language fields must be filled";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Clear error when user starts typing
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

  const handleLocationSelect = async (suggestion) => {
    const country = suggestion.properties.country;

    // Get currency based on country
    const currency = await fetchCurrencyByCountry(country);

    setFormData((prev) => ({
      ...prev,
      location: suggestion.properties.formatted,
      country: country,
      budget: {
        ...prev.budget,
        currency: currency,
      },
    }));

    setShowLocationDropdown(false);
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

  // Make sure your handleFileChange function looks like this:
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type and size
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        // 5MB limit
        alert("Image size should be less than 5MB");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  // Clean data before submission
  const cleanFormData = () => {
    const cleanedData = {
      ...formData,
      // Remove empty subjects
      subjects: formData.subjects.filter((s) => s.name.trim() && s.level),
      // Remove empty languages
      languages: formData.languages.filter((l) => l.trim()),
      // Ensure description is not empty
      description: formData.description.trim(),
      // Convert budget amount to number
      budget: {
        ...formData.budget,
        amount: Number(formData.budget.amount),
      },
    };

    // Remove user registration fields if logged in
    if (isLoggedIn) {
      delete cleanedData.email;
      delete cleanedData.name;
      delete cleanedData.password;
      // Keep location and phone for logged in users as they still need to provide it
    }

    return cleanedData;
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      const cleanedData = cleanFormData();
      const submitData = new FormData();

      // Don't send userId if not logged in - let backend handle account creation
      if (isLoggedIn && userData) {
        submitData.append("userId", userData.id);
      }

      // Add cleaned data properly
      Object.keys(cleanedData).forEach((key) => {
        if (key === "phone" || key === "budget") {
          // Send as actual object, not JSON string
          Object.keys(cleanedData[key]).forEach((subKey) => {
            submitData.append(`${key}.${subKey}`, cleanedData[key][subKey]);
          });
        } else if (key === "subjects") {
          // Send subjects as separate entries
          cleanedData[key].forEach((subject, index) => {
            submitData.append(`subjects[${index}][name]`, subject.name);
            submitData.append(`subjects[${index}][level]`, subject.level);
          });
        } else if (key === "meetingOptions") {
          // Send meeting options as separate entries
          cleanedData[key].forEach((option, index) => {
            submitData.append(`meetingOptions[${index}]`, option);
          });
        } else if (key === "languages") {
          // Send languages as separate entries
          cleanedData[key].forEach((language, index) => {
            submitData.append(`languages[${index}]`, language);
          });
        } else if (key === "image" && cleanedData[key]) {
          // Handle image file - append the file object directly
          submitData.append("image", cleanedData[key]);
        } else if (key !== "image") {
          submitData.append(key, cleanedData[key]);
        }
      });

      // Log FormData contents for debugging
      for (let [key, value] of submitData.entries()) {
        console.log(key, value);
      }

      const response = await createPostRequirement(submitData);
      console.log("API Response:", response); // Debug log

      // Check if response is successful - Axios puts data in response.data
      if (response.data?.success) {
        const responseData = response.data;

        // Check if response contains token (new user was created)
        if (responseData.token) {
          // New user was created - save token and user data to localStorage
          localStorage.setItem("token", responseData.token);

          const userDataToStore = {
            id: responseData.user.id,
            name: responseData.user.name,
            email: responseData.user.email,
            role: responseData.user.role,
            isVerified: responseData.user.isVerified,
          };

          localStorage.setItem("userData", JSON.stringify(userDataToStore));

          // If you're using an auth context, you might need to update it here
          // For example, if you're using React Context:
          // authContext.setAuthState({
          //   isAuthenticated: true,
          //   user: userDataToStore,
          //   token: responseData.token
          // });
        }

        Swal.fire({
          icon: "success",
          title: "Request Submitted!",
          text:
            responseData.message ||
            (isLoggedIn
              ? "Your requirement has been posted successfully."
              : "Account created and requirement submitted. Please check your email for verification."),
          confirmButtonText: "OK",
          confirmButtonColor: "#2563eb",
        });

        router.push("/students/dashboard");
      } else {
        throw new Error(response.data?.message || "Submission failed");
      }
    } catch (error) {
      console.error("Error submitting request:", error);

      let errorMessage = "Error submitting request. Please try again.";

      // Extract error message from backend response if available
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.message) {
        errorMessage = error.response.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Error notification with SweetAlert2
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
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Create Your Account
        </h2>
        <p className="text-gray-600">Please provide your basic information</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter your full name"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password *
          </label>
          <input
            type="password"
            name="password"
            min={6}
            value={formData.password}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.password ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Create a password"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => {
    const filteredCountries = countries.filter(
      (country) =>
        country.name.toLowerCase().includes(countryFilter.toLowerCase()) ||
        country.code.includes(countryFilter)
    );

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Contact Information
          </h2>
          <p className="text-gray-600">
            We need your location and phone number
          </p>
        </div>

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
              >
                {isGeolocating ? "..." : "📍"}
              </button>
            </div>

            {/* Location Suggestions Dropdown */}
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
                        <span className="flex-1 truncate">{country.name}</span>
                        <span className="text-gray-500">{country.code}</span>
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
              <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Service Details
        </h2>
        <p className="text-gray-600">
          What kind of teaching service do you need?
        </p>
      </div>

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
            <p className="text-red-500 text-sm mt-1">{errors.serviceType}</p>
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
            <p className="text-red-500 text-sm mt-1">{errors.employmentType}</p>
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
            <p className="text-red-500 text-sm mt-1">{errors.meetingOptions}</p>
          )}
        </div>
      </div>
    </div>
  );

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
        subj.category.toLowerCase().includes(query.toLowerCase()) ||
        subj.level.toLowerCase().includes(query.toLowerCase())
    );

    const newSuggestions = [...subjectSuggestions];
    newSuggestions[index] = filtered;
    setSubjectSuggestions(newSuggestions);
  };

  // Handle subject input change with debouncing
  const handleSubjectInputChange = (index, value) => {
    // Update the form data
    handleArrayChange(index, "name", value, "subjects");

    // Filter suggestions with debounce
    const timer = setTimeout(() => {
      filterSubjectSuggestions(index, value);
    }, 300);

    return () => clearTimeout(timer);
  };

  // Select a subject from suggestions
  const selectSubject = (index, subject) => {
    handleArrayChange(index, "name", subject.name, "subjects");
    handleArrayChange(index, "level", subject.level, "subjects");

    // Hide suggestions for this input
    const newShowSuggestions = [...showSubjectSuggestions];
    newShowSuggestions[index] = false;
    setShowSubjectSuggestions(newShowSuggestions);
  };

  // Initialize arrays when adding new subjects
  const addSubjectWithSuggestions = () => {
    addArrayItem("subjects", { name: "", level: "" });
    // Initialize the suggestions arrays for the new input
    setSubjectSuggestions([...subjectSuggestions, []]);
    setShowSubjectSuggestions([...showSubjectSuggestions, false]);
  };

  // Then update your renderStep4 function to use these states and functions
  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Subjects & Budget
        </h2>
        <p className="text-gray-600">
          Tell us what subjects you need help with
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subjects *
          </label>
          {formData.subjects.map((subject, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 mb-4 relative"
            >
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Subject name (e.g., Mathematics)"
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
                      const newShowSuggestions = [...showSubjectSuggestions];
                      newShowSuggestions[index] = false;
                      setShowSubjectSuggestions(newShowSuggestions);
                    }, 200);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoComplete="off"
                />
                {showSubjectSuggestions[index] &&
                  subjectSuggestions[index] &&
                  subjectSuggestions[index].length > 0 && (
                    <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {subjectSuggestions[index].map((suggestion) => (
                        <li
                          key={suggestion._id}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-gray-800 border-b border-gray-100 last:border-b-0"
                          onMouseDown={() => selectSubject(index, suggestion)}
                        >
                          <div className="font-medium">{suggestion.name}</div>
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

              <select
                value={subject.level}
                onChange={(e) =>
                  handleArrayChange(index, "level", e.target.value, "subjects")
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
            onClick={addSubjectWithSuggestions}
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
                  errors.budgetAmount ? "border-red-500" : "border-gray-300"
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
                  errors.budgetFrequency ? "border-red-500" : "border-gray-300"
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
  );

  const renderStep5 = () => {
    // Function to validate description for contact information
    const validateDescription = (text) => {
      const contactPatterns = {
        email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        phone: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
        url: /https?:\/\/[^\s]+|www\.[^\s]+/gi,
        socialMedia:
          /(facebook\.com|twitter\.com|instagram\.com|linkedin\.com|tiktok\.com|snapchat\.com)[^\s]*/gi,
      };

      const errors = [];

      for (const [type, pattern] of Object.entries(contactPatterns)) {
        const matches = text.match(pattern);
        if (matches && matches.length > 0) {
          errors.push(`${type} information detected`);
        }
      }

      return errors;
    };

    const handleDescriptionChange = (e) => {
      const { value } = e.target;

      // Check for contact information
      const contactErrors = validateDescription(value);

      if (contactErrors.length > 0) {
        setErrors((prev) => ({
          ...prev,
          description: `Please remove contact information: ${contactErrors.join(
            ", "
          )}`,
        }));
      } else {
        // Clear description error if it was a contact info error
        if (
          errors.description &&
          errors.description.includes("contact information")
        ) {
          setErrors((prev) => ({ ...prev, description: undefined }));
        }
      }

      // Update the form data
      handleInputChange(e);
    };

    const handleDescriptionBlur = (e) => {
      const { value } = e.target;
      const contactErrors = validateDescription(value);

      if (contactErrors.length > 0 && !errors.description) {
        setErrors((prev) => ({
          ...prev,
          description: `Please remove contact information: ${contactErrors.join(
            ", "
          )}`,
        }));
      }
    };

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Additional Details
          </h2>
          <p className="text-gray-600">Final details about your requirements</p>
          <div className="mt-2 text-sm text-amber-600 bg-amber-50 p-2 rounded-lg">
            ⚠️ Please do not include any contact information (email, phone
            numbers, links, social media) in the description
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleDescriptionChange}
              onBlur={handleDescriptionBlur}
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Describe your learning needs, goals, preferred teaching style, and any specific requirements. Please do not include contact information like email, phone numbers, or website links."
              maxLength={500}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1 flex items-start">
                <svg
                  className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
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
                    handleArrayChange(index, "", e.target.value, "languages")
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
              <p className="text-red-500 text-sm mt-1">{errors.languages}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Image (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="text-sm text-gray-500 mt-1">
              Upload a profile picture to help tutors recognize you
            </div>
          </div>

          {/* Form Summary */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">
              Review Your Request
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Service:</span>{" "}
                {formData.serviceType}
              </div>
              <div>
                <span className="font-medium">Employment:</span>{" "}
                {formData.employmentType}
              </div>
              <div>
                <span className="font-medium">Budget:</span>{" "}
                {formData.budget.currency} {formData.budget.amount}{" "}
                {formData.budget.frequency}
              </div>
              <div>
                <span className="font-medium">Meeting:</span>{" "}
                {formData.meetingOptions.join(", ")}
              </div>
              <div className="md:col-span-2">
                <span className="font-medium">Subjects:</span>{" "}
                {formData.subjects
                  .filter((s) => s.name)
                  .map((s) => `${s.name} (${s.level})`)
                  .join(", ")}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const totalSteps = isLoggedIn ? 5 : 5;
  if (accessDenied) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-red-600 text-6xl mb-4">🚫</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Access Denied
              </h2>
              <p className="text-gray-600">
                You don't have permission to access this page.
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round((currentStep / totalSteps) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            {!isLoggedIn && currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <button
                  onClick={prevStep}
                  className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ← Previous
                </button>
              )}

              {currentStep < totalSteps ? (
                <button
                  onClick={nextStep}
                  className="ml-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next Step →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="ml-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                      Submitting...
                    </span>
                  ) : (
                    "Submit Request"
                  )}
                </button>
              )}
            </div>
            {/* Required Fields Note */}
            <div className="mt-4 text-center text-sm text-gray-500">
              * Required fields
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Need help? Contact our support team at support@example.com
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default RequestTeacherPage;
