// src/pages/ProjectsPage.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore'; 
import { FolderGit2, ArrowRight } from 'lucide-react';
import ProjectModal from '../components/ProjectModal';

const ProjectsPage = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [projects, setProjects] = useState([]);
  const [repos, setRepos] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  // Fetch GitHub repos
  useEffect(() => {
    fetch('https://api.github.com/users/bryantlimm/repos?sort=updated&per_page=10')
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) {
           const sortedData = data.sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));
           setRepos(sortedData);
        }
      })
      .catch(err => console.error("Error fetching repos:", err));
  }, []);

  // Fetch Firebase projects
  useEffect(() => {
    const fetchProjects = async () => {
      // Fetch all projects from Firestore
      const q = query(collection(db, "projects"), orderBy("date", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(data);
    };
    fetchProjects();
  }, []);

  const categories = ['All', 'Development', 'Photography', 'Graphic Design', 'Other'];
  
  // Filter logic
  const filteredFirebaseProjects = activeTab === 'All' 
    ? projects 
    : projects.filter(p => p.category.toLowerCase() === activeTab.toLowerCase());

  // Show GitHub repos for Development and All tabs
  const showGithubRepos = activeTab === 'Development' || activeTab === 'All';
  const combinedProjects = showGithubRepos 
    ? [...repos.map(repo => ({ ...repo, isGithub: true })), ...filteredFirebaseProjects]
    : filteredFirebaseProjects;

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-8">All Projects</h1>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-12 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap duration-300 hover:scale-105
                ${activeTab === cat ? 'bg-blue-600 text-white shadow-lg shadow-blue-300/30 backdrop-blur-lg border border-blue-500/50 hover:shadow-xl hover:shadow-blue-400/40' : 'bg-gray-100/60 text-gray-600 hover:bg-gray-100/70 backdrop-blur-lg border border-gray-300/50 shadow-sm shadow-gray-200/20 hover:shadow-md hover:shadow-gray-300/30'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {combinedProjects.map((project, index) => (
            <motion.div
              key={project.id || project.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              {project.isGithub ? (
                // GitHub Repo Card
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-xl transition-all h-full">
                  <div className="flex justify-between items-start mb-4">
                    <FolderGit2 className="text-blue-600 w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{project.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 h-16">{project.description}</p>
                  <a href={project.html_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm font-bold flex items-center gap-1">
                    Code <ArrowRight size={14} />
                  </a>
                </div>
              ) : (
                // Firebase Project Card
                <div 
                  onClick={() => setSelectedProject(project)}
                  className="cursor-pointer"
                >
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-gray-100 relative">
                    <img 
                      src={project.imageUrl} 
                      alt={project.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{project.title}</h3>
                  <p className="text-sm text-gray-500 capitalize">{project.category} • {project.date}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
        
        {combinedProjects.length === 0 && (
          <div className="text-center text-gray-400 py-20">No projects found in this category.</div>
        )}
      </div>

      {selectedProject && (
        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </div>
  );
};

export default ProjectsPage;