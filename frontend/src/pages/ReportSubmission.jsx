import { useEffect, useState, useRef, useContext } from 'react'
import { AlertCircle, Paperclip, Send, CheckCircle, XCircle, X, ShieldOff } from 'lucide-react'
import { AuthContext } from '../context/AuthContext_helper'
import '../styles/ReportSubmission.css'

function ReportSubmission() {
  const { user } = useContext(AuthContext)
  const [projects, setProjects] = useState([])
  const [form, setForm] = useState({
    projectId: '',
    title: '',
    severity: '',
    description: '',
  })
  const [files, setFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null) // { type: 'success'|'error', message: '' }
  const fileInputRef = useRef(null)

  // Fetch real projects for the dropdown
  useEffect(() => {
    fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/projects`)
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch(() => setProjects([]))
  }, [])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }))
  }

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files))
  }

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setFeedback(null)

    try {
      const formData = new FormData()
      formData.append('projectId', form.projectId)
      formData.append('title', form.title)
      formData.append('severity', form.severity)
      formData.append('description', form.description)
      files.forEach((file) => formData.append('attachments', file))

      const res = await fetch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/reports`,
        { method: 'POST', body: formData, credentials: 'include' }
      )

      const data = await res.json()

      if (!res.ok) throw new Error(data.message || 'Submission failed')

      setFeedback({ type: 'success', message: '✅ Report submitted successfully! Thank you for helping secure the ecosystem.' })
      // Reset form
      setForm({ projectId: '', title: '', severity: '', description: '' })
      setFiles([])
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      setFeedback({ type: 'error', message: `❌ ${err.message}` })
    } finally {
      setSubmitting(false)
    }
  }

  if (user?.role === 'company') {
    return (
      <div className="report-container">
        <div className="report-header">
          <ShieldOff size={32} className="report-icon" />
          <h2>Access Restricted</h2>
          <p>Report submission is not available for company accounts.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="report-container">
      <div className="report-header">
        <AlertCircle size={32} className="report-icon" />
        <h2>Submit a Vulnerability Report</h2>
        <p>Help secure the web by reporting vulnerabilities responsibly</p>
      </div>

      {feedback && (
        <div className={`feedback-banner ${feedback.type}`}>
          {feedback.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="report-content">
        <form className="report-form" onSubmit={handleSubmit}>

          <div className="form-section">
            <label htmlFor="projectId">Select Project *</label>
            <select id="projectId" value={form.projectId} onChange={handleChange} required>
              <option value="">Choose a project...</option>
              {Array.isArray(projects) && projects.map((proj) => (
                <option key={proj._id} value={proj._id}>
                  {proj.name} — {proj.bounty}
                </option>
              ))}
            </select>
          </div>

          <div className="form-section">
            <label htmlFor="title">Vulnerability Title *</label>
            <input
              type="text"
              id="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Brief description of the issue"
              required
            />
          </div>

          <div className="form-section">
            <label htmlFor="severity">Severity Level *</label>
            <select id="severity" value={form.severity} onChange={handleChange} required>
              <option value="">Select severity...</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="form-section">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Detailed description of the vulnerability, steps to reproduce, and impact"
              rows="6"
              required
            />
          </div>

          <div className="form-section">
            <label>Attachments (screenshots, POC, etc.)</label>
            <div className="file-upload" onClick={() => fileInputRef.current?.click()}>
              <Paperclip size={20} />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                accept="image/*,.pdf,.txt,.zip,.doc,.docx"
              />
              <p>Click to browse files (max 5, 10MB each)</p>
            </div>

            {files.length > 0 && (
              <div className="file-list">
                {files.map((file, i) => (
                  <div key={i} className="file-item">
                    <span>{file.name}</span>
                    <button type="button" className="remove-file" onClick={() => removeFile(i)}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="submit-btn" disabled={submitting}>
            <Send size={18} />
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ReportSubmission
