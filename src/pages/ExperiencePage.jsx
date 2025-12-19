// src/pages/ExperiencePage.jsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import { MapPin, Calendar } from 'lucide-react';
import ExperienceModal from '../components/ExperienceModal'; // Import Modal

const ExperiencePage = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExp, setSelectedExp] = useState(null); // State for Modal

  useEffect(() => {
    const fetchExperience = async () => {
      try {
        const q = query(collection(db, "experience")); 
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setExperiences(list);
      } catch (error) {
        console.error("Error fetching experience:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExperience();
  }, []);

  const getTypeColor = (type) => {
    switch(type) {
      case 'creative': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'impact': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">Work Experience</h1>
          <p className="text-xl text-gray-500 max-w-2xl">
            A timeline of my professional journey, covering development, design, and impact roles.
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading specific data...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {experiences.map((exp, index) => (
              <motion.div 
                layoutId={`exp-${exp.id}`}
                key={exp.id}
                onClick={() => setSelectedExp(exp)} // Click Handler
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col h-full cursor-pointer group"
              >
                <div className="mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getTypeColor(exp.type)}`}>
                    {exp.type}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-1 leading-tight group-hover:text-blue-600 transition-colors">{exp.title}</h3>
                <p className="text-blue-600 font-medium mb-4">{exp.company}</p>

                <div className="flex flex-col gap-2 text-sm text-gray-500 mb-4 border-b border-gray-100 pb-4">
                   <div className="flex items-center gap-2">
                     <MapPin size={14} className="text-gray-400"/> {exp.place}
                   </div>
                   <div className="flex items-center gap-2">
                     <Calendar size={14} className="text-gray-400"/> {exp.period}
                   </div>
                </div>

                {/* Truncated description */}
                <p className="text-gray-600 text-sm mb-6 flex-grow line-clamp-4">
                  {exp.description}
                </p>

                <div className="flex flex-wrap gap-2 mt-auto">
                  {Array.isArray(exp.skills) && exp.skills.slice(0, 3).map((skill, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md">
                      {skill}
                    </span>
                  ))}
                  {Array.isArray(exp.skills) && exp.skills.length > 3 && (
                    <span className="px-2 py-1 text-gray-400 text-xs font-medium">+{exp.skills.length - 3}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && experiences.length === 0 && (
          <div className="text-center py-20 text-gray-400">No experience entries found yet.</div>
        )}

      </div>

      {/* MODAL */}
      <AnimatePresence>
        {selectedExp && (
          <ExperienceModal experience={selectedExp} onClose={() => setSelectedExp(null)} />
        )}
      </AnimatePresence>

    </div>
  );
};

export default ExperiencePage;