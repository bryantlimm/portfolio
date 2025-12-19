// src/components/HomeSkills.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Code, Palette, HeartHandshake } from 'lucide-react'; // Icons for the 3 categories

const HomeSkills = () => {
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    const fetchSkills = async () => {
      // Order by score so highest skills appear first
      const q = query(collection(db, "skills"), orderBy("score", "desc"));
      const snap = await getDocs(q);
      setSkills(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchSkills();
  }, []);

  // Filter helpers
  const devSkills = skills.filter(s => (s.type === 'development' || !s.type)); // Fallback to dev if undefined
  const creativeSkills = skills.filter(s => s.type === 'creative');
  const impactSkills = skills.filter(s => s.type === 'impact');

  // Reusable Component for a Single Skill Column
  const SkillCard = ({ title, icon: Icon, color, items, delay }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      viewport={{ once: true }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full"
    >
      <div className={`flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 ${color}`}>
        <div className="p-2 rounded-lg bg-opacity-10 bg-current">
          <Icon size={24} />
        </div>
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      </div>

      <div className="space-y-6">
        {items.length === 0 && <p className="text-gray-400 text-sm italic">No skills added yet.</p>}
        
        {items.map((skill) => (
          <div key={skill.id}>
            <div className="flex justify-between items-end mb-1">
              <span className="font-bold text-gray-700 text-sm">{skill.name}</span>
              <span className="text-xs text-gray-400 font-mono">{skill.score}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: `${skill.score}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full ${color.replace('text-', 'bg-')}`} // Uses the text color class as bg color
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <section className="py-20 bg-white" id="skills">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Technical Proficiency</h2>
        
        {/* The Grid: 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <SkillCard 
            title="Development" 
            icon={Code} 
            color="text-blue-600" 
            items={devSkills} 
            delay={0}
          />

          <SkillCard 
            title="Creative" 
            icon={Palette} 
            color="text-purple-600" 
            items={creativeSkills} 
            delay={0.1}
          />

          <SkillCard 
            title="Impact" 
            icon={HeartHandshake} 
            color="text-green-600" 
            items={impactSkills} 
            delay={0.2}
          />

        </div>
      </div>
    </section>
  );
};

export default HomeSkills;