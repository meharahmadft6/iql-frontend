"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { FiSearch, FiMapPin, FiCrosshair } from "react-icons/fi";

export default function HeroSection() {
  const [subject, setSubject] = useState("");
  const [location, setLocation] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);

  const MAPBOX_TOKEN =
    "pk.eyJ1IjoiYWhtYWRmdDYiLCJhIjoiY21lYjY5MG9rMDZoaTJrc2M4NWtlc2EwbCJ9.J0DPetrkzXi_nyroAEayzQ";

  // Fetch location suggestions from Mapbox Places API
  const fetchLocationSuggestions = async (query) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&limit=5&types=place,locality,region,country`
      );
      const data = await response.json();
      setLocationSuggestions(data.features || []);
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
    }
  };

  // Get user's current location via browser & Mapbox reverse geocoding
  const getCurrentLocation = () => {
    setIsGeolocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}&limit=1`
            );
            const data = await response.json();
            if (data.features && data.features.length > 0) {
              setLocation(data.features[0].place_name);
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
    if (location.length > 2) {
      const timer = setTimeout(() => {
        fetchLocationSuggestions(location);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log({ subject, location });
    // Your search logic here
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
              <div className="flex-1">
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
                    type="text"
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Mathematics, Python, Guitar"
                    className="block w-full pl-10 pr-3 py-3 bg-white text-black border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-500 sm:text-sm"
                  />
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
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() =>
                      setTimeout(() => setShowSuggestions(false), 200)
                    }
                    placeholder="City or Postal Code"
                    className="block w-full pl-10 pr-3 py-3 bg-white text-black border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-500 sm:text-sm"
                  />
                  {showSuggestions && locationSuggestions.length > 0 && (
                    <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {locationSuggestions.map((suggestion) => (
                        <li
                          key={suggestion.id}
                          className="px-4 py-2 hover:bg-blue-100 cursor-pointer text-gray-800"
                          onClick={() => {
                            setLocation(suggestion.place_name);
                            setShowSuggestions(false);
                          }}
                        >
                          {suggestion.place_name}
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
