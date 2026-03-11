import React from "react";

export default function Fab({ onClick, label }) {
  return (
    <button
      className="btn btn-primary fixed bottom-5 right-5 shadow-lg font-[Special_Elite] rounded-[3px] hidden lg:inline-flex"
      onClick={onClick}
      aria-label={label || "Create post"}
    >
      <span style={{ fontSize: 20, lineHeight: 1 }}>+</span>
      <span>{label || "New Report"}</span>
    </button>
  );
}
