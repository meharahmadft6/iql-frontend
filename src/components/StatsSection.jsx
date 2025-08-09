"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const StatsSection = () => {
  const [counted, setCounted] = useState(false);
  const stats = [
    { number: 500, suffix: "+", label: "Carefully Curated Courses" },
    { number: 120, suffix: "+", label: "Areas of Specialization" },
    { number: 25, suffix: "+", label: "Languages Supported" },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setCounted(true);
        }
      },
      { threshold: 0.5 }
    );

    const element = document.getElementById("stats-section");
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  return (
    <section id="stats-section" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 text-center mb-12">
          <span className="text-indigo-600">Top-Quality</span> Educators
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="text-center p-6 rounded-xl bg-gray-50 hover:bg-indigo-50 transition-colors duration-300"
            >
              <div className="text-4xl md:text-5xl font-bold text-indigo-600 mb-2">
                {counted ? (
                  <CountUp end={stat.number} suffix={stat.suffix} duration={2} delay={index * 0.3} />
                ) : (
                  <span>0{stat.suffix}</span>
                )}
              </div>
              <p className="text-lg text-gray-600">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CountUp = ({ end, suffix, duration, delay }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration * 60); // 60fps

    const timer = setTimeout(() => {
      const counter = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(counter);
        } else {
          setCount(Math.ceil(start));
        }
      }, 1000 / 60); // 60fps

      return () => clearInterval(counter);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [end, duration, delay]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
};

export default StatsSection;