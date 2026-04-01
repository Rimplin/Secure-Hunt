import React, { useState } from 'react';
import axios from 'axios';

const CVESearch = () => {
  const [product, setProduct] = useState('');
  const [cves, setCves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!product.trim()) return;

    setLoading(true);
    setError('');
    setHasSearched(true);
    setCves([]);

    try {
      const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/cves/${encodeURIComponent(product)}`);
      setCves(response.data.cves || []);
    } catch (err) {
      console.error('Error fetching CVEs:', err);
      setError(err.response?.data?.message || 'Failed to fetch vulnerabilities. NVD API might be rate limiting or down.');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityClass = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return 'critical';
      case 'HIGH': return 'high';
      case 'MEDIUM': return 'medium';
      case 'LOW': return 'low';
      default: return 'unknown';
    }
  };

  const getScoreClass = (score) => {
    const num = parseFloat(score);
    if (isNaN(num)) return '';
    if (num >= 7.0) return 'high';
    if (num >= 4.0) return 'medium';
    return 'low';
  };

  return (
    <div className="cve-page">
      <div className="cve-header">
        <h1 className="cve-title">Vulnerability Scanner</h1>
        <p className="cve-subtitle">Enter a software product name to retrieve its known vulnerabilities (CVEs)</p>
      </div>

      <form onSubmit={handleSearch} className="cve-search-form">
        <input
          type="text"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          placeholder="e.g., react, wordpress, apache..."
          className="cve-search-input"
        />
        <button
          type="submit"
          disabled={loading || !product.trim()}
          className="cve-search-button"
        >
          {loading ? (
            <div className="cve-loading-spinner"></div>
          ) : (
            'Scan'
          )}
        </button>
      </form>

      {error && (
        <div className="cve-error-message">
          {error}
        </div>
      )}

      {hasSearched && !loading && !error && cves.length === 0 && (
        <div className="cve-empty-state">
          <svg className="cve-empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p style={{ fontSize: '20px', marginBottom: '8px' }}>No vulnerabilities found for "{product}"</p>
          <p>Try a different search term</p>
        </div>
      )}

      {cves.length > 0 && (
        <div className="cve-grid">
          {cves.map((cve) => {
            const severityClass = getSeverityClass(cve.severity);
            return (
              <div 
                key={cve.id} 
                className={`cve-card severity-${severityClass}`}
              >
                <div className="cve-card-header">
                  <a 
                    href={`https://nvd.nist.gov/vuln/detail/${cve.id}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="cve-id"
                  >
                    {cve.id}
                  </a>
                  <span className={`cve-badge ${severityClass}`}>
                    {cve.severity}
                  </span>
                </div>
                
                <p className="cve-description">
                  {cve.description}
                </p>
                
                <div className="cve-footer">
                  <div className="cve-score">
                    <span>Base Score:</span>
                    <span className={`cve-score-value ${getScoreClass(cve.baseScore)}`}>
                      {cve.baseScore}
                    </span>
                  </div>
                  <div className="cve-date">
                    Published:<br/>
                    {new Date(cve.published).toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CVESearch;
