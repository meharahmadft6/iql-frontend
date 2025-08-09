import Footer from "@/components/Footer";
import HeroSection from "@/components/Hero";
import FuturisticReveal from "@/components/Moon";
import Navbar from "@/components/Navbar";
import StatsSection from "@/components/StatsSection";
import TeachingSection from "@/components/TeachingSection";
import TestimonialSlider from "@/components/TestimonialSlider";
import TrustedBy from "@/components/TrustedBy";

export default function Home() {
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
