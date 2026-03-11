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
    <dialog className="modal modal-open">
      <div className="modal-box w-full max-w-[720px] max-h-[88vh] overflow-y-auto p-0 rounded-[3px]">
        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-base-300 bg-base-200">
          <div style={{ fontWeight: 900 }}>{title}</div>
        </div>
        <div className="p-4">
          <p style={{ marginBottom: 20 }}>{message}</p>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              className="btn"
              onClick={onCancel}
              disabled={isLoading}
            >
              {cancelText}
            </button>
            <button
              className={`btn ${isDanger ? "btn-error" : "btn-primary"}`}
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? "..." : confirmText}
            </button>
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onCancel} />
      </form>
    </dialog>
  );
}
