import { Link } from 'react-router-dom'
import logo from "../assets/Secure-Hunt-pic-black.png"
function Navbar(){
    return(
        <nav className= "navbar">
            <div className="nav-left">
            <img src={logo} alt="Secure Hunt Logo" className="nav-logo" />
            <span className="website-name">SECURE</span>
            <span className="website-name2">HUNT</span>
            </div>

            <div className="nav-links">
                <Link to="/">Home </Link>
                <Link to="/browser">Browse Bounties</Link>
                <button className="signin-btn">Sign In</button>
            </div>
        </nav>
    );
}

export default Navbar