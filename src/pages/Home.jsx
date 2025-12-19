// src/pages/Home.jsx
import React, { useState, useEffect } from 'react'; // Import useState & useEffect
import { motion } from 'framer-motion';
import { db } from '../firebase'; // Import DB
import { doc, getDoc } from 'firebase/firestore'; // Import Firestore tools
import HomeProjects from '../components/HomeProjects';
import HomeExperience from '../components/HomeExperience';
import HomeSkills from '../components/HomeSkills';

const Home = () => {
  // 1. Create State to hold the data
  const [hero, setHero] = useState({
    name: "Bryant Limm",
    title: "Full Stack Developer",
    description: "Welcome to my portfolio."
  });

  // 2. Fetch from Firebase
  useEffect(() => {
    const fetchHero = async () => {
      try {
        const docRef = doc(db, "content", "hero");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setHero(docSnap.data());
        }
      } catch (err) {
        console.error("Error fetching hero:", err);
      }
    };
    fetchHero();
  }, []);

  return (
    <div className="pb-0">
      <div className="max-w-6xl mx-auto px-4 pt-32 pb-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          
          {/* Text Side (Using the State variables!) */}
          <div className="md:w-1/2">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-blue-600 font-bold tracking-wider uppercase mb-2 block"
            >
              {hero.title} {/* <--- DYNAMIC */}
            </motion.span>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight"
            >
              Hi, I'm <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {hero.name} {/* <--- DYNAMIC */}
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 mb-8 leading-relaxed"
            >
              {hero.description} {/* <--- DYNAMIC */}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex gap-4"
            >
              <a href="#projects" className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200">
                View Work
              </a>
              <a href="/contact" className="px-8 py-3 bg-white text-gray-700 border border-gray-200 rounded-full font-bold hover:bg-gray-50 transition-all">
                Contact Me
              </a>
            </motion.div>
          </div>

          {/* Image Side (We will make this dynamic next!) */}
          <div className="md:w-1/2 flex justify-center relative">
            <div className="w-80 h-80 md:w-96 md:h-96 bg-gray-200 rounded-full overflow-hidden border-8 border-white shadow-2xl z-10">
               <img 
                    src={hero.imageUrl || "https://via.placeholder.com/400"} 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                />
            </div>
          </div>
        </div>
      </div>
      
      <HomeProjects />
      <HomeExperience />
      <HomeSkills />
    </div>
  );
};

export default Home;