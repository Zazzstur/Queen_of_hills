import React from 'react';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Experiences', path: '/experiences' },
    { name: 'Packages', path: '/#packages' },
    { name: 'About Us', path: '/#about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <footer id="contact" className="bg-primary text-white pt-20 pb-10">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <h2 className="font-serif text-3xl font-bold">Toils</h2>
            <p className="text-gray-300 leading-relaxed max-w-sm">
              Toils is a new company redefining how Darjeeling is experienced.
              <br />
              Through a platform built for personalization, transparency, and complete flexibility — every journey is shaped entirely by you.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-accent hover:border-accent transition-all duration-300">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-accent hover:border-accent transition-all duration-300">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-accent hover:border-accent transition-all duration-300">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-accent font-serif text-xl mb-6">Quick Links</h3>
            <ul className="space-y-4">
              {quickLinks.map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className="text-gray-300 hover:text-white transition-colors flex items-center">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-accent font-serif text-xl mb-6">Contact Us</h3>
            <ul className="space-y-6">
              <li className="flex items-center">
                <Phone className="w-5 h-5 text-accent mr-4 flex-shrink-0" />
                <a className="text-gray-300 hover:text-white transition-colors" href="tel:+918170848914">+91 8170848914</a>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 text-accent mr-4 flex-shrink-0" />
                <a className="text-gray-300 hover:text-white transition-colors" href="mailto:toilsdarjeeling@gmail.com">toilsdarjeeling@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>&copy; 2024 Toils. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <Link 
              to="/admin"
              className="hover:text-white transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
