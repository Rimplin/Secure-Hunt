import { AlertCircle, Paperclip, Send } from 'lucide-react'
import '../styles/ReportSubmission.css'

function ReportSubmission() {
  return (
    <div className="report-container">
      <div className="report-header">
        <AlertCircle size={32} className="report-icon" />
        <h2>Submit a Vulnerability Report</h2>
        <p>Help secure the web by reporting vulnerabilities responsibly</p>
      </div>

      <div className="report-content">
        <form className="report-form">
          <div className="form-section">
            <label htmlFor="project">Select Project *</label>
            <select id="project" required>
              <option value="">Choose a project...</option>
              <option value="">Project 1</option>
              <option value="">Project 2</option>
            </select>
          </div>

          <div className="form-section">
            <label htmlFor="title">Vulnerability Title *</label>
            <input 
              type="text" 
              id="title" 
              placeholder="Brief description of the issue"
              required 
            />
          </div>

          <div className="form-section">
            <label htmlFor="severity">Severity Level *</label>
            <select id="severity" required>
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
              placeholder="Detailed description of the vulnerability, steps to reproduce, and impact"
              rows="6"
              required
            ></textarea>
          </div>

          <div className="form-section">
            <label htmlFor="attachments">Attachments (POC, screenshots, etc.)</label>
            <div className="file-upload">
              <Paperclip size={20} />
              <input type="file" id="attachments" multiple />
              <p>Drag and drop files or click to browse</p>
            </div>
          </div>

          <button type="submit" className="submit-btn">
            <Send size={18} />
            Submit Report
          </button>
        </form>

        <div className="feature-notice">
          <p>📋 Full report management system coming in Sprint 3</p>
        </div>
      </div>
    </div>
  )
}

export default ReportSubmission
