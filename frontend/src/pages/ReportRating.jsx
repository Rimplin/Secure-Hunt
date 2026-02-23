import { useState, useEffect, useContext } from 'react'
import { Star, MessageSquare } from 'lucide-react'
import { AuthContext } from '../context/AuthContext_helper'
import '../styles/ReportRating.css'

function ReportRating() {
  const { user } = useContext(AuthContext)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [hoverRating, setHoverRating] = useState({})
  const [selectedReport, setSelectedReport] = useState(null)

  useEffect(() => {
    // Mock data - simulating reports from API
    const mockReports = [
      {
        _id: '1',
        title: 'SQL Injection Vulnerability in Login Form',
        severity: 'critical',
        description: 'Found SQL injection in the login form that allows bypassing authentication',
        submittedBy: { email: 'hunter1@example.com' },
        rating: 5,
        ratedAt: new Date('2024-02-20'),
        status: 'approved'
      },
      {
        _id: '2',
        title: 'XSS Attack in Comment Section',
        severity: 'high',
        description: 'Stored XSS vulnerability allows injecting malicious scripts in comments',
        submittedBy: { email: 'hunter2@example.com' },
        rating: 4,
        ratedAt: new Date('2024-02-19'),
        status: 'approved'
      },
      {
        _id: '3',
        title: 'Missing CSRF Token Protection',
        severity: 'high',
        description: 'API endpoints do not validate CSRF tokens on state-changing operations',
        submittedBy: { email: 'hunter3@example.com' },
        rating: null,
        status: 'pending'
      },
      {
        _id: '4',
        title: 'Weak Password Policy',
        severity: 'medium',
        description: 'System allows passwords shorter than 8 characters',
        submittedBy: { email: 'hunter4@example.com' },
        rating: 3,
        ratedAt: new Date('2024-02-18'),
        status: 'approved'
      },
    ]
    setReports(mockReports)
    setLoading(false)
  }, [])

  const handleRating = (reportId, stars) => {
    // Update the rating for a report
    const updatedReports = reports.map((report) => {
      if (report._id === reportId) {
        return {
          ...report,
          rating: stars,
          ratedAt: new Date(),
        }
      }
      return report
    })
    setReports(updatedReports)
    setSelectedReport(null)
  }

  const getSeverityColor = (severity) => {
    const colors = {
      critical: '#dc2626',
      high: '#ea580c',
      medium: '#ca8a04',
      low: '#16a34a',
    }
    return colors[severity] || '#6b7280'
  }

  const getStatusBadge = (status) => {
    const statuses = {
      pending: '#ca8a04',
      'under-review': '#3b82f6',
      approved: '#16a34a',
      rejected: '#dc2626',
    }
    return statuses[status] || '#6b7280'
  }

  if (loading) {
    return <div className="rating-loading">Loading reports...</div>
  }

  return (
    <div className="rating-container">
      <div className="rating-header">
        <Star size={32} className="rating-icon" />
        <h2>Rate Vulnerability Reports</h2>
        <p>Help reward high-quality security research by rating submitted reports</p>
      </div>

      <div className="rating-stats">
        <div className="stat-card">
          <div className="stat-number">{reports.length}</div>
          <div className="stat-label">Total Reports</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{reports.filter((r) => r.rating).length}</div>
          <div className="stat-label">Rated</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {reports.filter((r) => r.rating)
              ? (
                  reports.reduce((sum, r) => sum + (r.rating || 0), 0) /
                  (reports.filter((r) => r.rating).length || 1)
                ).toFixed(1)
              : 'N/A'}
          </div>
          <div className="stat-label">Avg Rating</div>
        </div>
      </div>

      <div className="reports-grid">
        {reports.map((report) => (
          <div key={report._id} className="report-card">
            <div className="card-header">
              <div>
                <h3>{report.title}</h3>
                <p className="email-text">by {report.submittedBy.email}</p>
              </div>
              <div className="card-badges">
                <span
                  className="severity-badge"
                  style={{ backgroundColor: getSeverityColor(report.severity) }}
                >
                  {report.severity}
                </span>
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusBadge(report.status) }}
                >
                  {report.status}
                </span>
              </div>
            </div>

            <div className="card-description">
              <p>{report.description}</p>
            </div>

            <div className="card-rating">
              {selectedReport === report._id ? (
                <div className="rating-selector">
                  <span>Rate this report:</span>
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={24}
                        className="star"
                        fill={star <= (hoverRating[report._id] || 0) ? '#fbbf24' : 'none'}
                        color={star <= (hoverRating[report._id] || 0) ? '#fbbf24' : '#d1d5db'}
                        onMouseEnter={() => setHoverRating({ ...hoverRating, [report._id]: star })}
                        onMouseLeave={() => setHoverRating({ ...hoverRating, [report._id]: 0 })}
                        onClick={() => handleRating(report._id, star)}
                      />
                    ))}
                  </div>
                  <button
                    className="cancel-btn"
                    onClick={() => setSelectedReport(null)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="rating-display">
                  {report.rating ? (
                    <>
                      <div className="rating-value">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={18}
                            fill={i < report.rating ? '#fbbf24' : 'none'}
                            color="#fbbf24"
                          />
                        ))}
                      </div>
                      <span className="rating-text">{report.rating}.0 / 5.0</span>
                      <span className="rating-date">
                        Rated on {report.ratedAt ? new Date(report.ratedAt).toLocaleDateString() : 'N/A'}
                      </span>
                      <button
                        className="rate-btn"
                        onClick={() => setSelectedReport(report._id)}
                      >
                        Update Rating
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="no-rating">Not rated yet</p>
                      <button
                        className="rate-btn"
                        onClick={() => setSelectedReport(report._id)}
                      >
                        <Star size={18} />
                        Rate Now
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="rating-info">
        <MessageSquare size={20} />
        <p>
          <strong>Rating Guide:</strong> 5⭐ = Excellent research with clear POC | 4⭐ = Good quality findings |
          3⭐ = Acceptable findings | 2⭐ = Basic findings | 1⭐ = Low quality findings
        </p>
      </div>
    </div>
  )
}

export default ReportRating
