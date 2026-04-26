import React, { useEffect, useState } from 'react';
import '../styles/SecurityReport.css';

const SecurityReport = ({ projectId, reportData }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(!reportData);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (reportData) {
      setReport(reportData);
      setLoading(false);
      return;
    }

    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/security/report/${projectId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch security report');
        }
        const data = await response.json();
        setReport(data);
      } catch (err) {
        console.error('Error fetching security report:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchReport();
    }
  }, [projectId, reportData]);

  if (loading) {
    return <div className="loading-report">Generating Vulnerability Report from NVD...</div>;
  }

  if (error) {
    return <div className="no-vulns">Could not load security report: {error}</div>;
  }

  if (!report || Object.keys(report.details).length === 0) {
    return <div className="no-vulns">No vulnerability data available for this project's tech stack.</div>;
  }

  const { summary, details } = report;

  return (
    <div className="security-report-container">
      <div className="security-report-header">
        <h2>TechStack Vulnerability Report</h2>
        <span className={`risk-badge risk-${summary.riskLevel.toLowerCase()}`}>
          {summary.riskLevel} RISK
        </span>
      </div>

      <div className="summary-grid">
        <div className="summary-card">
          <span>Total Vulnerabilities</span>
          <strong>{summary.totalVulnerabilities}</strong>
        </div>
        <div className="summary-card">
          <span>High Severity</span>
          <strong style={{ color: '#ff3b30' }}>{summary.highSeverityVulnerabilities}</strong>
        </div>
        <div className="summary-card">
          <span>Generated At</span>
          <strong>{new Date(summary.generatedAt).toLocaleDateString()}</strong>
        </div>
      </div>

      <div className="component-vulnerabilities">
        {Object.entries(details).map(([key, item]) => (
          <div key={key} className="component-section">
            <h3 className="component-title">
              {key.charAt(0).toUpperCase() + key.slice(1)}
              <span>({item.type} {item.version})</span>
            </h3>
            
            {item.cves.length > 0 ? (
              <div className="cve-list">
                {item.cves.map((cve) => (
                  <div key={cve.id} className="cve-item">
                    <div className="cve-header-report">
                      <a 
                        href={cve.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="cve-id"
                        title="View on NVD"
                      >
                        {cve.id} ↗
                      </a>
                      <span className={`cve-severity sev-${cve.severity}`}>
                        {cve.severity} ({cve.baseScore})
                      </span>
                    </div>
                    <p className="cve-desc">{cve.description}</p>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '5px' }}>
                      Published: {new Date(cve.published).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-vulns">No known vulnerabilities found in NVD for this component.</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecurityReport;
