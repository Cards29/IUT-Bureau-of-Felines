import React from "react";

export default function Modal({ open, title, onClose, children }) {
  React.useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modalOverlay" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <div style={{ fontWeight: 900 }}>{title}</div>
          <button className="btn small" onClick={onClose}>Close</button>
        </div>
        <div className="modalBody">{children}</div>
      </div>
    </div>
  );
}