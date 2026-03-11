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
    <dialog className="modal modal-open">
      <div className="modal-box w-full max-w-[720px] max-h-[88vh] overflow-y-auto p-0 rounded-[3px]">
        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-base-300 bg-base-200">
          <div style={{ fontWeight: 900 }}>{title}</div>
          <button className="btn btn-sm btn-ghost" onClick={onClose}>Close</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose} />
      </form>
    </dialog>
  );
}
