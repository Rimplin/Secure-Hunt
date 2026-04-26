import React, { useEffect, useState } from "react";
import "../styles/AITestingGuidance.css";

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

const AITestingGuidance = ({ projectId, guidanceData }) => {
  const [guidance, setGuidance] = useState(null);
  const [loading, setLoading] = useState(!guidanceData);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (guidanceData) {
      const data = { ...guidanceData };
      if (Array.isArray(data.recommendations)) {
        data.recommendations.sort(
          (a, b) =>
            (PRIORITY_ORDER[a.priority?.toLowerCase()] ?? 9) -
            (PRIORITY_ORDER[b.priority?.toLowerCase()] ?? 9)
        );
      }
      setGuidance(data);
      setLoading(false);
      return;
    }

    if (!projectId) return;

    const fetchGuidance = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/security/testing-guidance/${projectId}`
        );
        if (!res.ok) throw new Error("Failed to fetch AI guidance");
        const data = await res.json();
        // Sort by priority
        if (Array.isArray(data.recommendations)) {
          data.recommendations.sort(
            (a, b) =>
              (PRIORITY_ORDER[a.priority?.toLowerCase()] ?? 9) -
              (PRIORITY_ORDER[b.priority?.toLowerCase()] ?? 9)
          );
        }
        setGuidance(data);
      } catch (err) {
        console.error("Error fetching AI testing guidance:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGuidance();
  }, [projectId, guidanceData]);

  if (loading) {
    return (
      <div className="ai-guidance-container">
        <div className="ai-guidance-header">
          <h2>AI Testing Guidance</h2>
          <span className="ai-badge">✦ Powered by Groq</span>
        </div>
        <div className="ai-guidance-loading">
          Analyzing vulnerabilities and generating recommendations…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ai-guidance-container">
        <div className="ai-guidance-header">
          <h2>AI Testing Guidance</h2>
          <span className="ai-badge">✦ Powered by Groq</span>
        </div>
        <div className="ai-guidance-empty">
          Could not load recommendations: {error}
        </div>
      </div>
    );
  }

  const recommendations = guidance?.recommendations ?? [];
  const message = guidance?.message;

  return (
    <div className="ai-guidance-container">
      <div className="ai-guidance-header">
        <h2>AI Testing Guidance</h2>
        <span className="ai-badge">✦ Powered by Gemini</span>
      </div>

      {recommendations.length === 0 ? (
        <div className="ai-guidance-empty">
          {message || "No recommendations available for this project."}
        </div>
      ) : (
        <div className="ai-guidance-list">
          {recommendations.map((rec, idx) => (
            <div key={idx} className={`ai-rec-card priority-${rec.priority?.toLowerCase()}`}>
              <div className="ai-rec-top">
                <span className="ai-rec-title">{rec.title}</span>
                <span className={`ai-priority-badge p-${rec.priority?.toLowerCase()}`}>
                  {rec.priority?.toUpperCase()}
                </span>
              </div>
              <p className="ai-rec-reason">{rec.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AITestingGuidance;
