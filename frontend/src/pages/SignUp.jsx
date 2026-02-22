import { Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";

function SignUp() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const email = e.target.email.value;
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;
    const role = e.target.role.value;

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, role }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        return setError(data.message);
      }

      alert("Account created! Please verify your email.");
      navigate("/login");
    } catch (err) {
      console.error("Register error:", err);
      setError("Something went wrong");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <User className="auth-icon" size={32} />
          <h2>Create an Account</h2>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} />
              <input type="email" name="email" required />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock size={18} />
              <input type="password" name="password" required />
            </div>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" name="confirmPassword" required />
          </div>

          <div className="form-group">
            <label>Account Type</label>
            <select name="role" required>
                <option value="hunter">Hunter</option>
                <option value="company">Company</option>
            </select>
          </div>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <button type="submit" className="submit-btn">
            Sign Up
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{" "}
            <span
              style={{ cursor: "pointer", color: "#00c950" }}
              onClick={() => navigate("/login")}
            >
              Sign in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;