"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TestimonialSlider = () => {
  const testimonials = [
    {
      quote: "Inimbyloucient helped me boost my Math grade from C to an A in just 3 months. My tutor was patient and explained concepts in a way I finally understood!",
      name: "Sarah Khan",
      program: "IGCSE Student",
      bgColor: "bg-indigo-50"
    },
    {
      quote: "I struggled with HL Physics until I joined Inimbyloucient. The tutoring sessions were focused, flexible, and incredibly effective. Highly recommended!",
      name: "James Morgan",
      program: "IB Diploma",
      bgColor: "bg-blue-50"
    },
    {
      quote: "The one-on-one mentorship really helped me improve my writing and grammar; I scored an A in English. Thanks to the constant support and feedback.",
      name: "Ayesha Malik",
      program: "O Level English",
      bgColor: "bg-purple-50"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const goToSlide = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0
    })
  };

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-800">
          What Our Students Have To Say
        </h2>
        <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Hear from students who transformed their academic journey with us
        </p>

        <div className="relative h-96 md:h-80 max-w-4xl mx-auto overflow-hidden">
          <AnimatePresence custom={direction} initial={false}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5 }}
              className={`absolute inset-0 p-8 md:p-10 rounded-2xl shadow-lg ${testimonials[currentIndex].bgColor} flex flex-col justify-center`}
            >
              <div className="text-2xl md:text-3xl leading-relaxed text-gray-800 mb-6">
                "{testimonials[currentIndex].quote}"
              </div>
              <div className="mt-auto">
                <p className="text-xl font-bold text-gray-900">{testimonials[currentIndex].name}</p>
                <p className="text-lg text-indigo-600">{testimonials[currentIndex].program}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-center mt-8 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full ${currentIndex === index ? 'bg-indigo-600' : 'bg-gray-300'}`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        <div className="flex justify-center mt-8 space-x-4">
          <button 
            onClick={() => {
              setDirection(-1);
              setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
            }}
            className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition"
            aria-label="Previous testimonial"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={() => {
              setDirection(1);
              setCurrentIndex((prev) => (prev + 1) % testimonials.length);
            }}
            className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition"
            aria-label="Next testimonial"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSlider;