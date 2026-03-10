import React from "react";

export default function CreateCatForm({ onCreated }) {
  const [name, setName] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [photo, setPhoto] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [success, setSuccess] = React.useState(null);

  async function submit() {
    setError(null);
    setSuccess(null);
    if (!name.trim()) return setError("Name is required");

    const form = new FormData();
    form.append("name", name);
    form.append("bio", bio);
    if (photo) form.append("photo", photo);

    setSaving(true);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const res = await fetch(`${API_BASE}/cats`, { method: "POST", credentials: "include", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");

      setName(""); setBio(""); setPhoto(null);
      setSuccess("Your request has been submitted and is pending approval.");
      onCreated?.(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="muted" style={{ marginBottom: 8 }}>Name</div>
      <input className="input" value={name} onChange={e => setName(e.target.value)} />
      <div style={{ height: 10 }} />
      <div className="muted" style={{ marginBottom: 8 }}>Bio</div>
      <textarea className="input" value={bio} onChange={e => setBio(e.target.value)} />
      <div style={{ height: 10 }} />
      <div className="muted" style={{ marginBottom: 8 }}>Photo</div>
      <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files?.[0] || null)} />
      <div style={{ height: 14 }} />
      {error && <div style={{ color: "red", fontSize: 12, marginBottom: 8 }}>{error}</div>}
      {success && <div style={{ color: "green", fontSize: 12, marginBottom: 8 }}>{success}</div>}
      <button className="btn primary" disabled={saving} onClick={submit}>
        {saving ? "Requesting..." : "Request"}
      </button>
    </div>
  );
}