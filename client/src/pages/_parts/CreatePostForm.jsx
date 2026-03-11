import React from "react";
import toast from "react-hot-toast";
import { apiFetch } from "../../utils/api";

export default function CreatePostForm({ onCreated, fixedCatId }) {
  const [cats, setCats] = React.useState([]);
  const [catId, setCatId] = React.useState(fixedCatId || "");
  const [type, setType] = React.useState("commendation");
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [images, setImages] = React.useState([]);
  const [previews, setPreviews] = React.useState([]);
  const [video, setVideo] = React.useState(null);
  const [videoPreview, setVideoPreview] = React.useState(null);
  const [loadingCats, setLoadingCats] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

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

  const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
  const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
  const MAX_VIDEO_DURATION = 30;

  const handleFiles = (e) => {
    setError("");
    const selected = Array.from(e.target.files || []);

    const nonImages = selected.filter(f => !f.type.startsWith("image/"));
    if (nonImages.length > 0) {
      setError(`Only image files are allowed: ${nonImages.map(f => f.name).join(", ")}`);
      return;
    }

    const tooBig = selected.filter(f => f.size > MAX_IMAGE_SIZE);
    if (tooBig.length > 0) {
      setError(`These files exceed the 5MB limit: ${tooBig.map(f => f.name).join(", ")}`);
      return;
    }

    const remaining = 5 - images.length;
    if (selected.length > remaining) {
      setError("Maximum 5 images allowed per post");
    }
    const toAdd = selected.slice(0, remaining);

    setImages(prev => [...prev, ...toAdd]);
    setPreviews(prev => [...prev, ...toAdd.map(file => URL.createObjectURL(file))]);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(previews[index]);
    setImages(images.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleVideo = (e) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;

    const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      setError("Invalid video format. Allowed: mp4, webm, mov");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_VIDEO_SIZE) {
      setError(`Video exceeds the 50MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
      e.target.value = "";
      return;
    }

    const url = URL.createObjectURL(file);
    const el = document.createElement("video");
    el.preload = "metadata";
    el.src = url;
    el.onloadedmetadata = () => {
      if (el.duration > MAX_VIDEO_DURATION) {
        URL.revokeObjectURL(url);
        setError(`Video exceeds the 30-second limit (${Math.round(el.duration)}s)`);
        e.target.value = "";
        return;
      }
      setVideo(file);
      setVideoPreview(url);
    };
    el.onerror = () => {
      URL.revokeObjectURL(url);
      setError("Could not read video file. Please try another file.");
      e.target.value = "";
    };
  };

  const removeVideo = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideo(null);
    setVideoPreview(null);
  };

  async function submit() {
    if (!catId) return setError("Choose a cat");
    if (!title.trim()) return setError("Title is required");
    setError("");

    const form = new FormData();
    form.append("catId", catId);
    form.append("type", type);
    form.append("title", title);
    form.append("body", body);
    images.forEach(img => form.append("images", img));
    if (video) form.append("video", video);

    setSaving(true);
    const toastId = toast.loading("Filing report...");
    try {
      const data = await apiFetch("/posts", { method: "POST", body: form });

      setTitle(""); setBody(""); setImages([]);
      previews.forEach(p => URL.revokeObjectURL(p));
      setPreviews([]);
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      setVideo(null);
      setVideoPreview(null);
      toast.success("Report filed successfully.", { id: toastId });
      onCreated?.(data);
    } catch (e) {
      toast.error(e.message || "Upload failed. Please try again.", { id: toastId });
      setError(e.message || "Upload failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const labelStyle = { marginBottom: 6, fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--muted)" };

  return (
    <div>
      {!fixedCatId ? (
        <>
          <div style={labelStyle}>Cat</div>
          <select className="input" value={catId} onChange={e => setCatId(e.target.value)} disabled={loadingCats}>
            <option value="">{loadingCats ? "Loading..." : "Select a cat"}</option>
            {cats.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <div style={{ height: 12 }} />
        </>
      ) : null}

      <div style={labelStyle}>Report Type</div>
      <div className="row" style={{ gap: 8, marginBottom: 14 }}>
        <button
          type="button"
          className={`btn${type === "commendation" ? " primary" : ""}`}
          onClick={() => setType("commendation")}
        >
          Commendation
        </button>
        <button
          type="button"
          className={`btn${type === "infraction" ? " primary" : ""}`}
          onClick={() => setType("infraction")}
        >
          Infraction
        </button>
      </div>

      <div style={labelStyle}>Title *</div>
      <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Brief subject line..." />
      <div style={{ height: 12 }} />
      <div style={labelStyle}>Details</div>
      <textarea className="input" value={body} onChange={e => setBody(e.target.value)} placeholder="Describe the incident in full..." />
      <div style={{ height: 12 }} />

      <div style={labelStyle}>Images (max 5)</div>
      <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>Max 5MB per image. Cannot be combined with a video.</div>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFiles}
        disabled={images.length >= 5 || video !== null}
      />
      {previews.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          {previews.map((url, i) => (
            <div key={url} style={{ position: "relative" }}>
              <img src={url} alt="preview" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 3, border: "1px solid var(--border)" }} />
              <button
                onClick={() => removeImage(i)}
                style={{
                  position: "absolute", top: -6, right: -6, background: "var(--danger)", color: "white",
                  border: "none", borderRadius: "50%", width: 18, height: 18, cursor: "pointer",
                  fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ height: 14 }} />
      <div style={labelStyle}>Video (max 30s)</div>
      <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>Max 50MB. Allowed formats: mp4, webm, mov. Cannot be combined with images.</div>
      {!videoPreview ? (
        <input
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          onChange={handleVideo}
          disabled={images.length > 0}
        />
      ) : (
        <div style={{ position: "relative", display: "inline-block" }}>
          <video
            src={videoPreview}
            muted
            style={{ width: 160, borderRadius: 3, display: "block", border: "1px solid var(--border)" }}
          />
          <button
            onClick={removeVideo}
            style={{
              position: "absolute", top: -6, right: -6, background: "var(--danger)", color: "white",
              border: "none", borderRadius: "50%", width: 18, height: 18, cursor: "pointer",
              fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            &times;
          </button>
        </div>
      )}

      <div style={{ height: 16 }} />
      <button className="btn primary" disabled={saving} onClick={submit}>
        {saving ? "Filing... (this may take a moment)" : "File Report"}
      </button>
      {error && <div style={{ color: "var(--danger)", marginTop: 10, fontSize: 13 }}>{error}</div>}
    </div>
  );
}
