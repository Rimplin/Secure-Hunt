import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import HomePage from './pages/HomePage.jsx'
import Footer from './components/Footer.jsx'
import BountyBrowser from './pages/BountyBrowser.jsx'
import ProjectDetails from './pages/ProjectDetails.jsx'
function App() { 
   return(
      <div className="app-container">
      <Navbar/>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/browser" element={<BountyBrowser/>}/>
        <Route path="/projects/:id" element={<ProjectDetails />}/>
      </Routes>
      
      <Footer/>
      </div>
    
  );
}

export default App