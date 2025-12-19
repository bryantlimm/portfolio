// src/components/HomeProjects.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FolderGit2, ArrowRight } from 'lucide-react';
import { db } from '../firebase'; // <--- Import DB
import { collection, getDocs } from 'firebase/firestore'; // <--- Import Firestore functions
import ProjectModal from './ProjectModal';

const HomeProjects = () => {
  const [activeTab, setActiveTab] = useState('development');
  const [repos, setRepos] = useState([]);
  const [creativeProjects, setCreativeProjects] = useState([]); // <--- New State for Real Data
  const [selectedProject, setSelectedProject] = useState(null);

  // 1. Fetch GitHub (Existing)
  useEffect(() => {
    fetch('https://api.github.com/users/bryantlimm/repos?sort=updated&per_page=10')
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) {
           const sortedData = data.sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));
           setRepos(sortedData.slice(0, 4));
        }
      })
      .catch(err => console.error("Error fetching repos:", err));
  }, []);

  // 2. Fetch Firebase Projects (NEW)
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "projects"));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCreativeProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, []);

  // Filter content
  const filteredCreative = creativeProjects.filter(p => p.category === activeTab);

  return (
    <section className="py-20 bg-white" id="projects">
      <div className="max-w-6xl mx-auto px-4">
        
        <h2 className="text-4xl font-bold text-gray-900 mb-8">Projects</h2>

        <div className="flex gap-4 mb-12 overflow-x-auto pb-2">
          {['development', 'photography', 'graphic design'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full text-sm font-bold capitalize transition-all whitespace-nowrap duration-300 hover:scale-105
                ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-300/30 backdrop-blur-lg border border-blue-500/50 hover:shadow-xl hover:shadow-blue-400/40' : 'bg-gray-100/60 text-gray-600 hover:bg-gray-100/70 backdrop-blur-lg border border-gray-300/50 shadow-sm shadow-gray-200/20 hover:shadow-md hover:shadow-gray-300/30'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* DEVELOPMENT TAB (GitHub) */}
          {activeTab === 'development' && repos.map((repo) => (
            <motion.div 
              key={repo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-xl transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <FolderGit2 className="text-blue-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{repo.name}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3 h-16">{repo.description}</p>
              <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm font-bold flex items-center gap-1">
                Code <ArrowRight size={14} />
              </a>
            </motion.div>
          ))}

          {/* CREATIVE TABS (Firebase Data) */}
          {(activeTab === 'photography' || activeTab === 'graphic design') && filteredCreative.map((project) => (
            <motion.div
              key={project.id}
              layoutId={`project-${project.id}`}
              onClick={() => setSelectedProject(project)}
              className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer bg-gray-200"
            >
              <img 
                src={project.imageUrl} // Use the uploaded image URL
                alt={project.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                <div>
                  <h3 className="text-white font-bold text-lg">{project.title}</h3>
                  <p className="text-white/80 text-sm capitalize">{project.category}</p>
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* Empty State Message */}
          {(activeTab !== 'development' && filteredCreative.length === 0) && (
            <div className="col-span-4 text-center py-12 text-gray-400">
              No projects added in this category yet.
            </div>
          )}

        </div>

        <div className="mt-12 text-right">
          <Link to="/projects" className="text-blue-600 font-bold hover:gap-4 transition-all">View More Projects →</Link>
        </div>

      </div>

      {selectedProject && (
        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </section>
  );
};

export default HomeProjects;