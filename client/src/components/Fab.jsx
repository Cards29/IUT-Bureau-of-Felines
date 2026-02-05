import React from "react";

export default function Fab({ onClick }) {
  return (
    <button className="fab" onClick={onClick} aria-label="Create post">
      +
    </button>
  );
}