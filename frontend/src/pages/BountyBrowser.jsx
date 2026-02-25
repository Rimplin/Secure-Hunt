import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function BountyBrowser() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/projects`)
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch((err) => console.error("Failed to fetch projects:", err));
  }, []);

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
    </>
  );
}

export default BountyBrowser;