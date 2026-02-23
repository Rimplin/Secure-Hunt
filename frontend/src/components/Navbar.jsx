import { Link } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext_helper'
import logo from "../assets/Secure-Hunt-pic-black.png"

function Navbar(){
    const { user } = useContext(AuthContext)
    
    return(
        <nav className= "navbar">
            <div className="nav-left">
            <img src={logo} alt="Secure Hunt Logo" className="nav-logo" />
            <span className="website-name">SECURE</span>
            <span className="website-name2">HUNT</span>
            </div>

            <div className="nav-links">
                <Link to="/">Home</Link>
                <Link to="/browser">Browse Bounties</Link>
                <Link to="/discussion">Forum</Link>
                <Link to="/report">Submit Report</Link>
                {user && user.role === 'company' && (
                    <Link to="/rate-reports">Reports</Link>
                )}
                <Link to="/recommendations">AI Recommendations</Link>
                <Link to="/login" className="signin-link">
                    <button className="signin-btn">Sign In</button>
                </Link>
            </div>
        </nav>
    );
}

export default Navbar