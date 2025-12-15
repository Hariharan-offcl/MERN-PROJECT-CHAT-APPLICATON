// src/pages/LoginPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../socket";

function LoginPage() {
  const [mode, setMode] = useState("login"); // "login" or "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint =
        mode === "login" ? "/api/auth/login" : "/api/auth/register";

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "login"
            ? { email, password }
            : { name, email, password }
        ),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Something went wrong");
        return;
      }

      if (mode === "login") {
        // Only on login: save token + user and go to chat
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data));
        navigate("/chat");
      } else {
        // On register: ask user to login
        alert("Registration successful! Please login with your email and password.");
        setPassword("");
        setMode("login");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode((prev) => (prev === "login" ? "register" : "login"));
  };

  return (
    <div className="auth-page">
      {/* WhatsApp green top bar */}
      <nav className="navbar navbar-whatsapp px-3">
        <span className="navbar-brand mb-0 h5">Chat Application</span>
      </nav>

      {/* Background section */}
      <div className="auth-bg-strip"></div>

      {/* Center card */}
      <div className="auth-wrapper">
        <div className="auth-card">
          {/* Left side text, like WhatsApp Web QR section */}
          <div className="auth-left">
            <h3 className="mb-3">
              {mode === "login" ? "Chat on your desktop" : "Create your account"}
            </h3>
            <ol className="auth-list">
              {mode === "login" ? (
                <>
                  <li>Login with your email and password.</li>
                  <li>Open the chat on multiple tabs to test real-time messaging.</li>
                  <li>Start a chat with another registered user.</li>
                </>
              ) : (
                <>
                  <li>Fill your name, email and password.</li>
                  <li>After registration, login from the same screen.</li>
                  <li>Chat in real time with other registered users.</li>
                </>
              )}
            </ol>
            <p className="auth-note">
              Built with <strong>MERN</strong> + <strong>Socket.io</strong>, styled like WhatsApp Web.
            </p>
          </div>

          {/* Right side form */}
          <div className="auth-right">
            <div className="auth-form-header">
              <h5 className="mb-1">
                {mode === "login" ? "Login to your account" : "Register a new account"}
              </h5>
              <span className="auth-form-subtitle">
                {mode === "login"
                  ? "Enter your credentials to continue."
                  : "Fill the form to get started."}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="mt-3">
              {mode === "register" && (
                <div className="mb-3">
                  <label className="form-label auth-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control form-control-sm auth-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={mode === "register"}
                    placeholder="Your name"
                  />
                </div>
              )}

              <div className="mb-3">
                <label className="form-label auth-label">Email</label>
                <input
                  type="email"
                  className="form-control form-control-sm auth-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                />
              </div>

              <div className="mb-3">
                <label className="form-label auth-label">Password</label>
                <input
                  type="password"
                  className="form-control form-control-sm auth-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={4}
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className="btn btn-success w-100 auth-submit-btn"
                disabled={loading}
              >
                {loading
                  ? "Please wait..."
                  : mode === "login"
                  ? "Login"
                  : "Register"}
              </button>
            </form>

            <hr className="my-3" />

            <div className="auth-switch text-center">
              <span className="small text-muted me-1">
                {mode === "login"
                  ? "New to this chat?"
                  : "Already registered?"}
              </span>
              <button
                type="button"
                className="btn btn-link btn-sm p-0 auth-switch-link"
                onClick={toggleMode}
              >
                {mode === "login"
                  ? "Create an account"
                  : "Login instead"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="auth-footer text-center">
        <span className="small text-muted">
          Developed By V~S
        </span>
      </div>
    </div>
  );
}

export default LoginPage;
