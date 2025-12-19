// src/components/Navbar.jsx
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white/80 backdrop-blur-md rounded-full border border-gray-200 px-8 py-3 shadow-lg">
      <div className="flex items-center justify-between gap-8">
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