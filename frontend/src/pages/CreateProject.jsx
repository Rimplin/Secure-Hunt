import { useState } from "react"
import '../styles/CreateProject.css'
import { CirclePlus } from 'lucide-react'


function CreateProject(){
    const [form, setForm]=useState({
        name: "",
        bounty: "",
        description: "",
        /*scope:"",
        rules:"",
        securityContext:"",*/
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

    const handleChange= (e) =>{
        setForm({...form, [e.target.name]: e.target.value});
    };
    const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submit clicked");

    const projectData = {
      name: form.name,
      bounty: form.bounty,
      description: form.description,
      /*scope: form.scope,
      rules: form.rules,
      securityContext: form.securityContext,*/
      techStack: {
        frontend: {type: form.frontendType, version: form.frontendVersion},
        backend: {type: form.backendType, version: form.backendVersion},
        database: {type: form.databaseType, version: form.databaseVersion},
        webServer: {type: form.webServerType, version: form.webServerVersion},
        os: {type: form.osType, version: form.osVersion}
      }
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData)
      });

      if (res.ok) 
      {alert("Project created!");
      setForm({
        name:"",
        bounty:"",
        description:"",
        /*scope:"",
        rules:"",
        securityContext:"",*/
        frontendType:"",
        frontendVersion:"",
        backendType:"",
        backendVersion:"",
        databaseType:"",
        databaseVersion:"",
        webServerType:"",
        webServerVersion:"",
        osType:"",
        osVersion:""
        });}
      else alert("Error creating project");
    } catch (err) {
      console.error(err);
    }

  };

  return (
    <>
    
    <div className="create-header">
        <CirclePlus size={40} className="create-icon" />
        <h2>Post a Project</h2>
        <p>Define your project scope and reward security researchers.</p>
      </div>
    <form onSubmit={handleSubmit}>
      <div>
      <label>Name:</label>
      <input name="name" value={form.name} placeholder="Project name"  onChange={handleChange} />
      </div>
      <div>
      <label>Bounty:</label>
      <input name="bounty" value={form.bounty} placeholder="Bounty $" onChange={handleChange} />
      </div>
      <div>
      <label>Description:</label>
      <textarea name="description" value={form.description} placeholder="Description" onChange={handleChange} />
      </div>
      {/*<div>
      <label>Scope:</label>
      <textarea name="scope" value={form.scope} onChange={handleChange}/>
      </div>

      <div>
      <label>Rules:</label>
      <textarea name="rules" value={form.rules} onChange={handleChange}/>
      </div>

      <div>
      <label>Security Context:</label>
      <textarea name="securityContext" value={form.securityContext} onChange={handleChange}/>
      </div>*/}

      <div className="fRow">
      <label>Frontend:</label>
      <input name="frontendType" placeholder="Type (React)" value={form.frontendType} onChange={handleChange} />
      <input name="frontendVersion" placeholder="Version"  value={form.frontendVersion} onChange={handleChange}/>
      </div>

      <div className="fRow">
      <label>Backend:</label>
      <input name="backendType" placeholder="Type (Node.js)"  value={form.backendType} onChange={handleChange} />
      <input name="backendVersion" placeholder="Version"  value={form.backendVersion} onChange={handleChange}/>
      </div>

      <div className="fRow">
      <label>Data Base:</label>
      <input name="databaseType" placeholder="Type (MongoDB)"  value={form.databaseType} onChange={handleChange} />
      <input name="databaseVersion" placeholder="Version"  value={form.databaseVersion} onChange={handleChange} />
      </div>
      
      <div className="fRow">
      <label>Web Server:</label>
      <input name="webServerType" placeholder="Type"  value={form.webServerType} onChange={handleChange} />
      <input name="webServerVersion" placeholder="Version"  value={form.webServerVersion} onChange={handleChange}/>
      </div>

      <div className="fRow">
      <label>OS:</label>
      <input name="osType" placeholder="Type"  value={form.osType} onChange={handleChange} />
      <input name="osVersion" placeholder="Version"  value={form.osVersion} onChange={handleChange}/>
      </div>

      <button type="submit">Create Project</button>
    </form>
    </>
  );

}

export default CreateProject