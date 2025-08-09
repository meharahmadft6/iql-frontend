import Link from "next/link";
import Image from "next/image";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

const Footer = () => {
  const socialLinks = [
    { 
      name: "Facebook", 
      icon: <FaFacebook className="text-xl" />,
      url: "https://facebook.com" 
    },
    { 
      name: "Twitter", 
      icon: <FaTwitter className="text-xl" />,
      url: "https://twitter.com" 
    },
    { 
      name: "LinkedIn", 
      icon: <FaLinkedin className="text-xl" />,
      url: "https://linkedin.com" 
    },
    { 
      name: "Instagram", 
      icon: <FaInstagram className="text-xl" />,
      url: "https://instagram.com" 
    }
  ];

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Logo and description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              <Image 
                src="/infinity.jpg" 
                alt="Logo" 
                width={120} 
                height={60}
                className="h-12 w-auto"
              />
            </Link>
            <p className="text-gray-400">
              Empowering students and educators through innovative learning solutions.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <Link 
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                  aria-label={social.name}
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { name: "Home", href: "/" },
                { name: "Our Story", href: "/ourstory" },
                { name: "Research", href: "/research" },
                { name: "Contact Us", href: "/contactus" },
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tutor Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Tutor Resources</h3>
            <ul className="space-y-2">
              {[
                { name: "Find Tutors", href: "/tutors" },
                { name: "Become a Tutor", href: "/become-tutor" },
                { name: "Tutor Resources", href: "/tutor-resources" },
                { name: "Teaching Jobs", href: "/teaching-jobs" },
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <address className="not-italic text-gray-400 space-y-3">
              <div className="flex items-start space-x-2">
                <FaMapMarkerAlt className="mt-1 flex-shrink-0" />
                <p>123 Education Street, Boston, MA 02115</p>
              </div>
              <div className="flex items-center space-x-2">
                <FaEnvelope />
                <Link href="mailto:info@example.com" className="hover:text-white">
                  info@example.com
                </Link>
              </div>
              <div className="flex items-center space-x-2">
                <FaPhone />
                <Link href="tel:+92302420543" className="hover:text-white">
                  +92 302 4200543
                </Link>
              </div>
            </address>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-8"></div>

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Infinity Quotient Learning. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-500 hover:text-white text-sm">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-500 hover:text-white text-sm">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-gray-500 hover:text-white text-sm">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;