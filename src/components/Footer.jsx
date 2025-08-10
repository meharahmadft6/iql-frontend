import Link from "next/link";
import Image from "next/image";
import {
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";

const Footer = () => {
  const socialLinks = [
    {
      name: "Facebook",
      icon: <FaFacebook className="text-xl" />,
      url: "https://facebook.com",
    },
    {
      name: "Twitter",
      icon: <FaTwitter className="text-xl" />,
      url: "https://twitter.com",
    },
    {
      name: "LinkedIn",
      icon: <FaLinkedin className="text-xl" />,
      url: "https://linkedin.com",
    },
    {
      name: "Instagram",
      icon: <FaInstagram className="text-xl" />,
      url: "https://instagram.com",
    },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-gray-50 via-white to-blue-50 text-gray-900 pt-20 pb-8 overflow-hidden">
      {/* Futuristic background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-cyan-300 to-blue-400 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-300 to-purple-400 rounded-full blur-2xl"></div>
      </div>

      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
          `,
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      <div className="relative container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Logo and description */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center group">
              <div className="relative">
                <div className="absolute inset-0  rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-white p-3 rounded-xl border border-gray-200 shadow-lg">
                  <Image
                    src="/infinity.jpg"
                    alt="Logo"
                    width={120}
                    height={60}
                    className="h-12 w-auto"
                  />
                </div>
              </div>
            </Link>
            <p className="text-gray-600 text-lg leading-relaxed">
              Empowering students and educators through innovative learning
              solutions in the digital age.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative group"
                  aria-label={social.name}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 scale-110"></div>
                  <div className="relative bg-white p-3 rounded-full border border-gray-200 shadow-md group-hover:shadow-lg group-hover:border-transparent transition-all duration-300 text-gray-700 group-hover:text-blue-600">
                    {social.icon}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-black bg-clip-text ">
              Quick Links
            </h3>
            <div className="space-y-4">
              {[
                { name: "Home", href: "/" },
                { name: "Our Story", href: "/ourstory" },
                { name: "Research", href: "/research" },
                { name: "Contact Us", href: "/contactus" },
              ].map((link) => (
                <div key={link.name} className="group">
                  <Link
                    href={link.href}
                    className="relative text-gray-700 hover:text-blue-600 transition-all duration-300 text-lg font-medium flex items-center"
                  >
                    <span className="absolute left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 group-hover:w-6 transition-all duration-300"></span>
                    <span className="group-hover:ml-8 transition-all duration-300">
                      {link.name}
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Tutor Resources */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-black to-pink-600 bg-clip-text text-transparent">
              Tutor Resources
            </h3>
            <div className="space-y-4">
              {[
                { name: "Find Tutors", href: "/tutors" },
                { name: "Become a Tutor", href: "/become-tutor" },
                { name: "Tutor Resources", href: "/tutor-resources" },
                { name: "Teaching Jobs", href: "/teaching-jobs" },
              ].map((link) => (
                <div key={link.name} className="group">
                  <Link
                    href={link.href}
                    className="relative text-gray-700 hover:text-purple-600 transition-all duration-300 text-lg font-medium flex items-center"
                  >
                    <span className="absolute left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-600 group-hover:w-6 transition-all duration-300"></span>
                    <span className="group-hover:ml-8 transition-all duration-300">
                      {link.name}
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-black to-blue-600 bg-clip-text text-transparent">
              Contact Us
            </h3>
            <address className="not-italic text-gray-700 space-y-4">
              <div className="flex items-start space-x-4 group">
                <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-2 rounded-lg text-white mt-1">
                  <FaMapMarkerAlt />
                </div>
                <p className="text-lg leading-relaxed group-hover:text-blue-600 transition-colors duration-300">
                  123 Education Street, Boston, MA 02115
                </p>
              </div>
              <div className="flex items-center space-x-4 group">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg text-white">
                  <FaEnvelope />
                </div>
                <Link
                  href="mailto:info@example.com"
                  className="text-lg hover:text-blue-600 transition-colors duration-300"
                >
                  info@example.com
                </Link>
              </div>
              <div className="flex items-center space-x-4 group">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg text-white">
                  <FaPhone />
                </div>
                <Link
                  href="tel:+92302420543"
                  className="text-lg hover:text-purple-600 transition-colors duration-300"
                >
                  +92 302 4200543
                </Link>
              </div>
            </address>
          </div>
        </div>

        {/* Futuristic divider */}
        <div className="relative my-12">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>
          <div className="relative flex justify-center">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-16 h-1 rounded-full"></div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-lg opacity-20 rounded-lg"></div>
            <p className="relative text-gray-600 text-lg font-medium bg-white px-6 py-3 rounded-lg border border-gray-200 shadow-sm">
              © {new Date().getFullYear()} Infinity Quotient Learning. All
              rights reserved.
            </p>
          </div>
          <div className="flex space-x-8">
            {[
              { name: "Privacy Policy", href: "/privacy" },
              { name: "Terms of Service", href: "/terms" },
              { name: "Cookie Policy", href: "/cookies" },
            ].map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="relative text-gray-600 hover:text-blue-600 font-medium transition-all duration-300 group"
              >
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
