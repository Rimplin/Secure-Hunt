import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Shield, Award, TrendingUp, FileText, Calendar, ChevronRight } from 'lucide-react'
import { AuthContext } from '../context/AuthContext_helper'
import '../styles/DeveloperProfile.css'

const BASE = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL

const SEVERITY_COLORS = {
    critical: '#ff3b30',
    high: '#ff9500',
    medium: '#ffcc00',
    low: '#34c759',
}

const STATUS_COLORS = {
    pending:  '#f59e0b',
    reviewed: '#3b82f6', // sleek blue
    accepted: '#34c759',
    rejected: '#ff3b30',
}

export default function DeveloperProfile() {
    const { user, loading: authLoading } = useContext(AuthContext)
    const navigate = useNavigate()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [filterStatus, setFilterStatus] = useState('all')
    const [sortBy, setSortBy] = useState('newest')

    useEffect(() => {
        if (authLoading) return
        if (!user) return

        const fetchProfile = async () => {
            try {
                const res = await fetch(`${BASE}/api/developers/${user._id}/profile`, {
                    credentials: 'include',
                    cache: 'no-store',
                })
                if (!res.ok) {
                    const data = await res.json()
                    throw new Error(data.message || 'Failed to load profile')
                }
                const data = await res.json()
                setProfile(data)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [user, authLoading])

    // --- Loading state ---
    if (authLoading || loading) {
        return (
            <div className="dp-loading">
                <div className="dp-spinner" />
                <p>Loading profile...</p>
            </div>
        )
    }

    // --- Not logged in ---
    if (!user) {
        return (
            <div className="dp-denied">
                <Shield size={48} />
                <h2>Please Log In</h2>
                <p>You need to be logged in to view your developer profile.</p>
                <button className="dp-login-btn" onClick={() => navigate('/login')}>
                    Go to Login
                </button>
            </div>
        )
    }

    // --- Error ---
    if (error) {
        return (
            <div className="dp-error">
                <p>Error: {error}</p>
            </div>
        )
    }

    if (!profile) return null

    const displayReports = (profile.allReports || profile.acceptedReports || [])
        .filter(r => filterStatus === 'all' || r.status === filterStatus)
        .sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            if (sortBy === 'highest_rating') return (b.rating || 0) - (a.rating || 0);
            if (sortBy === 'severity') {
                const sevWeight = { critical: 4, high: 3, medium: 2, low: 1 };
                return (sevWeight[b.severity] || 0) - (sevWeight[a.severity] || 0);
            }
            return 0;
        });

    return (
        <div className="dp-container">
            {/* Profile Header */}
            <div className="dp-header">
                <div className="dp-avatar">
                    {profile.email?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="dp-header-info">
                    <h1 className="dp-username">{profile.email}</h1>
                    <span className={`dp-role-badge ${profile.role}`}>
                        {profile.role?.toUpperCase()}
                    </span>
                </div>
                <div className="dp-header-glow" />
            </div>

            {/* Stats Section */}
            <div className="dp-stats">
                <div className="dp-stat-card">
                    <div className="dp-stat-icon dp-stat-icon-reports">
                        <FileText size={24} />
                    </div>
                    <div className="dp-stat-num">{profile.totalReportsCount || profile.acceptedReportsCount || 0}</div>
                    <div className="dp-stat-label">Total Submissions</div>
                </div>

                <div className="dp-stat-card">
                    <div className="dp-stat-icon dp-stat-icon-avg">
                        <Star size={24} />
                    </div>
                    <div className="dp-stat-num">
                        {profile.averageRating > 0 ? profile.averageRating.toFixed(1) : '—'}
                    </div>
                    <div className="dp-stat-label">Average Rating</div>
                </div>

                <div className="dp-stat-card">
                    <div className="dp-stat-icon dp-stat-icon-total">
                        <TrendingUp size={24} />
                    </div>
                    <div className="dp-stat-num">{profile.totalRatingPoints}</div>
                    <div className="dp-stat-label">Total Rating Points</div>
                </div>

                <div className="dp-stat-card">
                    <div className="dp-stat-icon dp-stat-icon-credibility">
                        <Award size={24} />
                    </div>
                    <div className="dp-stat-num">
                        {profile.acceptedReportsCount >= 5
                            ? 'Elite'
                            : profile.acceptedReportsCount >= 3
                                ? 'Rising'
                                : profile.acceptedReportsCount >= 1
                                    ? 'Starter'
                                    : 'New'}
                    </div>
                    <div className="dp-stat-label">Credibility Tier</div>
                </div>
            </div>

            {/* All Submitted Reports */}
            <div className="dp-reports-section">
                <div className="dp-section-header">
                    <h2 className="dp-section-title">
                        <Shield size={20} />
                        Submitted Reports
                    </h2>
                    
                    <div className="dp-filters">
                        <select 
                            className="dp-select"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                        </select>

                        <select 
                            className="dp-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="highest_rating">Highest Rated</option>
                            <option value="severity">Highest Severity</option>
                        </select>
                    </div>
                </div>

                {displayReports.length === 0 ? (
                    <div className="dp-empty">
                        <FileText size={48} />
                        <h3>No Reports Found</h3>
                        <p>{filterStatus !== 'all' ? 'Try changing your status filter.' : 'Submit vulnerability reports to build your credibility.'}</p>
                        <button className="dp-submit-btn" onClick={() => navigate('/report')}>
                            Submit a Report
                        </button>
                    </div>
                ) : (
                    <div className="dp-reports-grid">
                        {displayReports.map((report) => (
                            <div key={report._id} className="dp-report-card">
                                <div className="dp-report-top">
                                    <div className="dp-report-title-wrap">
                                        <h3 className="dp-report-title">{report.title}</h3>
                                        <p className="dp-report-project">
                                            📁 {report.projectId?.name || 'Unknown Project'}
                                        </p>
                                    </div>
                                    <div className="dp-report-badges">
                                        <span
                                            className="dp-status-badge"
                                            style={{ background: STATUS_COLORS[report.status] }}
                                        >
                                            {report.status}
                                        </span>
                                        <span
                                            className="dp-severity-badge"
                                            style={{ background: SEVERITY_COLORS[report.severity] }}
                                        >
                                            {report.severity}
                                        </span>
                                    </div>
                                </div>

                                <p className="dp-report-description">{report.description}</p>

                                <div className="dp-report-footer">
                                    <div className="dp-report-rating">
                                        {report.status === 'accepted' && report.rating ? (
                                            <>
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={14}
                                                        fill={i < report.rating ? '#fbbf24' : 'none'}
                                                        color={i < report.rating ? '#fbbf24' : '#4b5563'}
                                                    />
                                                ))}
                                                <span className="dp-rating-value">{report.rating}.0</span>
                                            </>
                                        ) : report.status === 'accepted' ? (
                                            <span className="dp-no-rating">Not rated yet</span>
                                        ) : null}
                                    </div>

                                    <div className="dp-report-date">
                                        <Calendar size={12} />
                                        {new Date(report.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                {report.projectId?.bounty && report.status === 'accepted' && (
                                    <div className="dp-bounty-tag">
                                        <span>{report.projectId.bounty}</span>
                                        <ChevronRight size={14} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
