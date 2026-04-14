import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import HomePage from './pages/HomePage.jsx'
import Footer from './components/Footer.jsx'
import BountyBrowser from './pages/BountyBrowser.jsx'
import ProjectDetails from './pages/ProjectDetails.jsx'
import Login from './pages/Login.jsx'
import SignUp from './pages/SignUp.jsx'
import ReportSubmission from './pages/ReportSubmission.jsx'
import ReportRating from './pages/ReportRating.jsx'
import AIRecommendations from './pages/AIRecommendations.jsx'
import Forum from './pages/Forum.jsx'
import CreateProject from './pages/CreateProject.jsx'
import CVESearch from './pages/CVESearch.jsx'
import DeveloperProfile from './pages/DeveloperProfile.jsx'

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/browser" element={<BountyBrowser />} />
        <Route path="/projects/:id" element={<ProjectDetails />} />
        <Route path="/cves" element={<CVESearch />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/report" element={<ReportSubmission />} />
        <Route path="/rate-reports" element={<ReportRating />} />
        <Route path="/recommendations" element={<AIRecommendations />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/create" element={<CreateProject />} />
        <Route path="/profile" element={<DeveloperProfile />} />
      </Routes>

      <Footer />
    </div>

  );
}

export default App