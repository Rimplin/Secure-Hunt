import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../context/AuthContext_helper";
import "../styles/AdminReports.css";

const BASE = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;
const STATUSES = ["pending", "reviewed", "accepted", "rejected"];

export default function AdminReports() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState({});
  const [draftStatus, setDraftStatus] = useState({});
  const [query, setQuery] = useState("");

  const isAdmin = user?.role === "administrator";

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    const loadReports = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${BASE}/api/reports`, { credentials: "include" });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load reports");
        }

        setReports(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Failed to load reports");
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [authLoading, isAdmin]);

  const visibleReports = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return reports;

    return reports.filter((r) => {
      const title = (r.title || "").toLowerCase();
      const project = (r.projectId?.name || "").toLowerCase();
      const author = (r.submittedBy?.email || "").toLowerCase();
      return title.includes(q) || project.includes(q) || author.includes(q);
    });
  }, [reports, query]);

  const updateStatus = async (reportId) => {
    const report = reports.find((entry) => entry._id === reportId);
    if (!report) return;

    const nextStatus = draftStatus[reportId] || report.status;
    if (nextStatus === report.status) return;

    setSaving((prev) => ({ ...prev, [reportId]: true }));

    try {
      const res = await fetch(`${BASE}/api/reports/${reportId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update report status");
      }

      setReports((prev) =>
        prev.map((entry) =>
          entry._id === reportId ? { ...entry, status: nextStatus } : entry
        )
      );
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSaving((prev) => ({ ...prev, [reportId]: false }));
    }
  };

  if (authLoading || loading) {
    return <div className="admin-reports-state">Loading reports...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="admin-reports-state denied">
        Administrator access is required to overrule company decisions.
      </div>
    );
  }

  if (error) {
    return <div className="admin-reports-state error">Error: {error}</div>;
  }

  return (
    <div className="admin-reports-page">
      <div className="admin-reports-header">
        <h1>Admin Reports</h1>
        <p>Review reports and overrule company status decisions when needed.</p>
      </div>

      <input
        className="admin-reports-search"
        placeholder="Search by title, project, or reporter email"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {visibleReports.length === 0 ? (
        <div className="admin-reports-empty">No reports found.</div>
      ) : (
        <div className="admin-reports-list">
          {visibleReports.map((report) => {
            const statusValue = draftStatus[report._id] || report.status;
            const isSaving = Boolean(saving[report._id]);
            return (
              <div className="admin-report-card" key={report._id}>
                <div className="admin-report-main">
                  <h2>{report.title}</h2>
                  <p>
                    Project: {report.projectId?.name || "Unknown"} | Reporter: {report.submittedBy?.email || "Unknown"}
                  </p>
                  <p>Current status: <strong>{report.status}</strong></p>
                </div>

                <div className="admin-report-actions">
                  <select
                    value={statusValue}
                    disabled={isSaving}
                    onChange={(e) =>
                      setDraftStatus((prev) => ({ ...prev, [report._id]: e.target.value }))
                    }
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    disabled={isSaving || statusValue === report.status}
                    onClick={() => updateStatus(report._id)}
                  >
                    {isSaving ? "Saving..." : "Overrule"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}