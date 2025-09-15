"use client";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FuturisticReveal from "../components/Moon";
import StatsSection from "../components/StatsSection";
import TeachingSection from "../components/TeachingSection";
import TestimonialSlider from "../components/TestimonialSlider";
import TrustedBy from "../components/TrustedBy";
import HeroSection from "../components/Hero";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndRedirect = () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("userData");

        if (!token || !storedUser) {
          setLoading(false);
          return;
        }

        const userData = JSON.parse(storedUser);

        // ✅ Redirect based on role + profileExists
        switch (userData.role) {
          case "admin":
            router.push("/dashboard");
            break;

          case "teacher":
            if (userData.profileExists) {
              router.push("/teachers/dashboard");
            } else {
              router.push("/teachers");
            }
            break;

          case "student":
            router.push("/students/dashboard");
            break;

          default:
            router.push("/");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
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
      <TeachingSection />
      <TrustedBy />
      <FuturisticReveal imageUrl={"/world.png"} />
      <StatsSection />
      <TestimonialSlider />
      <Footer />
    </main>
  );
}
