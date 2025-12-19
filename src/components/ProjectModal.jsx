// src/components/ProjectModal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const ProjectModal = ({ project, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  if (!project) return null;

  // Handle Carousel Navigation
  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % project.images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + project.images.length) % project.images.length);
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside content
          className="bg-white rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col md:flex-row shadow-2xl"
        >
          
          {/* Left Side: Image Carousel */}
          <div className="w-full md:w-2/3 bg-gray-900 relative h-64 md:h-auto flex items-center justify-center group">
            <img 
              src={project.images[currentImageIndex]} 
              alt={project.title} 
              className="w-full h-full object-contain max-h-[60vh] md:max-h-full"
            />
            
            {/* Carousel Buttons (Only show if more than 1 image) */}
            {project.images.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-4 p-2 bg-white/10 hover:bg-white/30 rounded-full text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100">
                  <ChevronLeft />
                </button>
                <button onClick={nextImage} className="absolute right-4 p-2 bg-white/10 hover:bg-white/30 rounded-full text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100">
                  <ChevronRight />
                </button>
              </>
            )}
            
            {/* Page Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {project.images.map((_, idx) => (
                <div key={idx} className={`w-2 h-2 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/30'}`} />
              ))}
            </div>
          </div>

          {/* Right Side: Info */}
          <div className="w-full md:w-1/3 p-8 flex flex-col bg-white">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{project.category}</span>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{project.title}</h3>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="text-gray-500" />
              </button>
            </div>

            <div className="prose prose-sm text-gray-600 overflow-y-auto pr-2 custom-scrollbar">
              <p>{project.description}</p>
            </div>

            <div className="mt-auto pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-400 font-mono">Date: {project.date}</p>
            </div>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProjectModal;