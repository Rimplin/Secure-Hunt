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
      <div className="page2">
        <h3
          style={{ fontSize: "35px", margin: "40px", fontWeight: "1000" }}
          className="active-bounties"
        >
          <span style={{ color: "white" }}> ACTIVE </span>
          <span style={{ color: "#00c950" }}> BOUNTIES</span>
        </h3>

        <Link to="/create" className= "post-link">
           <button className= "post-button">Post Project</button>
        </Link>
      </div>

      <p
        style={{
          margin: "0px 40px",
          color: "hsl(0, 0%, 71%)",
          marginBottom: "50px",
        }}
      >
        Discover projects and get paid for securing the ecosystem.
      </p>

      <div style={{ margin: "20px 40px" }}>
      <input
        type="text"
        placeholder="Search projects by keyword..."
        value={search}
        onChange={(e) => {
          const value = e.target.value;
          setSearch(value);

          if (value === "") {
          loadProjects();
          }
        }}
        onKeyDown={(e) => {
        if (e.key === "Enter") {
        searchProjects();
        }
      }}
      style={{
      padding: "10px",
      width: "800px",
      marginRight: "10px",
      marginBottom: "30px",
      borderRadius: "6px",
      border: "1px solid #00c950",
      background: "black",
      color: "white"
    }}
  />
  <button
  onClick={() => setShowAdvanced(!showAdvanced)}
  style={{
    padding: "8px 16px",
    background: "#222",
    border: "1px solid #00c950",
    color: "white",
    fontWeight: "bold",
    fontSize: "15px",
    borderRadius: "6px",
    cursor: "pointer",
    marginLeft: "10px",
    marginRight: "10px",
    height: "40px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center"
  }}
>
  Advanced Search
</button>
{showAdvanced && (
  <div className="modal-overlay" onClick={() => setShowAdvanced(false)}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h2 className="modal-title">Advanced Search</h2>
        <button className="modal-close-btn" onClick={() => setShowAdvanced(false)}>&times;</button>
      </div>

      <div className="modal-grid">
        <input
          placeholder="Frontend (React, Angular...)"
          value={frontend}
          onChange={(e) => setFrontend(e.target.value)}
          onKeyDown={handleEnterSearch}
          className="modal-input"
        />
        <input
          placeholder="Backend (Node, Django...)"
          value={backend}
          onChange={(e) => setBackend(e.target.value)}
          onKeyDown={handleEnterSearch}
          className="modal-input"
        />
        <input
          placeholder="Database (MongoDB, MySQL...)"
          value={database}
          onChange={(e) => setDatabase(e.target.value)}
          onKeyDown={handleEnterSearch}
          className="modal-input"
        />
        <input
          placeholder="Web Server (Nginx, Apache...)"
          value={webServer}
          onChange={(e) => setWebServer(e.target.value)}
          onKeyDown={handleEnterSearch}
          className="modal-input"
        />
        <input
          placeholder="Operating System"
          value={os}
          onChange={(e) => setOs(e.target.value)}
          onKeyDown={handleEnterSearch}
          className="modal-input"
        />
        <input
          type="number"
          placeholder="Min Bounty"
          value={minBounty}
          onChange={(e) => setMinBounty(e.target.value)}
          onKeyDown={handleEnterSearch}
          className="modal-input"
        />
        <input
          type="number"
          placeholder="Max Bounty"
          value={maxBounty}
          onChange={(e) => setMaxBounty(e.target.value)}
          onKeyDown={handleEnterSearch}
          className="modal-input"
        />
      </div>

      <div className="modal-actions">
        <button
          className="modal-btn-clear"
          onClick={() => {
            setSearch("");
            setFrontend("");
            setBackend("");
            setDatabase("");
            setWebServer("");
            setOs("");
            setMinBounty("");
            setMaxBounty("");
            loadProjects();
          }}
        >
          Clear Filters
        </button>
        <button
          className="modal-btn-apply"
          onClick={() => {
            setShowAdvanced(false);
            searchProjects();
          }}
        >
          Apply Filters
        </button>
      </div>
    </div>
  </div>
)}

  <span><button
    onClick={searchProjects}
    style={{
      padding: "8px 16px",
      background: "#00c950",
      color: "black",
      fontWeight: "bold",
      fontSize: "15px",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      width:"200px",
      height: "40px",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }}
  >
    Search
  </button></span>
  
</div>


      <div className="projects">
        {Array.isArray(projects) && projects.map((proj) => (
          <div className="proj-card" key={proj._id}>
            <h3>{proj.name}</h3>
            <div className="bounty-badge">
              {proj.bounty.startsWith("$")? proj.bounty: `$${proj.bounty}`}
              </div>

            {/* IMPORTANT: use Mongo _id now */}
            <Link to={`/projects/${proj._id}`} className="view-link">
              <button className="viewDetails-button">View Details</button>
            </Link>
          </div>
        ))}
      </div>
      {noResults && (
      <p style={{ color: "white", margin: "40px" }}>
       No projects with this keyword
      </p>
      )}
    </>
  );
}

export default BountyBrowser;