// src/App.jsx
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import ProjectsPage from './pages/ProjectsPage';
import ExperiencePage from './pages/ExperiencePage';
import Footer from './components/Footer';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import BekasBryant from "./pages/BekasBryant";
import BookkeepingLogin from './pages/BookkeepingLogin';
import BookkeepingInput from './pages/BookkeepingInput';
import BookkeepingData from './pages/BookkeepingData';

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith('/bekasbryant') || location.pathname.startsWith('/bookkeeping');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {!hideNavbar && <Navbar />}

      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/experience" element={<ExperiencePage />} />

          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/experience" element={<ExperiencePage />} />

          <Route path="/bekasbryant" element={<BekasBryant />} />
          <Route path="/bekasbryant/:productId" element={<BekasBryant />} />
          
          {/* bookkeeping site */}
          <Route path="/bookkeeping-login" element={<BookkeepingLogin />} />
          <Route path="/bookkeeping" element={<ProtectedRoute><BookkeepingInput /></ProtectedRoute>} />
          <Route path="/bookkeeping/data" element={<ProtectedRoute><BookkeepingData /></ProtectedRoute>} />

          {/* Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Admin Route */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

  function App() {
    return (
      <Router>
        <AppContent />
      </Router>
    );
  }

export default App;