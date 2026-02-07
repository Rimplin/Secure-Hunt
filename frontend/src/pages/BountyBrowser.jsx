import { Link } from 'react-router-dom'
/*import { SquarePlus } from "lucide-react"*/
const projs= [
    {id: 1, name:"API Penetration Testing", bounty:"$800" },
    {id: 2, name:"Mobile App Vulnerability Scan", bounty:"$600" },
    {id: 3, name:"Web App Security Audit", bounty:"$500" },
    {id: 4, name:"API Penetration Testing", bounty:"$800" },
    {id: 5, name:"Mobile App Vulnerability Scan", bounty:"$600" },
    {id: 6, name:"Web App Security Audit", bounty:"$500" }
];

function BountyBrowser() {
  return (
    <>
    <div className="page2">
        <h3 style={{fontSize: "35px", margin: "40px", fontWeight:"1000"}} className="active-bounties">
        <span style={{color:"white"}}> ACTIVE </span>
        <span style={{color:"#00c950"}}> BOUNTIES</span>
       </h3>

        
       <button className="post-button">
        {/*<SquarePlus size={18} color="hsl(0, 0%, 100%)" className="plus-icon"/>*/}
        Post Project
        </button>
       
    </div>
        <p style={{margin: "0px 40px", color:"hsl(0, 0%, 71%)", marginBottom:"50px"}}>Discover projects and get paid for securing the ecosystem.</p>


        <div className="projects">
            {projs.map(proj => (
            <div className="proj-card" key={proj.id}>
                <h3>{proj.name}</h3>
                <div className="bounty-badge">{proj.bounty}</div>
                            

                <Link to={`/projects/${proj.id}`} className="view-link">
                <button className="viewDetails-button" >View Details</button>
                </Link>
                </div>
                        
            ))}
        </div>
    </>
  );
}

export default BountyBrowser