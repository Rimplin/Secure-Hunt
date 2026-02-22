import { Lock, Mail } from 'lucide-react'
import '../styles/Auth.css'
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Lock className="auth-icon" size={32} />
          <h2>Sign In to Secure Hunt</h2>
        </div>

        <form className="auth-form">
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
