import { NavLink } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext_helper'
import { useNavigate } from "react-router-dom";
import logo from "../assets/Secure-Hunt-pic-black.png"

function Navbar(){
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    
    return(
        <nav className= "navbar">
            <div className="nav-left">
            <img src={logo} alt="Secure Hunt Logo" className="nav-logo" />
            <span className="website-name">SECURE</span>
            <span className="website-name2">HUNT</span>
            </div>

            <div className="nav-links">
                <NavLink to="/" className={({isActive}) => isActive? "nav-active" : ""}>Home</NavLink>
                <NavLink to="/browser" className={({isActive}) => isActive? "nav-active" : ""}>Browse Bounties</NavLink>
                <NavLink to="/discussion" className={({isActive}) => isActive? "nav-active" : ""}>Forum</NavLink>
                <NavLink to="/report" className={({isActive}) => isActive? "nav-active" : ""}>Submit Report</NavLink>
                {user && (user.role === "company" || user.role === "administrator") && (
                    <Link to="/rate-reports">Reports</Link>
                )}
                <NavLink to="/recommendations" className={({isActive}) => isActive? "nav-active" : ""}>AI Recommendations</NavLink>
                {user ? (
                    <>
                        <span className={`role-badge ${user.role}`}>
                        {user.role.toUpperCase()}
                        </span>

                        <button
                        className="signin-btn"
                        onClick={async () => {
                            await logout();
                            navigate("/");
                          }}
                        >
                        Logout
                        </button>
                    </>
                    ) : (
                    <Link to="/login" className="signin-link">
                        <button className="signin-btn">Sign In</button>
                    </Link>
                    )}
            </div>
        </nav>
    );
}

export default Navbar