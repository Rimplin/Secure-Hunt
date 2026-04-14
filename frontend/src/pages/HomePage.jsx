import { Link } from 'react-router-dom'
import logo1 from "../assets/logopic1.png"
import logo2 from "../assets/logopic2.png"
import { FileText } from "lucide-react"

function HomePage() {
    return (
        <>
            <div className="big-text">
                <h3 style={{ color: "white", lineHeight: "0%", fontFamily: "'Sora', sans-serif", fontWeight: "900", letterSpacing: "-6px", transform: "scaleY(1.05)", transformOrigin: "top" }}> SECURE YOUR</h3>
                <h3 style={{ lineHeight: "0%", transform: "scaleY(1.05)", transformOrigin: "top" }}>
                    <span style={{ color: "#00c950", fontFamily: "'Sora', sans-serif", fontWeight: "900", letterSpacing: "-4px" }}>PRODUCT </span>
                    <span style={{ color: "white", fontFamily: "'Montserrat', sans-serif", fontWeight: "900" }}>.</span>
                </h3>
                <h3 style={{ color: "white", lineHeight: "0%", fontFamily: "'Sora', sans-serif", fontWeight: "900", letterSpacing: "-6px", transform: "scaleY(1.05)", transformOrigin: "top" }}>REWARD THE</h3>
                <h3 style={{ lineHeight: "0%", transform: "scaleY(1.05)", transformOrigin: "top" }}>
                    <span style={{ color: "#00c950", fontFamily: "'Sora', sans-serif", fontWeight: "900", letterSpacing: "-4px" }}>HUNTERS </span>
                    <span style={{ color: "white", fontFamily: "'Montserrat', sans-serif", fontWeight: "900" }}>.</span>
                </h3>
            </div>

            <div className="buttons">
                <Link to="/browser" className="bounty-page">
                    <button className="button1" >Browse All Bounties</button>
                </Link>
                <Link to="/create" className="post-program">
                    <button className="button2" >Post Your Program</button>
                </Link>

            </div>

            <div className="about-grid">
                <div className="about">
                    <img src={logo1} alt="Logo1" className="char1" />
                    <h2 style={{ backgroud: "hsl(0, 0%, 8%)" }}>Instant Payouts</h2>
                    <p>Secure escrow ensures hunters get paid immediately upon validation.</p>
                </div>

                <div className="about">
                    <img src={logo2} alt="Logo2" className="char1" />
                    <h2>Curated Scope</h2>
                    <p>Define exactly what needs testing with custom rules of engagement.</p>
                </div>

                <div className="about">
                    <FileText size={38} color="hsl(144, 100%, 39%)" className="char1" />
                    <h2>Transparent Reports</h2>
                    <p>Clear, well-documented vulnerability reports with structured validation.</p>
                </div>


            </div>



        </>
    );
}

export default HomePage
