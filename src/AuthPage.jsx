import { useState } from "react";
import { supabase } from "./supabase";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=Barlow:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

  .auth-root {
    min-height: 100vh;
    background: #0f0e0c;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    font-family: 'Barlow', sans-serif;
  }

  .auth-card {
    background: #1a1917;
    border: 1px solid #2e3240;
    width: 100%;
    max-width: 440px;
    padding: 2.5rem;
  }

  .auth-logo {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    font-size: 1.6rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #fdfaf4;
    margin-bottom: 0.3rem;
  }

  .auth-logo span { color: #e8a020; }

  .auth-tagline {
    font-size: 0.82rem;
    color: #6a6460;
    font-family: 'IBM Plex Mono', monospace;
    margin-bottom: 2rem;
  }

  .auth-tabs {
    display: flex;
    border-bottom: 1px solid #2e3240;
    margin-bottom: 1.8rem;
  }

  .auth-tab {
    flex: 1;
    background: none;
    border: none;
    color: #6a6460;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 700;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 0.6rem 0;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    transition: color 0.15s, border-color 0.15s;
  }

  .auth-tab.active {
    color: #e8a020;
    border-bottom-color: #e8a020;
  }

  .auth-field {
    margin-bottom: 1rem;
  }

  .auth-label {
    display: block;
    font-size: 0.72rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #8a8478;
    margin-bottom: 0.4rem;
    font-family: 'IBM Plex Mono', monospace;
  }

  .auth-input {
    width: 100%;
    background: #0f0e0c;
    border: 1px solid #2e3240;
    color: #fdfaf4;
    font-family: 'Barlow', sans-serif;
    font-size: 0.95rem;
    padding: 0.65rem 0.85rem;
    outline: none;
    transition: border-color 0.15s;
  }

  .auth-input:focus { border-color: #e8a020; }
  .auth-input::placeholder { color: #3a3835; }

  .auth-trial-badge {
    background: rgba(232,160,32,0.08);
    border: 1px solid rgba(232,160,32,0.2);
    color: #e8a020;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.72rem;
    padding: 0.5rem 0.8rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .auth-btn {
    width: 100%;
    background: #e8a020;
    color: #0f0e0c;
    border: none;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 0.85rem;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s;
    margin-top: 0.5rem;
  }

  .auth-btn:hover { background: #c4841a; }
  .auth-btn:active { transform: scale(0.99); }
  .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .auth-error {
    background: rgba(196,74,42,0.1);
    border: 1px solid rgba(196,74,42,0.3);
    color: #c44a2a;
    font-size: 0.82rem;
    padding: 0.6rem 0.8rem;
    margin-bottom: 1rem;
    font-family: 'IBM Plex Mono', monospace;
  }

  .auth-success {
    background: rgba(61,154,106,0.1);
    border: 1px solid rgba(61,154,106,0.3);
    color: #3d9a6a;
    font-size: 0.82rem;
    padding: 0.6rem 0.8rem;
    margin-bottom: 1rem;
    font-family: 'IBM Plex Mono', monospace;
  }

  .auth-footer {
    margin-top: 1.5rem;
    font-size: 0.75rem;
    color: #3a3835;
    text-align: center;
    line-height: 1.6;
  }
`;

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState(
    new URLSearchParams(window.location.search).get("mode") === "login" ? "login" : "signup"
  );
  const [form, setForm] = useState({ name: "", business: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSignup(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.business.trim() || !form.email.trim() || !form.password.trim()) {
      setError("All fields are required."); return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters."); return;
    }
    setLoading(true); setError("");
    const { data, error: err } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: { full_name: form.name.trim(), business_name: form.business.trim() }
      }
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    if (data.session) {
      onAuth(data.session.user);
    } else {
      setSuccess("Check your email to confirm your account, then log in.");
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    if (!form.email.trim() || !form.password.trim()) {
      setError("Email and password are required."); return;
    }
    setLoading(true); setError("");
    const { data, error: err } = await supabase.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password,
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    onAuth(data.user);
  }

  return (
    <>
      <style>{S}</style>
      <div className="auth-root">
        <div className="auth-card">
          <div className="auth-logo">Playbook<span>AI</span></div>
          <div className="auth-tagline">Multi-location operations platform</div>

          <div className="auth-tabs">
            <button className={`auth-tab${mode === "signup" ? " active" : ""}`} onClick={() => { setMode("signup"); setError(""); setSuccess(""); }}>
              Start Free Trial
            </button>
            <button className={`auth-tab${mode === "login" ? " active" : ""}`} onClick={() => { setMode("login"); setError(""); setSuccess(""); }}>
              Log In
            </button>
          </div>

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          {mode === "signup" ? (
            <form onSubmit={handleSignup}>
              <div className="auth-trial-badge">
                ✓ 14-day free trial — no credit card required
              </div>
              <div className="auth-field">
                <label className="auth-label">Your Name</label>
                <input className="auth-input" type="text" placeholder="James Whitfield" value={form.name} onChange={e => set("name", e.target.value)} />
              </div>
              <div className="auth-field">
                <label className="auth-label">Business Name</label>
                <input className="auth-input" type="text" placeholder="Whitfield Auto Group" value={form.business} onChange={e => set("business", e.target.value)} />
              </div>
              <div className="auth-field">
                <label className="auth-label">Email</label>
                <input className="auth-input" type="email" placeholder="you@yourbusiness.com" value={form.email} onChange={e => set("email", e.target.value)} />
              </div>
              <div className="auth-field">
                <label className="auth-label">Password</label>
                <input className="auth-input" type="password" placeholder="Min. 8 characters" value={form.password} onChange={e => set("password", e.target.value)} />
              </div>
              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? "Creating Account..." : "Start Free Trial →"}
              </button>
              <div className="auth-footer">
                By signing up you agree to our Terms of Service and Privacy Policy.
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin}>
              <div className="auth-field">
                <label className="auth-label">Email</label>
                <input className="auth-input" type="email" placeholder="you@yourbusiness.com" value={form.email} onChange={e => set("email", e.target.value)} />
              </div>
              <div className="auth-field">
                <label className="auth-label">Password</label>
                <input className="auth-input" type="password" placeholder="Your password" value={form.password} onChange={e => set("password", e.target.value)} />
              </div>
              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? "Logging In..." : "Log In →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
