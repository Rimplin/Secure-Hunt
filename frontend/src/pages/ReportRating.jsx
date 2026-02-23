import { useState, useEffect, useContext } from 'react'
import { Star, ShieldAlert, Clock, CheckCircle, XCircle, Eye } from 'lucide-react'
import { AuthContext } from '../context/AuthContext_helper'
import '../styles/ReportRating.css'

const BASE = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL

const SEVERITY_COLORS = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#ca8a04',
  low: '#16a34a',
}

const STATUS_META = {
  pending: { color: '#ca8a04', bg: '#fefce8', icon: <Clock size={12} /> },
  reviewed: { color: '#3b82f6', bg: '#eff6ff', icon: <Eye size={12} /> },
  accepted: { color: '#16a34a', bg: '#f0fdf4', icon: <CheckCircle size={12} /> },
  rejected: { color: '#dc2626', bg: '#fef2f2', icon: <XCircle size={12} /> },
}

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={22}
          className="star"
          fill={s <= (hover || value) ? '#fbbf24' : 'none'}
          color={s <= (hover || value) ? '#fbbf24' : '#4b5563'}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
        />
      ))}
    </div>
  )
}

export default function ReportRating() {
  const { user, loading: authLoading } = useContext(AuthContext)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [ratingFor, setRatingFor] = useState(null)   // report id being rated
  const [saving, setSaving] = useState({})     // { [id]: true }

  // --- fetch reports ---
  useEffect(() => {
    if (authLoading) return
    if (!user || (user.role !== 'company' && user.role !== 'administrator')) return

    const load = async () => {
      try {
        const res = await fetch(`${BASE}/api/reports`, { credentials: 'include' })
        if (!res.ok) throw new Error('Failed to load reports')
        const data = await res.json()
        setReports(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user, authLoading])

  // --- rate a report ---
  const handleRate = async (id, stars) => {
    setSaving((s) => ({ ...s, [id]: true }))
    try {
      const res = await fetch(`${BASE}/api/reports/${id}/rate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rating: stars }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setReports((prev) => prev.map((r) => (r._id === id ? { ...r, rating: stars, ratedAt: new Date() } : r)))
      setRatingFor(null)
    } catch (err) {
      alert('Error saving rating: ' + err.message)
    } finally {
      setSaving((s) => ({ ...s, [id]: false }))
    }
  }

  // --- update status ---
  const handleStatus = async (id, status) => {
    setSaving((s) => ({ ...s, [id]: true }))
    try {
      const res = await fetch(`${BASE}/api/reports/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setReports((prev) => prev.map((r) => (r._id === id ? { ...r, status } : r)))
    } catch (err) {
      alert('Error updating status: ' + err.message)
    } finally {
      setSaving((s) => ({ ...s, [id]: false }))
    }
  }

  // --- access guard ---
  if (authLoading) {
    return <div className="cr-loading"><div className="cr-spinner" />Loading...</div>
  }

  if (!user || (user.role !== 'company' && user.role !== 'administrator')) {
    return (
      <div className="cr-denied">
        <ShieldAlert size={48} />
        <h2>Access Denied</h2>
        <p>This page is only accessible to company and administrator accounts.</p>
      </div>
    )
  }

  if (loading) return <div className="cr-loading"><div className="cr-spinner" />Loading reports...</div>
  if (error) return <div className="cr-loading" style={{ color: '#dc2626' }}>Error: {error}</div>

  // --- filter ---
  const visible = reports.filter((r) => {
    const okSev = filterSeverity === 'all' || r.severity === filterSeverity
    const okSta = filterStatus === 'all' || r.status === filterStatus
    return okSev && okSta
  })

  const total = reports.length
  const pending = reports.filter((r) => r.status === 'pending').length
  const accepted = reports.filter((r) => r.status === 'accepted').length
  const avgRating = (() => {
    const rated = reports.filter((r) => r.rating)
    return rated.length ? (rated.reduce((s, r) => s + r.rating, 0) / rated.length).toFixed(1) : '—'
  })()

  return (
    <div className="cr-container">

      {/* Header */}
      <div className="cr-header">
        <Star size={36} className="cr-header-icon" />
        <h2>Company Reports Dashboard</h2>
        <p>Review and manage vulnerability reports submitted to your projects</p>
      </div>

      {/* Stats */}
      <div className="cr-stats">
        <div className="cr-stat-card cr-stat-total">
          <div className="cr-stat-num">{total}</div>
          <div className="cr-stat-label">Total Reports</div>
        </div>
        <div className="cr-stat-card cr-stat-pending">
          <div className="cr-stat-num">{pending}</div>
          <div className="cr-stat-label">Pending</div>
        </div>
        <div className="cr-stat-card cr-stat-accepted">
          <div className="cr-stat-num">{accepted}</div>
          <div className="cr-stat-label">Accepted</div>
        </div>
        <div className="cr-stat-card cr-stat-rating">
          <div className="cr-stat-num">{avgRating}</div>
          <div className="cr-stat-label">Avg Rating</div>
        </div>
      </div>

      {/* Empty */}
      {reports.length === 0 && (
        <div className="cr-empty">
          <ShieldAlert size={40} />
          <p>No reports submitted yet.</p>
        </div>
      )}

      {/* Cards */}
      <div className="cr-grid">
        {reports.map((report) => {
          const meta = STATUS_META[report.status] || STATUS_META.pending
          const isSaving = saving[report._id]

          return (
            <div key={report._id} className="cr-card">

              {/* Card top */}
              <div className="cr-card-top">
                <div className="cr-card-title-wrap">
                  <h3>{report.title}</h3>
                  <p className="cr-project-name">📁 {report.projectId?.name || 'Unknown Project'}</p>
                  <p className="cr-submitted-by">
                    by {report.submittedBy?.email || 'Anonymous'} &bull;{' '}
                    {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="cr-severity-badge" style={{ background: SEVERITY_COLORS[report.severity] }}>
                  {report.severity}
                </span>
              </div>

              {/* Description */}
              <p className="cr-description">{report.description}</p>

              {/* Status control */}
              <div className="cr-status-row">
                <span className="cr-status-badge" style={{ color: meta.color, background: meta.bg }}>
                  {meta.icon} {report.status}
                </span>
                <select
                  className="cr-status-select"
                  value={report.status}
                  disabled={isSaving}
                  onChange={(e) => handleStatus(report._id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Rating */}
              <div className="cr-rating-area">
                {ratingFor === report._id ? (
                  <div className="cr-rating-picker">
                    <span>Select a rating:</span>
                    <StarPicker value={report.rating || 0} onChange={(s) => handleRate(report._id, s)} />
                    <button className="cr-cancel-btn" onClick={() => setRatingFor(null)}>Cancel</button>
                  </div>
                ) : (
                  <div className="cr-rating-display">
                    {report.rating ? (
                      <>
                        <div className="cr-stars-row">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={16}
                              fill={i < report.rating ? '#fbbf24' : 'none'}
                              color="#fbbf24"
                            />
                          ))}
                          <span className="cr-rating-val">{report.rating}.0 / 5</span>
                        </div>
                        <button className="cr-rate-btn" onClick={() => setRatingFor(report._id)}>
                          Update Rating
                        </button>
                      </>
                    ) : (
                      <button className="cr-rate-btn cr-rate-btn-new" onClick={() => setRatingFor(report._id)}>
                        <Star size={15} /> Rate Report
                      </button>
                    )}
                  </div>
                )}
              </div>

            </div>
          )
        })}
      </div>
    </div>
  )
}
