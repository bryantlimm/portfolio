// src/components/ExperienceModal.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, Calendar, Building, Briefcase } from 'lucide-react';

const ExperienceModal = ({ experience, onClose }) => {
  if (!experience) return null;

  // Helper for type colors
  const getTypeColor = (type) => {
    switch(type) {
      case 'creative': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'leadership': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      
      {/* Backdrop (Dark overlay) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
      />
      
      {/* Modal Card */}
      <motion.div
        layoutId={`exp-${experience.id}`}
        className="relative bg-white w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col pointer-events-auto"
      >
        
        {/* Header (Sticky) */}
        <div className="p-6 md:p-8 border-b border-gray-100 bg-white z-10 flex justify-between items-start shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
               <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getTypeColor(experience.type)}`}>
                  {experience.type}
               </span>
               <span className="text-gray-400 text-sm flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                 <Calendar size={14}/> {experience.period}
               </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{experience.title}</h2>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-blue-600 font-medium">
              <span className="flex items-center gap-2"><Building size={18}/> {experience.company}</span>
              <span className="hidden sm:block text-gray-300">•</span>
              <span className="flex items-center gap-2 text-gray-500 font-normal">
                <MapPin size={16}/> {experience.place}
              </span>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 bg-gray-100 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 md:p-8 overflow-y-auto">
          <div className="prose max-w-none text-gray-600 leading-relaxed whitespace-pre-line text-lg">
            {experience.description}
          </div>

          {/* Skills Footer */}
          {experience.skills && experience.skills.length > 0 && (
            <div className="mt-10 pt-8 border-t border-gray-100">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Briefcase size={16} className="text-blue-500"/> Skills & Tech
              </h4>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(experience.skills) ? experience.skills.map((skill, i) => (
                  <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg border border-gray-200">
                    {skill}
                  </span>
                )) : null}
              </div>
            </div>
          )}
        </div>

      </motion.div>
    </div>
  );
};

export default ExperienceModal;