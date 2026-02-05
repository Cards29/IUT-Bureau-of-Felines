import React from "react";

export default function CreateCatForm({ onCreated }) {
  const [name, setName] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [photo, setPhoto] = React.useState(null);
  const [saving, setSaving] = React.useState(false);

  async function submit() {
    if (!name.trim()) return alert("Name is required");

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
      onCreated?.(data);
    } catch (e) {
      alert(e.message);
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
      <button className="btn primary" disabled={saving} onClick={submit}>
        {saving ? "Saving..." : "Create"}
      </button>
    </div>
  );
}