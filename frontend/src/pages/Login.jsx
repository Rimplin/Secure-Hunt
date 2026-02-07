import { Lock, Mail } from 'lucide-react'
import '../styles/Auth.css'

function Login() {
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
          <p>Don't have an account? <a href="#signup">Create one</a></p>
          <p><a href="#forgot">Forgot password?</a></p>
        </div>

        <div className="feature-notice">
          <p>🚀 Full authentication coming in Sprint 2</p>
        </div>
      </div>
    </div>
  )
}

export default Login
