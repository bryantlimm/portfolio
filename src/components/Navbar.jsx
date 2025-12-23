// src/components/Navbar.jsx
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-br from-white/80 to-gray-200/60 backdrop-blur-lg rounded-full border border-white/60 px-4 md:px-8 py-2 md:py-3 shadow-md shadow-gray-300/40 transition-all duration-300 hover:shadow-lg hover:shadow-gray-400/50 hover:backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 md:gap-8">
        {/* Logo / Name */}
        <Link to="/" className="text-lg md:text-xl font-bold text-blue-600">
            Bryant
        </Link>

        {/* Navigation Links */}
        <div className="flex gap-4 md:gap-8 text-gray-600 font-medium text-sm md:text-base">
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