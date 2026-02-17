// src/components/HomeExperience.jsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';
import ExperienceModal from './ExperienceModal'; // Import the new modal

const HomeExperience = () => {
  const [experiences, setExperiences] = useState([]);
  const [selectedExp, setSelectedExp] = useState(null); // State for modal

  useEffect(() => {
    const fetchExperience = async () => {
      const q = query(collection(db, "experience")); 
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExperiences(list);
    };
    fetchExperience();
  }, []);

  const getTypeColor = (type) => {
    switch(type) {
      case 'creative': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'leadership': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <section className="py-20 bg-gray-50" id="experience">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
           <h2 className="text-4xl font-bold text-gray-900">Experience</h2>
           <a href="/experience" className="text-blue-600 font-bold flex items-center gap-1 hover:gap-2 transition-all">View All <ArrowRight size={18}/></a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {experiences.slice(0, 4).map((exp, index) => (
            <motion.div 
              layoutId={`exp-${exp.id}`}
              key={exp.id}
              onClick={() => setSelectedExp(exp)} // CLICK HANDLER
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
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

              {/* Line clamp ensures only 4 lines show. The rest is hidden until clicked */}
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
      </div>

      {/* POPUP MODAL */}
      <AnimatePresence>
        {selectedExp && (
          <ExperienceModal experience={selectedExp} onClose={() => setSelectedExp(null)} />
        )}
      </AnimatePresence>

    </section>
  );
};

export default HomeExperience;