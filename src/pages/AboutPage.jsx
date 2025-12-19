// src/pages/AboutPage.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const AboutPage = () => {
  const [data, setData] = useState({ title: '', description: '', imageUrl: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const docSnap = await getDoc(doc(db, "content", "about"));
        if (docSnap.exists()) {
          setData(docSnap.data());
        }
      } catch (err) {
        console.error("Error loading about data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAbout();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center text-gray-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-start">
          
          {/* LEFT: Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-8 leading-tight">
              {data.title || "About Me"}
            </h1>
            
            <div className="prose prose-lg text-gray-600 leading-relaxed whitespace-pre-line">
              {data.description || "No description added yet."}
            </div>

            {/* Optional signature or contact CTA could go here */}
            <div className="mt-8 pt-8 border-t border-gray-100">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Contact</p>
              <a href="mailto:hello@example.com" className="text-lg font-bold text-blue-600 hover:text-blue-700 transition">
                Get in touch &rarr;
              </a>
            </div>
          </motion.div>

          {/* RIGHT: Image */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
             {/* Decorative colored backdrop */}
             <div className="absolute -inset-4 bg-blue-100 rounded-2xl -z-10 rotate-3 transform scale-105"></div>
             
             {/* Main Image */}
             <div className="aspect-[3/4] md:aspect-[4/5] overflow-hidden rounded-2xl shadow-2xl">
               <img 
                 src={data.imageUrl || "https://via.placeholder.com/600x800"} 
                 alt="Portrait" 
                 className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
               />
             </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default AboutPage;