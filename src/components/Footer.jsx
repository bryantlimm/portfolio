// src/components/Footer.jsx
import React from 'react';
import { Github, Linkedin, Instagram, Mail, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 border-t border-gray-800" id="footer">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Left: Name & Copyright */}
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold mb-2">Bryant</h2>
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} All rights reserved. Built with React & Tailwind.
          </p>
        </div>

        {/* Right: Social Icons */}
        <div className="flex gap-6">
          <a href="https://github.com/bryantlimm" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white hover:scale-110 transition-all">
            <Github size={24} />
          </a>
          <a href="https://www.linkedin.com/in/bryant-aryadi/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-400 hover:scale-110 transition-all">
            <Linkedin size={24} />
          </a>
          <a href="https://instagram.com/bryantlimm" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-pink-400 hover:scale-110 transition-all">
            <Instagram size={24} />
          </a>
          <a href="mailto:bryantaryadi@gmail.com" className="text-gray-400 hover:text-red-400 hover:scale-110 transition-all">
            <Mail size={24} />
          </a>
        </div>

      </div>
    </footer>
  );
};

export default Footer;