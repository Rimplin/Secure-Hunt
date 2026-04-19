import { NavLink } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useContext, useEffect, useRef, useState } from 'react'
import { Bell, ChevronDown, Menu, X } from 'lucide-react'
import { AuthContext } from '../context/AuthContext_helper'
import { useNavigate } from "react-router-dom";
import logo from "../assets/Secure-Hunt-pic-black.png"

function Navbar() {
    const {
        user,
        logout,
        refreshUser,
        markNotificationsAsRead,
        clearNotifications,
        removeNotification,
    } = useContext(AuthContext);
    const navigate = useNavigate();
    const notificationRef = useRef(null);
    const adminMenuRef = useRef(null);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showAdminMenu, setShowAdminMenu] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNotificationActionLoading, setIsNotificationActionLoading] = useState(false);
    const [lastViewedTimestamp, setLastViewedTimestamp] = useState(null);
    const notifications = Array.isArray(user?.notifications) ? user.notifications : [];
    const notificationViewedStorageKey = user?.email
        ? `notifications:lastViewed:${user.email}`
        : null;

    useEffect(() => {
        if (!notificationViewedStorageKey) {
            setLastViewedTimestamp(null);
            return;
        }

        const saved = window.localStorage.getItem(notificationViewedStorageKey);
        setLastViewedTimestamp(saved ? Number(saved) : null);
    }, [notificationViewedStorageKey]);

    const unreadCount = notifications.filter((notification) => {
        if (notification?.isRead) {
            return false;
        }

        if (!lastViewedTimestamp) {
            return true;
        }

        if (!notification?.createdAt) {
            return false;
        }

        const createdAtMs = new Date(notification.createdAt).getTime();
        return Number.isFinite(createdAtMs) && createdAtMs > lastViewedTimestamp;
    }).length;

    const handleToggleNotifications = async () => {
        const opening = !showNotifications;
        setShowNotifications(opening);

        if (opening && user) {
            const now = Date.now();
            setLastViewedTimestamp(now);

            if (notificationViewedStorageKey) {
                window.localStorage.setItem(notificationViewedStorageKey, String(now));
            }

            setIsNotificationActionLoading(true);
            const markedAsRead = await markNotificationsAsRead();

            if (!markedAsRead) {
                await refreshUser();
            }

            setIsNotificationActionLoading(false);
        }
    };

    const handleClearNotifications = async () => {
        if (!user || notifications.length === 0) {
            return;
        }

        setIsNotificationActionLoading(true);
        await clearNotifications();
        setIsNotificationActionLoading(false);
    };

    const handleRemoveNotification = async (notificationId) => {
        if (!notificationId) {
            return;
        }

        let normalizedNotificationId = notificationId;

        if (typeof notificationId === "object") {
            if (notificationId.$oid) {
                normalizedNotificationId = notificationId.$oid;
            } else if (typeof notificationId.toString === "function") {
                normalizedNotificationId = notificationId.toString();
            }
        }

        if (!normalizedNotificationId || normalizedNotificationId === "[object Object]") {
            return;
        }

        setIsNotificationActionLoading(true);
        const removed = await removeNotification(normalizedNotificationId);

        if (!removed) {
            await refreshUser();
        }
        setIsNotificationActionLoading(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }

            if (adminMenuRef.current && !adminMenuRef.current.contains(event.target)) {
                setShowAdminMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen((prev) => !prev);
    };

    // Close menu when a link is clicked
    const handleLinkClick = () => {
        setIsMobileMenuOpen(false);
        setShowAdminMenu(false);
    };

    const isAdministrator = user?.role === "administrator";

    return (
        <nav className="navbar">
            <div className="nav-left">
                <img src={logo} alt="Secure Hunt Logo" className="nav-logo" />
                <span className="website-name">SECURE</span>
                <span className="website-name2">HUNT</span>
            </div>

            <button
                type="button"
                className="mobile-menu-btn"
                onClick={toggleMobileMenu}
                aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={isMobileMenuOpen}
            >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>

            <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                <div className="nav-links-desktop">
                    <NavLink to="/" onClick={handleLinkClick} className={({ isActive }) => isActive ? "nav-active" : ""}>Home</NavLink>
                    <NavLink to="/browser" onClick={handleLinkClick} className={({ isActive }) => isActive ? "nav-active" : ""}>Browse Bounties</NavLink>
                    <NavLink to="/cves" onClick={handleLinkClick} className={({ isActive }) => isActive ? "nav-active" : ""}>CVE Search</NavLink>
                    <NavLink to="/forum" onClick={handleLinkClick} className={({ isActive }) => isActive ? "nav-active" : ""}>Forum</NavLink>
                    <NavLink to="/report" onClick={handleLinkClick} className={({ isActive }) => isActive ? "nav-active" : ""}>Submit Report</NavLink>
                    {user && (user.role === "company" || user.role === "administrator") && (
                        <NavLink to="/rate-reports" onClick={handleLinkClick} className={({ isActive }) => isActive ? "nav-active" : ""}>Reports</NavLink>
                    )}
                    <NavLink to="/recommendations" onClick={handleLinkClick} className={({ isActive }) => isActive ? "nav-active" : ""}>AI Recommendations</NavLink>
                    {isAdministrator && (
                        <div className="admin-menu" ref={adminMenuRef}>
                            <button
                                type="button"
                                className={`admin-menu-btn ${showAdminMenu ? "nav-active" : ""}`}
                                onClick={() => setShowAdminMenu((prev) => !prev)}
                                aria-haspopup="menu"
                                aria-expanded={showAdminMenu}
                            >
                                Admin
                                <ChevronDown size={14} />
                            </button>

                            {showAdminMenu && (
                                <div className="admin-menu-popout" role="menu" aria-label="Admin menu">
                                    <NavLink
                                        to="/profile"
                                        onClick={handleLinkClick}
                                        className={({ isActive }) => isActive ? "nav-active" : ""}
                                    >
                                        Profile
                                    </NavLink>
                                    <NavLink
                                        to="/admin/users"
                                        onClick={handleLinkClick}
                                        className={({ isActive }) => isActive ? "nav-active" : ""}
                                    >
                                        User Role Management
                                    </NavLink>
                                </div>
                            )}
                        </div>
                    )}
                    {user && !isAdministrator && (
                        <NavLink to="/profile" onClick={handleLinkClick} className={({ isActive }) => isActive ? "nav-active" : ""}>Profile</NavLink>
                    )}
                </div>
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
                            onClick={handleToggleNotifications}
                        >
                            <Bell size={18} strokeWidth={2.2} />
                            {!showNotifications && unreadCount > 0 && (
                                <span className="notification-count">{unreadCount}</span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="notification-popout" role="dialog" aria-label="Notifications panel">
                                <div className="notification-header">
                                    <span>Notifications</span>
                                    <button
                                        type="button"
                                        className="notification-clear-btn"
                                        onClick={handleClearNotifications}
                                        disabled={isNotificationActionLoading || notifications.length === 0}
                                    >
                                        Clear all
                                    </button>
                                </div>
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
                                            const notificationId = isObjectNotification
                                                ? notification._id || notification.id
                                                : null;
                                            const notificationKey = isObjectNotification
                                                ? notificationId || `${title}-${index}`
                                                : `${title}-${index}`;
                                            const createdAt = isObjectNotification && notification.createdAt
                                                ? new Date(notification.createdAt).toLocaleString()
                                                : "";

                                            return (
                                                <div key={notificationKey} className="notification-item">
                                                    {notificationId && (
                                                        <button
                                                            type="button"
                                                            className="notification-remove-btn"
                                                            aria-label="Remove notification"
                                                            title="Remove notification"
                                                            disabled={isNotificationActionLoading}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveNotification(notificationId);
                                                            }}
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    )}
                                                    <p className="notification-title">{title}</p>
                                                    {message && (
                                                        <p className="notification-message">{message}</p>
                                                    )}
                                                    {createdAt && (
                                                        <p className="notification-time">{createdAt}</p>
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
                                handleLinkClick();
                            }}
                        >
                            Logout
                        </button>
                    ) : (
                        <Link to="/login" onClick={handleLinkClick} className="signin-link">
                            <button className="signin-btn">Sign In</button>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar