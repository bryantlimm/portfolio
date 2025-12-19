// src/components/Navbar.jsx
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo / Name */}
        <Link to="/" className="text-xl font-bold text-blue-600">
          Portfolio
        </Link>

        {/* Navigation Links */}
        <div className="flex gap-8 text-gray-600 font-medium">
          <Link to="/" className="hover:text-blue-600 transition">Home</Link>
          <Link to="/about" className="hover:text-blue-600 transition">About</Link>
          <Link to="/projects" className="hover:text-blue-600 transition">Projects</Link>
          <Link to="/experience" className="hover:text-blue-600 transition">Experience</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;