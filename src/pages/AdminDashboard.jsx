// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase';
import { signOut } from 'firebase/auth';
import { 
  doc, getDoc, setDoc, 
  collection, addDoc, deleteDoc, updateDoc, onSnapshot, query, orderBy 
} from 'firebase/firestore'; 
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, X, Pencil, Briefcase, Code, Image as ImageIcon, MapPin, User } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState('projects'); 

  // --- 1. HERO STATE ---
  const [heroData, setHeroData] = useState({ name: '', title: '', description: '', imageUrl: '' });
  const [heroImageFile, setHeroImageFile] = useState(null);

  // --- 2. ABOUT PAGE STATE (NEW) ---
  const [aboutData, setAboutData] = useState({ title: '', description: '', imageUrl: '' });
  const [aboutImageFile, setAboutImageFile] = useState(null);

  // --- 3. PROJECTS STATE ---
  const [projects, setProjects] = useState([]);
  const [editingProjId, setEditingProjId] = useState(null); 
  const [newProject, setNewProject] = useState({ title: '', category: 'photography', description: '', date: '' });
  const [projectFiles, setProjectFiles] = useState([]);

  // --- 4. EXPERIENCE STATE ---
  const [experiences, setExperiences] = useState([]);
  const [editingExpId, setEditingExpId] = useState(null);
  const [expForm, setExpForm] = useState({ 
    title: '', type: 'development', company: '', place: '', period: '', description: '', skills: [] 
  });
  const [expSkillInput, setExpSkillInput] = useState('');

  // --- 5. SKILLS STATE ---
  const [skills, setSkills] = useState([]);
  const [editingSkillId, setEditingSkillId] = useState(null);
  const [skillForm, setSkillForm] = useState({ name: '', score: 50, type: 'development' });

  // ==========================
  //      INITIAL DATA LOAD
  // ==========================
  useEffect(() => {
    // Fetch Hero
    getDoc(doc(db, "content", "hero")).then(docSnap => {
      if (docSnap.exists()) setHeroData(docSnap.data());
    });
    
    // Fetch About (NEW)
    getDoc(doc(db, "content", "about")).then(docSnap => {
      if (docSnap.exists()) setAboutData(docSnap.data());
    });

    const qProj = query(collection(db, "projects"), orderBy("date", "desc"));
    const unsubProj = onSnapshot(qProj, (snap) => setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    const qExp = query(collection(db, "experience"));
    const unsubExp = onSnapshot(qExp, (snap) => setExperiences(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    const qSkills = query(collection(db, "skills"), orderBy("score", "desc"));
    const unsubSkills = onSnapshot(qSkills, (snap) => setSkills(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    return () => { unsubProj(); unsubExp(); unsubSkills(); };
  }, []);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // ==========================
  //    HANDLERS: HERO
  // ==========================
  const handleSaveHero = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let url = heroData.imageUrl;
      if (heroImageFile) {
        const fileRef = ref(storage, `hero/${heroImageFile.name}`);
        await uploadBytes(fileRef, heroImageFile);
        url = await getDownloadURL(fileRef);
      }
      await setDoc(doc(db, "content", "hero"), { ...heroData, imageUrl: url });
      showSuccess("Home/Hero updated!");
    } catch (err) { alert(err.message); }
    setLoading(false);
  };

  // ==========================
  //    HANDLERS: ABOUT (NEW)
  // ==========================
  const handleSaveAbout = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let url = aboutData.imageUrl;
      if (aboutImageFile) {
        // Upload new image if selected
        const fileRef = ref(storage, `about/${Date.now()}_${aboutImageFile.name}`);
        await uploadBytes(fileRef, aboutImageFile);
        url = await getDownloadURL(fileRef);
      }
      await setDoc(doc(db, "content", "about"), { ...aboutData, imageUrl: url });
      showSuccess("About Page updated!");
    } catch (err) { alert(err.message); }
    setLoading(false);
  };

  // ==========================
  //    HANDLERS: PROJECTS
  // ==========================
  const handleSaveProject = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrls = editingProjId ? (projects.find(p => p.id === editingProjId).images || []) : [];
      if (projectFiles.length > 0) {
        const newUrls = [];
        for (const file of projectFiles) {
          const fileRef = ref(storage, `projects/${Date.now()}_${file.name}`);
          await uploadBytes(fileRef, file);
          newUrls.push(await getDownloadURL(fileRef));
        }
        imageUrls = editingProjId ? [...imageUrls, ...newUrls] : newUrls;
      }
      const projData = { ...newProject, imageUrl: imageUrls[0] || "", images: imageUrls };
      if (editingProjId) {
        await updateDoc(doc(db, "projects", editingProjId), projData);
        showSuccess("Project Updated!");
        setEditingProjId(null);
      } else {
        await addDoc(collection(db, "projects"), projData);
        showSuccess("Project Added!");
      }
      setNewProject({ title: '', category: 'photography', description: '', date: '' });
      setProjectFiles([]);
    } catch (err) { alert(err.message); }
    setLoading(false);
  };
  const handleEditProject = (p) => {
    setNewProject(p);
    setEditingProjId(p.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleDeleteProject = async (id) => {
    if(window.confirm("Delete?")) await deleteDoc(doc(db, "projects", id));
  };

  // ==========================
  //    HANDLERS: EXPERIENCE
  // ==========================
  const handleAddExpSkill = (e) => {
    if (e.key === 'Enter' && expSkillInput.trim() !== '') {
      e.preventDefault();
      if (!expForm.skills.includes(expSkillInput.trim())) {
        setExpForm(prev => ({ ...prev, skills: [...prev.skills, expSkillInput.trim()] }));
      }
      setExpSkillInput('');
    }
  };
  const handleRemoveExpSkill = (skillToRemove) => {
    setExpForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
  };
  const handleSaveExperience = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const finalSkills = Array.isArray(expForm.skills) ? expForm.skills : [];
      const dataToSave = { ...expForm, skills: finalSkills };
      if (editingExpId) {
        await updateDoc(doc(db, "experience", editingExpId), dataToSave);
        showSuccess("Experience updated!");
        setEditingExpId(null);
      } else {
        await addDoc(collection(db, "experience"), dataToSave);
        showSuccess("Experience added!");
      }
      setExpForm({ title: '', type: 'development', company: '', place: '', period: '', description: '', skills: [] });
      setExpSkillInput('');
    } catch (err) { alert(err.message); }
    setLoading(false);
  };
  const handleEditExperience = (exp) => {
    const safeSkills = Array.isArray(exp.skills) ? exp.skills : (exp.skills ? [exp.skills] : []);
    setExpForm({ ...exp, skills: safeSkills });
    setEditingExpId(exp.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleDeleteExperience = async (id) => {
    if(window.confirm("Delete?")) await deleteDoc(doc(db, "experience", id));
  };

  // ==========================
  //    HANDLERS: SKILLS
  // ==========================
  const handleSaveSkill = async (e) => {
    e.preventDefault();
    if (!skillForm.name) return;
    if (editingSkillId) {
      await updateDoc(doc(db, "skills", editingSkillId), skillForm);
      showSuccess("Skill updated!");
      setEditingSkillId(null);
    } else {
      await addDoc(collection(db, "skills"), skillForm);
      showSuccess("Skill added!");
    }
    setSkillForm({ name: '', score: 50, type: 'development' });
  };
  const handleEditSkill = (s) => {
    setSkillForm({ ...s, type: s.type || 'development' });
    setEditingSkillId(s.id);
  };
  const handleDeleteSkill = async (id) => {
     await deleteDoc(doc(db, "skills", id));
  };


  // ==========================
  //          RENDER
  // ==========================
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 pt-24">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Command Center</h1>
          <button onClick={() => signOut(auth).then(() => navigate('/login'))} className="text-red-600 font-medium">Logout</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 border-b border-gray-200">
          {[
            { id: 'projects', icon: <ImageIcon size={18}/>, label: 'Projects' },
            { id: 'experience', icon: <Briefcase size={18}/>, label: 'Experience' },
            { id: 'skills', icon: <Code size={18}/>, label: 'Skills' },
            { id: 'profile', icon: <Pencil size={18}/>, label: 'Home Hero' },
            { id: 'about', icon: <User size={18}/>, label: 'About Page' }, // NEW TAB
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-bold transition ${activeTab === tab.id ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {successMsg && <div className="fixed top-24 right-8 bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-bounce">{successMsg}</div>}

        {/* --- PROJECTS TAB --- */}
        {activeTab === 'projects' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm h-fit">
              <h2 className="text-xl font-bold mb-4">{editingProjId ? "Edit Project" : "Add Project"}</h2>
              <form onSubmit={handleSaveProject} className="space-y-4">
                <input required placeholder="Title" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} className="w-full p-2 border rounded"/>
                <select value={newProject.category} onChange={e => setNewProject({...newProject, category: e.target.value})} className="w-full p-2 border rounded">
                  <option value="photography">Photography</option>
                  <option value="graphic design">Graphic Design</option>
                  <option value="development">Development</option>
                </select>
                <input required placeholder="Date" value={newProject.date} onChange={e => setNewProject({...newProject, date: e.target.value})} className="w-full p-2 border rounded"/>
                <input type="file" multiple onChange={(e) => setProjectFiles(Array.from(e.target.files))} className="block w-full text-sm mt-1"/>
                <textarea required placeholder="Description" value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} className="w-full p-2 border rounded" rows="3"/>
                <div className="flex gap-2">
                  <button disabled={loading} className="flex-1 py-2 bg-blue-600 text-white rounded font-bold">{editingProjId ? "Update" : "Add"}</button>
                  {editingProjId && <button type="button" onClick={()=>{setEditingProjId(null); setNewProject({title:'', category:'photography', description:'', date:''})}} className="px-3 bg-gray-200 rounded">Cancel</button>}
                </div>
              </form>
            </div>
            <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
              {projects.map(p => (
                <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm border flex gap-4 relative group">
                  <img src={p.imageUrl} className="w-20 h-20 rounded bg-gray-100 object-cover"/>
                  <div className="flex-1">
                    <h3 className="font-bold">{p.title}</h3>
                    <p className="text-xs text-gray-500 uppercase">{p.category}</p>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => handleEditProject(p)} className="text-blue-500 text-xs flex items-center gap-1"><Pencil size={12}/> Edit</button>
                      <button onClick={() => handleDeleteProject(p.id)} className="text-red-500 text-xs flex items-center gap-1"><Trash2 size={12}/> Del</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- EXPERIENCE TAB --- */}
        {activeTab === 'experience' && (
           <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm h-fit">
              <h2 className="text-xl font-bold mb-4">{editingExpId ? "Edit Job" : "Add Job"}</h2>
              <form onSubmit={handleSaveExperience} className="space-y-4">
                <input required placeholder="Job Title (e.g. Frontend Dev)" value={expForm.title} onChange={e => setExpForm({...expForm, title: e.target.value})} className="w-full p-2 border rounded"/>
                <div className="grid grid-cols-2 gap-2">
                   <select value={expForm.type} onChange={e => setExpForm({...expForm, type: e.target.value})} className="w-full p-2 border rounded">
                    <option value="development">Development</option>
                    <option value="creative">Creative</option>
                    <option value="impact">Impact</option>
                  </select>
                  <input required placeholder="Company" value={expForm.company} onChange={e => setExpForm({...expForm, company: e.target.value})} className="w-full p-2 border rounded"/>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input required placeholder="Location" value={expForm.place} onChange={e => setExpForm({...expForm, place: e.target.value})} className="w-full p-2 border rounded"/>
                  <input required placeholder="Date (e.g. 2023)" value={expForm.period} onChange={e => setExpForm({...expForm, period: e.target.value})} className="w-full p-2 border rounded"/>
                </div>
                <textarea required placeholder="Description" value={expForm.description} onChange={e => setExpForm({...expForm, description: e.target.value})} className="w-full p-2 border rounded" rows="3"/>
                <div>
                   <label className="text-xs font-bold text-gray-500 mb-1 block">Skills (Type & Press Enter)</label>
                   <div className="flex flex-wrap gap-2 mb-2">
                     {expForm.skills.map((s, i) => (
                       <span key={i} className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                         {s}
                         <button type="button" onClick={() => handleRemoveExpSkill(s)} className="hover:text-red-500"><X size={12}/></button>
                       </span>
                     ))}
                   </div>
                   <input 
                    placeholder="Type skill + Enter..." 
                    value={expSkillInput} 
                    onChange={e => setExpSkillInput(e.target.value)} 
                    onKeyDown={handleAddExpSkill}
                    className="w-full p-2 border rounded text-sm"
                   />
                </div>
                <div className="flex gap-2">
                  <button disabled={loading} className="flex-1 py-2 bg-blue-600 text-white rounded font-bold">{editingExpId ? "Update" : "Add"}</button>
                  {editingExpId && <button type="button" onClick={()=>{setEditingExpId(null); setExpForm({title:'', type:'development', company:'', place:'', period:'', description:'', skills:[]})}} className="px-3 bg-gray-200 rounded">Cancel</button>}
                </div>
              </form>
            </div>
            <div className="lg:col-span-2 space-y-4">
              {experiences.map(exp => (
                <div key={exp.id} className="bg-white p-6 rounded-xl shadow-sm border relative">
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={() => handleEditExperience(exp)} className="p-1.5 bg-blue-50 text-blue-600 rounded"><Pencil size={14}/></button>
                    <button onClick={() => handleDeleteExperience(exp.id)} className="p-1.5 bg-red-50 text-red-600 rounded"><Trash2 size={14}/></button>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                      exp.type === 'development' ? 'bg-blue-100 text-blue-700' : 
                      exp.type === 'creative' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                    }`}>{exp.type}</span>
                    <span className="text-gray-400 text-sm flex items-center gap-1"><MapPin size={12}/> {exp.place}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{exp.title}</h3>
                  <p className="text-gray-600 font-medium">{exp.company}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {Array.isArray(exp.skills) && exp.skills.map((s, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- SKILLS TAB --- */}
        {activeTab === 'skills' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm h-fit">
              <h2 className="text-xl font-bold mb-4">{editingSkillId ? "Edit Skill" : "Add Skill"}</h2>
              <form onSubmit={handleSaveSkill} className="space-y-4">
                <input required placeholder="Skill Name (e.g. React)" value={skillForm.name} onChange={e => setSkillForm({...skillForm, name: e.target.value})} className="w-full p-2 border rounded"/>
                <div>
                   <label className="text-xs font-bold text-gray-500 block mb-1">Category</label>
                   <select value={skillForm.type || 'development'} onChange={e => setSkillForm({...skillForm, type: e.target.value})} className="w-full p-2 border rounded">
                     <option value="development">Development</option>
                     <option value="creative">Creative</option>
                     <option value="impact">Impact</option>
                   </select>
                </div>
                <div>
                   <label className="text-xs font-bold text-gray-500 flex justify-between">Fluency <span>{skillForm.score}%</span></label>
                   <input type="range" min="0" max="100" value={skillForm.score} onChange={e => setSkillForm({...skillForm, score: parseInt(e.target.value)})} className="w-full"/>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-green-600 text-white rounded font-bold">{editingSkillId ? "Update" : "Add"}</button>
                  {editingSkillId && <button type="button" onClick={() => {setEditingSkillId(null); setSkillForm({name:'', score:50, type:'development'})}} className="px-3 bg-gray-200 rounded">Cancel</button>}
                </div>
              </form>
            </div>
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border">
              <h2 className="text-xl font-bold mb-6">Your Skills</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {skills.map(s => (
                  <div key={s.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                         <span className="font-bold text-gray-700">{s.name}</span>
                         <span className="text-[10px] uppercase font-bold text-gray-400 bg-white px-1 rounded border">{s.type || 'Dev'}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${s.score}%` }}></div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleEditSkill(s)} className="p-1 text-blue-400 hover:text-blue-600"><Pencil size={14}/></button>
                      <button onClick={() => handleDeleteSkill(s.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- PROFILE (HOME HERO) TAB --- */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl bg-white p-8 rounded-2xl shadow-sm mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Edit Home Hero</h2>
            <form onSubmit={handleSaveHero} className="space-y-6">
              <div className="flex justify-center mb-6">
                <div className="relative group">
                  <img src={heroData.imageUrl || "https://via.placeholder.com/150"} className="w-32 h-32 rounded-full object-cover border-4 border-gray-100 shadow-lg"/>
                  <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition">
                    <span className="text-white text-xs font-bold">Change</span>
                    <input type="file" className="hidden" onChange={e => setHeroImageFile(e.target.files[0])}/>
                  </label>
                </div>
              </div>
              <input value={heroData.name} onChange={e => setHeroData({...heroData, name: e.target.value})} placeholder="Full Name" className="w-full p-3 border rounded-lg bg-gray-50 font-bold text-center text-lg"/>
              <input value={heroData.title} onChange={e => setHeroData({...heroData, title: e.target.value})} placeholder="Job Title" className="w-full p-3 border rounded-lg bg-gray-50 text-center"/>
              <textarea value={heroData.description} onChange={e => setHeroData({...heroData, description: e.target.value})} placeholder="Short Intro Bio" className="w-full p-3 border rounded-lg bg-gray-50 h-32 text-center" />
              <button disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition shadow-lg shadow-blue-200">{loading ? "Saving..." : "Save Changes"}</button>
            </form>
          </div>
        )}

        {/* --- NEW: ABOUT PAGE TAB --- */}
        {activeTab === 'about' && (
          <div className="max-w-4xl bg-white p-8 rounded-2xl shadow-sm mx-auto flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-6">
               <h2 className="text-2xl font-bold">Edit About Page</h2>
               <p className="text-sm text-gray-500">This content appears on the dedicated /about page.</p>
               
               <form onSubmit={handleSaveAbout} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Headline</label>
                    <input 
                      value={aboutData.title} 
                      onChange={e => setAboutData({...aboutData, title: e.target.value})} 
                      placeholder="e.g. A Little About Me" 
                      className="w-full p-3 border rounded-lg bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Bio / Story</label>
                    <textarea 
                      value={aboutData.description} 
                      onChange={e => setAboutData({...aboutData, description: e.target.value})} 
                      placeholder="Tell your story here..." 
                      className="w-full p-3 border rounded-lg bg-gray-50 h-64" 
                    />
                  </div>
                  
                  <button disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition shadow-lg shadow-blue-200">
                    {loading ? "Saving..." : "Save About Page"}
                  </button>
               </form>
            </div>

            {/* Right Side: Image Upload Preview */}
            <div className="w-full md:w-1/3 flex flex-col items-center">
               <label className="block text-sm font-bold text-gray-700 mb-4 self-start">About Photo</label>
               <div className="relative group w-full aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                  {aboutData.imageUrl || aboutImageFile ? (
                    <img 
                      src={aboutImageFile ? URL.createObjectURL(aboutImageFile) : aboutData.imageUrl} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">No Image</span>
                  )}
                  
                  <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition">
                    <span className="text-white font-bold">Upload New</span>
                    <input type="file" className="hidden" onChange={e => setAboutImageFile(e.target.files[0])}/>
                  </label>
               </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;