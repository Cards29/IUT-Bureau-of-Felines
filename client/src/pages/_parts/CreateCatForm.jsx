import React from "react";
import toast from "react-hot-toast";

export default function CreateCatForm({ onCreated }) {
  const [name, setName] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [photo, setPhoto] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState(null);

  async function submit() {
    setError(null);
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
      toast.success("Registration request submitted. Pending approval.");
      onCreated?.(data);
    } catch (e) {
      setError(e.message);
      toast.error(e.message || "Failed to submit request.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="text-base-content/60 text-xs tracking-wide uppercase mb-1.5">Name *</div>
      <input className="input input-bordered w-full" value={name} onChange={e => setName(e.target.value)} placeholder="Feline's full name" />
      <div className="h-3" />
      <div className="text-base-content/60 text-xs tracking-wide uppercase mb-1.5">Bio</div>
      <textarea className="textarea textarea-bordered w-full" value={bio} onChange={e => setBio(e.target.value)} placeholder="Brief description of the feline..." />
      <div className="h-3" />
      <div className="text-base-content/60 text-xs tracking-wide uppercase mb-1.5">Photo</div>
      <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files?.[0] || null)} />
      <div className="h-4" />
      {error && <div className="text-error text-xs mt-1 mb-2.5">{error}</div>}
      <button className="btn btn-primary" disabled={saving} onClick={submit}>
        {saving ? "Submitting..." : "Submit Request"}
      </button>
    </div>
  );
}
