"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { FiSearch, FiMapPin, FiCrosshair, FiX } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { getSubjects } from "../api/subject.api"; // Import the subjects API

export default function HeroSection() {
  const [subject, setSubject] = useState("");
  const [location, setLocation] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [subjectSuggestions, setSubjectSuggestions] = useState([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [showSubjectSuggestions, setShowSubjectSuggestions] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const subjectInputRef = useRef(null);
  const router = useRouter();
  const GEOAPIFY_KEY = "216ee53519b343a5be36cba1a2fa6ed6";

  // Fetch subjects on component mount
  useEffect(() => {
    const fetchSubjects = async () => {
      setIsLoadingSubjects(true);
      try {
        const response = await getSubjects();
        console.log("subjects", response.data.data);
        if (response.data.success) {
          setSubjects(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
      } finally {
        setIsLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, []);

  // Filter subjects based on input across name, category, and level
  useEffect(() => {
    if (subject.length > 1) {
      const searchTerm = subject.toLowerCase();
      const filtered = subjects.filter(
        (subj) =>
          subj.name.toLowerCase().includes(searchTerm) ||
          subj.category.toLowerCase().includes(searchTerm) ||
          subj.level.toLowerCase().includes(searchTerm)
      );
      setSubjectSuggestions(filtered);
    } else {
      setSubjectSuggestions([]);
    }
  }, [subject, subjects]);

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
              // Use the formatted address from Geoapify
              setLocation(data.features[0].properties.formatted);
            }
            setIsGeolocating(false);
          } catch (error) {
            console.error("Error getting location:", error);
            setIsGeolocating(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setIsGeolocating(false);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
      setIsGeolocating(false);
    }
  };

  useEffect(() => {
    if (location.length > 1) {
      const timer = setTimeout(() => {
        fetchLocationSuggestions(location);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();

    // Validate inputs
    if (!subject.trim() && !location.trim()) {
      // If both are empty, redirect to all tutors page
      router.push("/tutors");
      return;
    }

    // Create query params object
    const queryParams = new URLSearchParams();

    if (subject.trim()) {
      queryParams.append("subject", subject.trim());
    }

    if (location.trim()) {
      queryParams.append("location", location.trim());
    }

    // Redirect to tutors page with query params
    router.push(`/tutors?${queryParams.toString()}`);
  };

  // Clear subject input
  const clearSubject = () => {
    setSubject("");
    setSubjectSuggestions([]);
    subjectInputRef.current?.focus();
  };

  return (
    <div className="relative w-full min-h-[80vh] md:min-h-[90vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero1.jpg"
          alt="Students learning"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center py-20 md:py-32">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Find the Perfect Tutor for You
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
            Connect with expert educators in any subject, anywhere, anytime.
          </p>
        </div>

        {/* Search Box */}
        <div className="py-4 px-4">
          <div className="bg-white/90 rounded-2xl shadow-2xl p-10 max-w-4xl mx-auto w-full border border-white/40">
            <form
              onSubmit={handleSearch}
              className="space-y-4 md:space-y-0 md:flex md:items-end md:space-x-4"
            >
              {/* Subject Input */}
              <div className="flex-1 relative">
                <label
                  htmlFor="subject"
                  className="block text-sm font-semibold text-gray-800 mb-1"
                >
                  What do you want to learn?
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    ref={subjectInputRef}
                    type="text"
                    id="subject"
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      setShowSubjectSuggestions(true);
                    }}
                    onFocus={() => setShowSubjectSuggestions(true)}
                    onBlur={() =>
                      setTimeout(() => setShowSubjectSuggestions(false), 200)
                    }
                    placeholder="e.g. Mathematics, Python, Guitar, IGCSE, A-Level"
                    className="block w-full pl-10 pr-10 py-3 bg-white text-black border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-500 sm:text-sm"
                    autoComplete="off"
                  />
                  {subject && (
                    <button
                      type="button"
                      onClick={clearSubject}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <FiX className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                  {showSubjectSuggestions && subjectSuggestions.length > 0 && (
                    <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {subjectSuggestions.map((suggestion) => (
                        <li
                          key={suggestion._id}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-gray-800 border-b border-gray-100 last:border-b-0"
                          onClick={() => {
                            setSubject(suggestion.name);
                            setShowSubjectSuggestions(false);
                          }}
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
              </div>

              {/* Location Input */}
              <div className="flex-1 relative">
                <div className="flex justify-between items-center mb-1">
                  <label
                    htmlFor="location"
                    className="block text-sm font-semibold text-gray-800"
                  >
                    Where?
                  </label>
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="text-xs flex items-center text-blue-700 hover:underline"
                    disabled={isGeolocating}
                  >
                    <FiCrosshair className="mr-1 h-3 w-3" />
                    {isGeolocating ? "Detecting..." : "Use my location"}
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMapPin className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    id="location"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      setShowLocationSuggestions(true);
                    }}
                    onFocus={() => setShowLocationSuggestions(true)}
                    onBlur={() =>
                      setTimeout(() => setShowLocationSuggestions(false), 200)
                    }
                    placeholder="City or Postal Code"
                    className="block w-full pl-10 pr-3 py-3 bg-white text-black border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-500 sm:text-sm"
                    autoComplete="off"
                  />
                  {showLocationSuggestions &&
                    locationSuggestions.length > 0 && (
                      <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {locationSuggestions.map((suggestion) => (
                          <li
                            key={suggestion.properties.place_id}
                            className="px-4 py-2 hover:bg-blue-100 cursor-pointer text-gray-800"
                            onClick={() => {
                              setLocation(suggestion.properties.formatted);
                              setShowLocationSuggestions(false);
                            }}
                          >
                            {suggestion.properties.formatted}
                          </li>
                        ))}
                      </ul>
                    )}
                </div>
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Find Tutors
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
