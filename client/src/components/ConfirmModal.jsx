import React from "react";

export default function ConfirmModal({ 
  open, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmText = "Delete",
  cancelText = "Cancel",
  isDanger = false,
  isLoading = false
}) {
  React.useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onCancel?.();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="modalOverlay" onMouseDown={onCancel}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <div style={{ fontWeight: 900 }}>{title}</div>
        </div>
        <div className="modalBody">
          <p style={{ marginBottom: 20, color: "var(--text)" }}>{message}</p>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button 
              className="btn" 
              onClick={onCancel}
              disabled={isLoading}
            >
              {cancelText}
            </button>
            <button 
              className={`btn ${isDanger ? "danger" : "primary"}`}
              onClick={onConfirm}
              disabled={isLoading}
              style={isDanger ? { 
                background: "#dc2626", 
                borderColor: "#dc2626", 
                color: "white" 
              } : {}}
            >
              {isLoading ? "..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
