import { useContext, useEffect, useState } from "react";
import { Shield, Users, RefreshCcw } from "lucide-react";
import { AuthContext } from "../context/AuthContext_helper";
import "../styles/AdminUsers.css";

const BASE = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;

const ROLE_OPTIONS = [
  { value: "hunter", label: "Hunter" },
  { value: "company", label: "Company" },
  { value: "administrator", label: "Administrator" },
];

const parseApiResponse = async (res) => {
  const contentType = (res.headers.get("content-type") || "").toLowerCase();

  if (contentType.includes("application/json")) {
    return res.json();
  }

  const text = await res.text();
  throw new Error(
    `Unexpected API response (${res.status}). Expected JSON but received ${contentType || "unknown content"}. ${text.slice(0, 120)}`
  );
};

export default function AdminUsers() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState({});

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredUsers = users.filter((entry) => {
    if (!normalizedSearch) {
      return true;
    }

    const email = String(entry.email || "").toLowerCase();
    const role = String(entry.role || "").toLowerCase();
    return email.includes(normalizedSearch) || role.includes(normalizedSearch);
  });

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user || user.role !== "administrator") {
      setLoading(false);
      return;
    }

    const loadUsers = async () => {
      try {
        const res = await fetch(`${BASE}/api/admin/users`, {
          credentials: "include",
        });
        const data = await parseApiResponse(res);

        if (!res.ok) {
          throw new Error(data.message || "Failed to load users");
        }

        setUsers(Array.isArray(data.users) ? data.users : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [authLoading, user]);

  const handleRoleChange = async (userId, role) => {
    setSaving((current) => ({ ...current, [userId]: true }));

    try {
      const res = await fetch(`${BASE}/api/admin/users/${userId}/role`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });

      const data = await parseApiResponse(res);

      if (!res.ok) {
        throw new Error(data.message || "Failed to update role");
      }

      setUsers((current) =>
        current.map((entry) => (entry._id === userId ? data.user : entry))
      );
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving((current) => ({ ...current, [userId]: false }));
    }
  };

  if (authLoading || loading) {
    return (
      <div className="admin-users-page admin-users-loading">
        <RefreshCcw className="spin" />
        Loading users...
      </div>
    );
  }

  if (!user || user.role !== "administrator") {
    return (
      <div className="admin-users-page admin-users-denied">
        <Shield size={48} />
        <h2>Access denied</h2>
        <p>Administrator access is required to manage account roles.</p>
      </div>
    );
  }

  if (error) {
    return <div className="admin-users-page admin-users-error">{error}</div>;
  }

  return (
    <div className="admin-users-page">
      <header className="admin-users-header">
        <div className="admin-users-heading">
          <Users size={36} />
          <div>
            <h1>User Role Management</h1>
            <p>Assign hunter, company, or administrator access.</p>
          </div>
        </div>

        <div className="admin-users-search-wrap">
          <input
            type="text"
            className="admin-users-search"
            placeholder="Search by email or role..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </header>

      <div className="admin-users-grid">
        {filteredUsers.map((entry) => (
          <div key={entry._id} className="admin-user-card">
            <div>
              <p className="admin-user-email">{entry.email}</p>
              <p className="admin-user-meta">
                Current role: <strong>{entry.role}</strong>
              </p>
              <p className="admin-user-meta">
                Verified: <strong>{entry.isVerified ? "Yes" : "No"}</strong>
              </p>
            </div>

            <div className="admin-user-controls">
              <select
                value={entry.role}
                onChange={(event) => handleRoleChange(entry._id, event.target.value)}
                disabled={saving[entry._id]}
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <span className="admin-save-hint">
                {saving[entry._id] ? "Saving..." : "Changes save immediately"}
              </span>
            </div>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="admin-users-empty">
            No users found matching "{searchTerm}".
          </div>
        )}
      </div>
    </div>
  );
}
