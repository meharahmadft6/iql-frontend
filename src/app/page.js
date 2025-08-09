"use client";
import Footer from "@/components/Footer";
import FuturisticReveal from "@/components/Moon";
import StatsSection from "@/components/StatsSection";
import TeachingSection from "@/components/TeachingSection";
import TestimonialSlider from "@/components/TestimonialSlider";
import TrustedBy from "@/components/TrustedBy";
import HeroSection from "../components/Hero";
import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../api/user.api";
import LoadingSpinner from "../components/LoadingSp

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setLoading(false);
          return;
        }

        // Verify token and get user data
        const response = await getCurrentUser();
        const userData = response?.data?.data;

        if (userData) {
          // Redirect based on role
          if (userData.role === "admin") {
            router.push("/dashboard");
          } else if (userData.role === "teacher") {
            router.push("/teacher-dashboard");
          } else if (userData.role === "student") {
            router.push("/student-dashboard");
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        // Clear invalid token
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <main>
      <Navbar />
      <HeroSection />
      <TeachingSection/>
      <TrustedBy />
      <FuturisticReveal imageUrl={"/world.png"}/>
      <StatsSection />
      <TestimonialSlider />
      <Footer />
    </main>
  );
}
