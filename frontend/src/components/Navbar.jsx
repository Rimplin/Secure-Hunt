import { NavLink } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useContext, useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { AuthContext } from '../context/AuthContext_helper'
import { useNavigate } from "react-router-dom";
import logo from "../assets/Secure-Hunt-pic-black.png"

function Navbar(){
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const notificationRef = useRef(null);
    const [showNotifications, setShowNotifications] = useState(false);
    const notifications = Array.isArray(user?.notifications) ? user.notifications : [];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    
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
                <NavLink to="/cves" className={({isActive}) => isActive? "nav-active" : ""}>CVE Search</NavLink>
                <NavLink to="/discussion" className={({isActive}) => isActive? "nav-active" : ""}>Forum</NavLink>
                <NavLink to="/report" className={({isActive}) => isActive? "nav-active" : ""}>Submit Report</NavLink>
                {user && (user.role === "company" || user.role === "administrator") && (
                    <NavLink to="/rate-reports" className={({isActive}) => isActive? "nav-active" : ""}>Reports</NavLink>
                )}
                <NavLink to="/recommendations" className={({isActive}) => isActive? "nav-active" : ""}>AI Recommendations</NavLink>
                <div className="nav-actions">
                    {user ? (
                        <span className={`role-badge ${user.role}`}>
                        {user.role.toUpperCase()}
                        </span>
                    ) : null}

                    <div className="notification-wrapper" ref={notificationRef}>
                        <button
                        type="button"
                        className={`notification-btn ${showNotifications ? "active" : ""}`}
                        aria-label="Open notifications"
                        aria-haspopup="dialog"
                        aria-expanded={showNotifications}
                        onClick={() => setShowNotifications((prev) => !prev)}
                        >
                        <Bell size={18} strokeWidth={2.2} />
                        {notifications.length > 0 && (
                            <span className="notification-count">{notifications.length}</span>
                        )}
                        </button>

                        {showNotifications && (
                            <div className="notification-popout" role="dialog" aria-label="Notifications panel">
                                <div className="notification-header">Notifications</div>
                                <div className="notification-body">
                                    {notifications.length > 0 ? (
                                        notifications.map((notification, index) => {
                                            const isObjectNotification = typeof notification === "object" && notification !== null;
                                            const title = isObjectNotification
                                                ? notification.title || notification.message || "Notification"
                                                : notification;
                                            const message = isObjectNotification && notification.message && notification.message !== title
                                                ? notification.message
                                                : "";
                                            const notificationKey = isObjectNotification
                                                ? notification.id || notification._id || `${title}-${index}`
                                                : `${title}-${index}`;

                                            return (
                                                <div key={notificationKey} className="notification-item">
                                                    <p className="notification-title">{title}</p>
                                                    {message && (
                                                        <p className="notification-message">{message}</p>
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="notification-empty">No notifications</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {user ? (
                        <button
                        className="signin-btn"
                        onClick={async () => {
                            await logout();
                            navigate("/");
                          }}
                        >
                        Logout
                        </button>
                    ) : (
                        <Link to="/login" className="signin-link">
                            <button className="signin-btn">Sign In</button>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar