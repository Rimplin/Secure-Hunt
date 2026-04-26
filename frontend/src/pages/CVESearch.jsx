import React, { useState } from 'react';
import axios from 'axios';
import SecurityReport from '../components/SecurityReport';
import AITestingGuidance from '../components/AITestingGuidance';

const CVESearch = () => {
  const [searchMode, setSearchMode] = useState('product'); // 'product' or 'url'
  const [product, setProduct] = useState('');
  const [url, setUrl] = useState('');
  
  const [cves, setCves] = useState([]);
  const [urlScanData, setUrlScanData] = useState(null); // { techStack, securityReport, aiGuidance }
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchMode === 'product' && !product.trim()) return;
    if (searchMode === 'url' && !url.trim()) return;

    setLoading(true);
    setError('');
    setHasSearched(true);
    setCves([]);
    setUrlScanData(null);

    try {
      if (searchMode === 'product') {
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/cves/${encodeURIComponent(product)}`);
        setCves(response.data.cves || []);
      } else {
        const response = await axios.post(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/security/scan-url`, { url });
        setUrlScanData(response.data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to fetch vulnerabilities. Service might be rate limiting or down.');
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
        <p className="cve-subtitle">Search by individual product or scan an entire website URL to retrieve a comprehensive security report.</p>
        
        <div className="cve-mode-toggle">
          <div 
            className={`cve-mode-btn ${searchMode === 'product' ? 'active' : ''}`}
            onClick={() => { setSearchMode('product'); setHasSearched(false); setError(''); }}
          >
            Software Search
          </div>
          <div 
            className={`cve-mode-btn ${searchMode === 'url' ? 'active' : ''}`}
            onClick={() => { setSearchMode('url'); setHasSearched(false); setError(''); }}
          >
            URL Scan
          </div>
        </div>
      </div>

      <form onSubmit={handleSearch} className="cve-search-form">
        {searchMode === 'product' ? (
          <input
            type="text"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="e.g., react, wordpress, apache..."
            className="cve-search-input"
          />
        ) : (
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="e.g., https://github.com"
            className="cve-search-input"
          />
        )}
        <button
          type="submit"
          disabled={loading || (searchMode === 'product' ? !product.trim() : !url.trim())}
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

      {hasSearched && !loading && !error && searchMode === 'product' && cves.length === 0 && (
        <div className="cve-empty-state">
          <svg className="cve-empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p style={{ fontSize: '20px', marginBottom: '8px' }}>No vulnerabilities found for "{product}"</p>
          <p>Try a different search term</p>
        </div>
      )}

      {hasSearched && !loading && !error && searchMode === 'url' && (!urlScanData || Object.keys(urlScanData.securityReport?.details || {}).length === 0) && (
        <div className="cve-empty-state">
           <svg className="cve-empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <p style={{ fontSize: '20px', marginBottom: '8px' }}>No vulnerabilities found for the detected tech stack of "{url}"</p>
        </div>
      )}

      {searchMode === 'product' && cves.length > 0 && (
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

      {searchMode === 'url' && urlScanData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <SecurityReport reportData={urlScanData.securityReport} />
          <AITestingGuidance guidanceData={urlScanData.aiGuidance} />
        </div>
      )}
    </div>
  );
};

export default CVESearch;
