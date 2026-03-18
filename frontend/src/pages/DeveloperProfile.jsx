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

export default function DeveloperProfile() {
    const { user, loading: authLoading } = useContext(AuthContext)
    const navigate = useNavigate()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (authLoading) return
        if (!user) return

        const fetchProfile = async () => {
            try {
                const res = await fetch(`${BASE}/api/developers/${user._id}/profile`, {
                    credentials: 'include',
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
                    <div className="dp-stat-num">{profile.acceptedReportsCount}</div>
                    <div className="dp-stat-label">Accepted Reports</div>
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

            {/* Accepted Reports Section */}
            <div className="dp-reports-section">
                <h2 className="dp-section-title">
                    <Shield size={20} />
                    Accepted Reports
                </h2>

                {profile.acceptedReports.length === 0 ? (
                    <div className="dp-empty">
                        <FileText size={48} />
                        <h3>No Accepted Reports Yet</h3>
                        <p>Submit vulnerability reports to build your credibility.</p>
                        <button className="dp-submit-btn" onClick={() => navigate('/report')}>
                            Submit a Report
                        </button>
                    </div>
                ) : (
                    <div className="dp-reports-grid">
                        {profile.acceptedReports.map((report) => (
                            <div key={report._id} className="dp-report-card">
                                <div className="dp-report-top">
                                    <div className="dp-report-title-wrap">
                                        <h3 className="dp-report-title">{report.title}</h3>
                                        <p className="dp-report-project">
                                            📁 {report.projectId?.name || 'Unknown Project'}
                                        </p>
                                    </div>
                                    <span
                                        className="dp-severity-badge"
                                        style={{ background: SEVERITY_COLORS[report.severity] }}
                                    >
                                        {report.severity}
                                    </span>
                                </div>

                                <p className="dp-report-description">{report.description}</p>

                                <div className="dp-report-footer">
                                    <div className="dp-report-rating">
                                        {report.rating ? (
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
                                        ) : (
                                            <span className="dp-no-rating">Not rated yet</span>
                                        )}
                                    </div>

                                    <div className="dp-report-date">
                                        <Calendar size={12} />
                                        {new Date(report.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                {report.projectId?.bounty && (
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
