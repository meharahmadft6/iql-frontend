import React from 'react';
import Link from 'next/link';

const TeachingSection = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-indigo-100 to-purple-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Teaching <span className="text-indigo-600">Opportunities</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the perfect teaching path that matches your skills and preferences
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Teachers Column */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-75 group-hover:opacity-100 blur transition duration-500"></div>
            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden h-full">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
                <div className="flex items-center">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="ml-4 text-2xl font-bold text-white">Find Teachers</h3>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  {[
                    { title: "Teachers", href: "#", icon: "👩‍🏫" },
                    { title: "Home Teachers", href: "#", icon: "🏠" },
                    { title: "Online Teachers", href: "#", icon: "💻" },
                    { title: "Assignment Help", href: "#", icon: "✍️" },
                  ].map((item, index) => (
                    <li key={index}>
                      <Link href={item.href} className="flex items-center p-4 rounded-xl hover:bg-indigo-50 transition-all duration-300 group-hover:shadow-sm">
                        <span className="text-2xl mr-4">{item.icon}</span>
                        <span className="text-lg font-medium text-gray-700 group-hover:text-indigo-600">{item.title}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="ml-auto h-5 w-5 text-gray-400 group-hover:text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          {/* Teaching Jobs Column */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl opacity-75 group-hover:opacity-100 blur transition duration-500"></div>
            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden h-full">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-6">
                <div className="flex items-center">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="ml-4 text-2xl font-bold text-white">Teaching Jobs</h3>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  {[
                    { title: "Teaching Jobs", href: "#", icon: "💼" },
                    { title: "Home Teaching", href: "#", icon: "👨‍👩‍👧‍👦" },
                    { title: "Online Teaching", href: "#", icon: "🌐" },
                    { title: "Assignment Jobs", href: "#", icon: "📝" },
                  ].map((item, index) => (
                    <li key={index}>
                      <Link href={item.href} className="flex items-center p-4 rounded-xl hover:bg-blue-50 transition-all duration-300 group-hover:shadow-sm">
                        <span className="text-2xl mr-4">{item.icon}</span>
                        <span className="text-lg font-medium text-gray-700 group-hover:text-blue-600">{item.title}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="ml-auto h-5 w-5 text-gray-400 group-hover:text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeachingSection;