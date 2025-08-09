import React from 'react';
import Image from 'next/image';

const TrustedBySection = () => {
  const partners = [
    { name: "iAcademy", logo: "/iAcademy.png" },
    { name: "Scholar University", logo: "/Scholar.png" },
    { name: "TeachHub University of Belgior", logo: "/TechHub.png" },
    { name: "Educator", logo: "/Educator.png" },
    { name: "Study Central University", logo: "/studyCentral.png" },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 text-center mb-12">
          <span className="text-indigo-600">Trusted</span> By
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-10">
          {partners.map((partner, index) => (
            <div 
              key={index}
              className="flex items-center justify-center p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-indigo-100"
            >
              <div className="relative w-full h-20"> {/* Increased container size */}
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  fill // This makes the image fill the container
                  sizes="(max-width: 768px) 100px, 160px" // Responsive sizing
                  className="object-contain object-center" // Perfectly centered
                  quality={100} // Higher quality for logos
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedBySection;