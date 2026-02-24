import { useState } from "react"
import '../styles/CreateProject.css'
import { CirclePlus } from 'lucide-react'

function CreateProject() {
  const [form, setForm] = useState({
    name: "",
    bounty: "",
    description: "",
    frontendType: "",
    frontendVersion: "",
    backendType: "",
    backendVersion: "",
    databaseType: "",
    databaseVersion: "",
    webServerType: "",
    webServerVersion: "",
    osType: "",
    osVersion: "",
  });

  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const projectData = {
      name: form.name,
      bounty: form.bounty,
      description: form.description,
      techStack: {
        frontend: { type: form.frontendType, version: form.frontendVersion },
        backend: { type: form.backendType, version: form.backendVersion },
        database: { type: form.databaseType, version: form.databaseVersion },
        webServer: { type: form.webServerType, version: form.webServerVersion },
        os: { type: form.osType, version: form.osVersion }
      }
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(projectData)
      });

      if (res.ok) {
        showToast("success", "✅ Project created successfully!");
        setForm({
          name: "", bounty: "", description: "",
          frontendType: "", frontendVersion: "",
          backendType: "", backendVersion: "",
          databaseType: "", databaseVersion: "",
          webServerType: "", webServerVersion: "",
          osType: "", osVersion: ""
        });
      } else {
        const data = await res.json();
        showToast("error", `❌ ${data.message || "Error creating project"}`);
      }
    } catch (err) {
      console.error(err);
      showToast("error", "❌ Network error. Is the server running?");
    }
  };

  return (
    <div className="create-page">

      <div className="create-header">
        <CirclePlus size={40} className="create-icon" />
        <h2>Post a Project</h2>
        <p>Define your project scope and reward security researchers.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="field-row">
          <label>Name:</label>
          <input name="name" value={form.name} placeholder="Project name" onChange={handleChange} required />
        </div>

        <div className="field-row">
          <label>Bounty:</label>
          <input name="bounty" value={form.bounty} placeholder="Bounty $" onChange={handleChange} required />
        </div>

        <div className="field-row">
          <label>Description:</label>
          <textarea name="description" value={form.description} placeholder="Description" onChange={handleChange} required />
        </div>

        <div className="fRow">
          <label>Frontend:</label>
          <input name="frontendType" placeholder="Type (React)" value={form.frontendType} onChange={handleChange} />
          <input name="frontendVersion" placeholder="Version" value={form.frontendVersion} onChange={handleChange} />
        </div>

        <div className="fRow">
          <label>Backend:</label>
          <input name="backendType" placeholder="Type (Node.js)" value={form.backendType} onChange={handleChange} />
          <input name="backendVersion" placeholder="Version" value={form.backendVersion} onChange={handleChange} />
        </div>

        <div className="fRow">
          <label>Data Base:</label>
          <input name="databaseType" placeholder="Type (MongoDB)" value={form.databaseType} onChange={handleChange} />
          <input name="databaseVersion" placeholder="Version" value={form.databaseVersion} onChange={handleChange} />
        </div>

        <div className="fRow">
          <label>Web Server:</label>
          <input name="webServerType" placeholder="Type" value={form.webServerType} onChange={handleChange} />
          <input name="webServerVersion" placeholder="Version" value={form.webServerVersion} onChange={handleChange} />
        </div>

        <div className="fRow">
          <label>OS:</label>
          <input name="osType" placeholder="Type" value={form.osType} onChange={handleChange} />
          <input name="osVersion" placeholder="Version" value={form.osVersion} onChange={handleChange} />
        </div>

        <button type="submit">Create Project</button>
      </form>

      {toast && (
        <div className={`toast ${toast.type}`}>{toast.msg}</div>
      )}

    </div>
  );
}

export default CreateProject