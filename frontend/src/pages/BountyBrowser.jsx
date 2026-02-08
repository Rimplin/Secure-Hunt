// frontend/src/pages/BountyBrowser.jsx
import { Link } from "react-router-dom";
import { projects } from "../data/projects";

function BountyBrowser() {
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

        {/* Sprint 1: placeholder only */}
        <button
          className="post-button"
          onClick={() => alert("Coming in Sprint 2")}
        >
          Post Project
        </button>
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

      <div className="projects">
        {projects.map((proj) => (
          <div className="proj-card" key={proj.id}>
            <h3>{proj.name}</h3>
            <div className="bounty-badge">{proj.bounty}</div>

            {/* IMPORTANT: no Link state. Just route by id */}
            <Link to={`/projects/${proj.id}`} className="view-link">
              <button className="viewDetails-button">View Details</button>
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}

export default BountyBrowser;
