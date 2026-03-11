import React from "react";
import Modal from "./Modal";
import { useAuth } from "../state/auth";
import { apiFetch, getApiBase } from "../utils/api";

export default function AuthModal() {
  const { loginOpen, closeLogin, refresh } = useAuth();

  const [mode, setMode] = React.useState("login");
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  function switchMode(next) {
    setMode(next);
    setError("");
    setSaving(false);
  }

  function handleClose() {
    closeLogin();
    // Reset form state after the modal closes
    setTimeout(() => {
      setMode("login");
      setUsername("");
      setEmail("");
      setPassword("");
      setError("");
      setSaving(false);
    }, 200);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      await refresh();
      handleClose();
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
      });
      await refresh();
      handleClose();
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const apiBase = getApiBase();

  const divider = (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0" }}>
      <div style={{ flex: 1, height: 1, background: "var(--color-base-300)" }} />
      <span className="text-base-content/60 text-sm">or</span>
      <div style={{ flex: 1, height: 1, background: "var(--color-base-300)" }} />
    </div>
  );

  return (
    <Modal open={loginOpen} title={mode === "login" ? "Sign in" : "Register"} onClose={handleClose}>
      {mode === "login" ? (
        <form onSubmit={handleLogin}>
          <div className="text-base-content/60 text-sm" style={{ marginBottom: 6 }}>Email</div>
          <input
            className="input input-bordered w-full"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={saving}
            autoFocus
          />
          <div style={{ height: 12 }} />
          <div className="text-base-content/60 text-sm" style={{ marginBottom: 6 }}>Password</div>
          <input
            className="input input-bordered w-full"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={saving}
          />
          <div style={{ height: 16 }} />
          <button className="btn btn-primary w-full" type="submit" disabled={saving}>
            {saving ? "Signing in..." : "Sign in"}
          </button>
          {error && <div className="text-error text-xs mt-1">{error}</div>}
          {divider}
          <a className="btn w-full" href={`${apiBase}/auth/google`} style={{ textAlign: "center" }}>
            Continue with Google
          </a>
          <div style={{ marginTop: 16, fontSize: 14, textAlign: "center" }}>
            <span className="text-base-content/60 text-sm">New? </span>
            <button type="button" className="btn btn-sm" onClick={() => switchMode("register")}>
              Register here
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleRegister}>
          <div className="text-base-content/60 text-sm" style={{ marginBottom: 6 }}>Username</div>
          <input
            className="input input-bordered w-full"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            disabled={saving}
            autoFocus
          />
          <div style={{ height: 12 }} />
          <div className="text-base-content/60 text-sm" style={{ marginBottom: 6 }}>Email</div>
          <input
            className="input input-bordered w-full"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={saving}
          />
          <div style={{ height: 12 }} />
          <div className="text-base-content/60 text-sm" style={{ marginBottom: 6 }}>Password</div>
          <input
            className="input input-bordered w-full"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={saving}
          />
          <div style={{ height: 4 }} />
          <div className="text-base-content/60 text-sm" style={{ marginBottom: 12 }}>Minimum 8 characters</div>
          <button className="btn btn-primary w-full" type="submit" disabled={saving}>
            {saving ? "Creating account..." : "Create account"}
          </button>
          {error && <div className="text-error text-xs mt-1">{error}</div>}
          {divider}
          <a className="btn w-full" href={`${apiBase}/auth/google`} style={{ textAlign: "center" }}>
            Continue with Google
          </a>
          <div style={{ marginTop: 16, fontSize: 14, textAlign: "center" }}>
            <span className="text-base-content/60 text-sm">Already have an account? </span>
            <button type="button" className="btn btn-sm" onClick={() => switchMode("login")}>
              Sign in
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
