import React from "react";
import { apiFetch } from "../../utils/api";

export default function CreatePostForm({ onCreated, fixedCatId }) {
  const [cats, setCats] = React.useState([]);
  const [catId, setCatId] = React.useState(fixedCatId || "");
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [image, setImage] = React.useState(null);
  const [loadingCats, setLoadingCats] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  async function loadCats() {
    setLoadingCats(true);
    try {
      const data = await apiFetch(`/cats?limit=50`);
      setCats(data.items || []);
    } finally {
      setLoadingCats(false);
    }
  }

  React.useEffect(() => {
    if (!fixedCatId) loadCats();
  }, [fixedCatId]);

  React.useEffect(() => {
    if (fixedCatId) setCatId(fixedCatId);
  }, [fixedCatId]);

  async function submit() {
    if (!catId) return alert("Choose a cat");
    if (!title.trim()) return alert("Title is required");

    const form = new FormData();
    form.append("catId", catId);
    form.append("title", title);
    form.append("body", body);
    if (image) form.append("image", image);

    setSaving(true);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const res = await fetch(`${API_BASE}/posts`, { method: "POST", credentials: "include", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");

      setTitle(""); setBody(""); setImage(null);
      onCreated?.(data);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {!fixedCatId ? (
        <>
          <div className="muted" style={{ marginBottom: 8 }}>Cat</div>
          <select className="input" value={catId} onChange={e => setCatId(e.target.value)} disabled={loadingCats}>
            <option value="">{loadingCats ? "Loading..." : "Select a cat"}</option>
            {cats.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <div style={{ height: 12 }} />
        </>
      ) : null}

      <div className="muted" style={{ marginBottom: 8 }}>Title</div>
      <input className="input" value={title} onChange={e => setTitle(e.target.value)} />
      <div style={{ height: 12 }} />
      <div className="muted" style={{ marginBottom: 8 }}>Body</div>
      <textarea className="input" value={body} onChange={e => setBody(e.target.value)} />
      <div style={{ height: 12 }} />
      <div className="muted" style={{ marginBottom: 8 }}>Image</div>
      <input type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)} />
      <div style={{ height: 14 }} />
      <button className="btn primary" disabled={saving} onClick={submit}>
        {saving ? "Posting..." : "Post"}
      </button>
    </div>
  );
}