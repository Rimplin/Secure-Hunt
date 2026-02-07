import { useParams } from "react-router-dom";

function ProjectDetails() {
  const { id } = useParams();

  return (
    <div style={{ padding: "40px" }}>
      <h1>Project Details</h1>

      <p>
        Project ID: <strong>{id}</strong>
      </p>

      
    </div>
  );
}

export default ProjectDetails