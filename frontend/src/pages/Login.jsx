import { Lock, Mail } from 'lucide-react'
import '../styles/Auth.css'
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext_helper";

function Login() {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const email = e.target.email.value;
    const password = e.target.password.value;
    // const role = e.target.role.value;
  
    const res = await fetch(
      `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/auth/login`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );
  
    const data = await res.json();
    console.log(data);

    if (!res.ok) {
      return alert(data.message);
    }
    
    // fetch user after login
    const userRes = await fetch(
      `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/auth/me`,
      { credentials: "include" }
    );
    
    const userData = await userRes.json();
    setUser(userData);
    
    navigate("/");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Lock className="auth-icon" size={32} />
          <h2>Sign In to Secure Hunt</h2>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} />
              <input
                type="email"
                id="email"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="submit-btn">Sign In</button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <span
              style={{ cursor: "pointer", color: "#00c950" }}
              onClick={() => navigate("/signup")}
            >
              Create one
            </span></p>
          <p><a href="#forgot">Forgot password?</a></p>
        </div>

        <div className="feature-notice">
          <p>🚀 Full authentication coming in next Sprint probably</p>
        </div>
      </div>
    </div>
  )
}

export default Login
