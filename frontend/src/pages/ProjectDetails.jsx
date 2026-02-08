// frontend/src/pages/ProjectDetails.jsx
import { Link, useParams } from "react-router-dom";
import { projects } from "../data/projects";

function ProjectDetails() {
  const { id } = useParams();
  const project = projects.find((p) => p.id === Number(id));

  if (!project) {
    return (
      <div style={{ padding: "40px" }}>
        <h1>Project Details</h1>
        <p style={{ color: "hsl(0, 0%, 71%)" }}>
          Project not found for ID <strong>{id}</strong>.
        </p>
        <Link to="/browser" className="view-link">
          <button className="viewDetails-button">Back to Browse</button>
        </Link>
      </div>
    );
  }

  const t = project.techStack || {};
  const rows = [
    ["Frontend", t.frontend?.type, t.frontend?.version],
    ["Backend", t.backend?.type, t.backend?.version],
    ["Database", t.database?.type, t.database?.version],
    ["Web Server", t.webServer?.type, t.webServer?.version],
    ["OS", t.os?.type, t.os?.version],
  ];

  return (
    <div style={{ padding: "40px" }}>
      <h1>Project Details</h1>

      {/* Match Browse Bounties card styling */}
      <div className="proj-card" style={{ maxWidth: "800px" }}>
        <h3 style={{ marginBottom: "10px" }}>{project.name}</h3>
        <div className="bounty-badge" style={{ marginBottom: "18px" }}>
          {project.bounty}
        </div>

        <h3 style={{ marginTop: "10px" }}>Description</h3>
        <p style={{ color: "hsl(0, 0%, 71%)", lineHeight: "1.6" }}>
          {project.description}
        </p>

        <h3 style={{ marginTop: "24px" }}>Technology Stack</h3>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>Component</th>
                <th style={th}>Type</th>
                <th style={th}>Version</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([component, type, version]) => (
                <tr key={component}>
                  <td style={td}>{component}</td>
                  <td style={td}>{type || "Not specified"}</td>
                  <td style={td}>{version || "Not specified"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: "22px" }}>
          <Link to="/browser" className="view-link">
            <button className="viewDetails-button">Back to Browse</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

const th = {
  textAlign: "left",
  padding: "10px",
  borderBottom: "1px solid rgba(255,255,255,0.12)",
  color: "white",
};

const td = {
  padding: "10px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  color: "hsl(0, 0%, 71%)",
};

export default ProjectDetails;
