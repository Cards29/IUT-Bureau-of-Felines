import React from "react";
import { apiFetch } from "../../utils/api";

export default function CreatePostForm({ onCreated, fixedCatId }) {
  const [cats, setCats] = React.useState([]);
  const [catId, setCatId] = React.useState(fixedCatId || "");
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [images, setImages] = React.useState([]);
  const [previews, setPreviews] = React.useState([]);
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

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files || []);
    const remaining = 5 - images.length;
    const toAdd = selected.slice(0, remaining);

    if (selected.length > remaining) {
      alert("Maximum 5 images allowed per post");
    }

    const newImages = [...images, ...toAdd];
    setImages(newImages);

    const newPreviews = toAdd.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(previews[index]);
    setImages(images.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  async function submit() {
    if (!catId) return alert("Choose a cat");
    if (!title.trim()) return alert("Title is required");

    const form = new FormData();
    form.append("catId", catId);
    form.append("title", title);
    form.append("body", body);
    images.forEach(img => form.append("images", img));

    setSaving(true);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const res = await fetch(`${API_BASE}/posts`, { method: "POST", credentials: "include", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");

      setTitle(""); setBody(""); setImages([]);
      previews.forEach(p => URL.revokeObjectURL(p));
      setPreviews([]);
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
      <div className="muted" style={{ marginBottom: 8 }}>Images (max 5)</div>
      <input type="file" multiple accept="image/*" onChange={handleFiles} disabled={images.length >= 5} />
      {previews.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          {previews.map((url, i) => (
            <div key={url} style={{ position: "relative" }}>
              <img src={url} alt="preview" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 4 }} />
              <button 
                onClick={() => removeImage(i)}
                style={{
                  position: "absolute", top: -6, right: -6, background: "red", color: "white", 
                  border: "none", borderRadius: "50%", width: 18, height: 18, cursor: "pointer",
                  fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center"
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <div style={{ height: 14 }} />
      <button className="btn primary" disabled={saving} onClick={submit}>
        {saving ? "Posting..." : "Post"}
      </button>
    </div>
  );
}