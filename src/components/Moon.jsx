"use client";
import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

const FuturisticReveal = ({ imageUrl, altText = "Featured image" }) => {
  const containerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  const paragraphs = [
    {
      text: "Infinity Quotient Learning is your smart education partner - a digital co-mentor for accelerated growth. We monitor your learning journey, anticipate knowledge gaps, and recommend your optimal path forward. Our system empowers minds by transforming how knowledge is acquired and applied.",
      className: "text-lg md:text-3xl font-bold text-white",
    },
    {
      text: "No more juggling between learning platforms, hunting for key concepts, or waiting for progress reports. Everything updates in real-time - right on your dashboard. You can adjust your learning strategy on the go without losing momentum.",
      className: "text-base md:text-2xl text-white",
    },
    {
      text: "With our unified learning hub, you can track, manage, and accelerate your educational progress from one intuitive interface. Gain complete visibility into what drives your learning success and intellectual growth.",
      className: "text-base md:text-2xl text-white",
    },
    {
      text: "With our unified learning hub, you can track, manage, and accelerate your educational progress from one intuitive interface. Gain complete visibility into what drives your learning success and intellectual growth.",
      className: "text-base md:text-2xl text-white",
    },
    {
      text: "While others promise, THE Infinity Quotient Learning delivers.",
      className: "text-xl md:text-3xl font-bold text-white",
    },
  ];

  // Create refs for each paragraph
  const paragraphRefs = paragraphs.map(() => useRef(null));

  // Create scroll progress and animations for each paragraph
  const paragraphAnimations = paragraphRefs.map((ref) => {
    const { scrollYProgress } = useScroll({
      target: ref,
      offset: ["start end", "center start"]
    });
    
    return {
      opacity: useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 1]),
      y: useTransform(scrollYProgress, [0, 0.5], [30, 0])
    };
  });

  useEffect(() => {
    setIsReady(true);
    return () => setIsReady(false);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Optimized full-screen image */}
      <div className="w-full h-[60vh] md:h-screen relative">
        <Image
          src={imageUrl}
          alt={altText}
          fill
          priority
          quality={90}
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 100vw"
        />
      </div>

      {/* Animated text section */}
      <div className="bg-black w-full py-16 px-4 sm:px-6 md:py-24">
        <div className="max-w-3xl mx-auto space-y-10 md:space-y-14">
          {paragraphs.map((paragraph, index) => (
            <motion.div
              key={index}
              ref={paragraphRefs[index]}
              initial={{ opacity: 0, y: 30 }}
              animate={isReady ? {} : { opacity: 1, y: 0 }}
              style={isReady ? paragraphAnimations[index] : {}}
              className={`${paragraph.className} leading-relaxed md:leading-normal`}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {paragraph.text}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FuturisticReveal;