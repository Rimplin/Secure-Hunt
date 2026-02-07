import logo from "../assets/Secure-Hunt-pic-black.png"

function Footer(){
    return(
        <div className= "footerbar">
            <div className="footer-left">
            <img src={logo} alt="Secure Hunt Logo" className="footer-logo" />
            <span style={{fontSize: "22px", fontWeight: "bold", color: "white", background: "hsl(0, 0%, 7%)"}}>SECURE</span>
            <span style={{fontSize: "22px", fontWeight: "bold", color: "#00c950", background: "hsl(0, 0%, 7%)"}}>HUNT</span>
            </div>
            <p style={{color:"hsl(0, 0%, 71%)", background: "hsl(0, 0%, 7%)", marginBottom:"100px"}}>Empowering the security community to build a safer internet through collaboration, transparency, and fair rewards.</p>


            <hr/>
            <footer>
            <p style={{textAlign: "center", background: "hsl(0, 0%, 7%)", color:"hsl(0, 0%, 71%)"}}>&copy; {new Date().getFullYear()} Secure Hunt Platform</p> 
            </footer>
        </div>
    );
}

export default Footer