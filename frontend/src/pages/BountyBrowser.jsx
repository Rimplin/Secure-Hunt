import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function BountyBrowser() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [noResults, setNoResults] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [frontend, setFrontend] = useState("");
  const [backend, setBackend] = useState("");
  const [database, setDatabase] = useState("");
  const [webServer, setWebServer] = useState("");
  const [os, setOs] = useState("");

  const [minBounty, setMinBounty] = useState("");
  const [maxBounty, setMaxBounty] = useState("");

  const loadProjects = () => {
    fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/projects`)
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);
        setNoResults(false);
      });
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleEnterSearch = (e) => {
    if (e.key === "Enter") {
      searchProjects();
    }
  };


  const searchProjects = () => {

    const params = new URLSearchParams();

    if (search) params.append("q", search);
    if (frontend) params.append("frontend", frontend);
    if (backend) params.append("backend", backend);
    if (database) params.append("database", database);
    if (webServer) params.append("webServer", webServer);
    if (os) params.append("os", os);
    if (minBounty) params.append("minBounty", minBounty);
    if (maxBounty) params.append("maxBounty", maxBounty);

    fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/projects/search?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setProjects(data);
        setNoResults(data.length === 0);
      });
  };

  return (
    <>
      {/* ── Page header ── */}
      <div className="page2">
        <div className="page2-left">
          <h3 className="active-bounties">
            <span style={{ color: "white" }}>ACTIVE </span>
            <span style={{ color: "#00c950" }}>BOUNTIES</span>
          </h3>
          <p className="bounty-subtitle">
            Discover projects and get paid for securing the ecosystem.
          </p>
        </div>
        <Link to="/create" className="post-link">
          <button className="post-button">+ Post Project</button>
        </Link>
      </div>

      {/* ── Search row ── */}
      <div className="search-row">
        <input
          className="search-input"
          type="text"
          placeholder="Search projects by keyword..."
          value={search}
          onChange={(e) => {
            const value = e.target.value;
            setSearch(value);
            if (value === "") loadProjects();
          }}
          onKeyDown={(e) => { if (e.key === "Enter") searchProjects(); }}
        />
        <button
          className="adv-search-button"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          Advanced Search
        </button>
        <button className="search-button" onClick={searchProjects}>
          Search
        </button>
      </div>

      {/* ── Advanced Search Modal ── */}
      {showAdvanced && (
        <div className="modal-overlay" onClick={() => setShowAdvanced(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Advanced Search</h2>
              <button className="modal-close-btn" onClick={() => setShowAdvanced(false)}>&times;</button>
            </div>

            <div className="modal-grid">
              <input placeholder="Frontend (React, Angular...)" value={frontend} onChange={(e) => setFrontend(e.target.value)} onKeyDown={handleEnterSearch} className="modal-input" />
              <input placeholder="Backend (Node, Django...)" value={backend} onChange={(e) => setBackend(e.target.value)} onKeyDown={handleEnterSearch} className="modal-input" />
              <input placeholder="Database (MongoDB, MySQL...)" value={database} onChange={(e) => setDatabase(e.target.value)} onKeyDown={handleEnterSearch} className="modal-input" />
              <input placeholder="Web Server (Nginx, Apache...)" value={webServer} onChange={(e) => setWebServer(e.target.value)} onKeyDown={handleEnterSearch} className="modal-input" />
              <input placeholder="Operating System" value={os} onChange={(e) => setOs(e.target.value)} onKeyDown={handleEnterSearch} className="modal-input" />
              <input type="number" placeholder="Min Bounty ($)" value={minBounty} onChange={(e) => setMinBounty(e.target.value)} onKeyDown={handleEnterSearch} className="modal-input" />
              <input type="number" placeholder="Max Bounty ($)" value={maxBounty} onChange={(e) => setMaxBounty(e.target.value)} onKeyDown={handleEnterSearch} className="modal-input" />
            </div>

            <div className="modal-actions">
              <button className="modal-btn-clear" onClick={() => {
                setSearch(""); setFrontend(""); setBackend(""); setDatabase("");
                setWebServer(""); setOs(""); setMinBounty(""); setMaxBounty("");
                loadProjects();
              }}>
                Clear Filters
              </button>
              <button className="modal-btn-apply" onClick={() => { setShowAdvanced(false); searchProjects(); }}>
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Project cards ── */}
      <div className="projects">
        {Array.isArray(projects) && projects.map((proj) => (
          <div className="proj-card" key={proj._id}>
            <h3>{proj.name}</h3>
            <p className="proj-description">
              {proj.description.length > 120
                ? proj.description.substring(0, 120) + "..."
                : proj.description}
            </p>
            <div className="bounty-badge">
              {proj.bounty.startsWith("$") ? proj.bounty : `$${proj.bounty}`}
            </div>
            <Link to={`/projects/${proj._id}`} className="view-link">
              <button className="viewDetails-button">View Details</button>
            </Link>
          </div>
        ))}
      </div>

      {noResults && (
        <p className="no-results-msg">No projects match your search.</p>
      )}
    </>
  );
}

export default BountyBrowser;