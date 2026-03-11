import React from "react";

export default function Fab({ onClick, label }) {
  return (
    <button className="fab" onClick={onClick} aria-label={label || "Create post"}>
      <span style={{ fontSize: 20, lineHeight: 1 }}>+</span>
      <span>{label || "New Report"}</span>
    </button>
  );
}
