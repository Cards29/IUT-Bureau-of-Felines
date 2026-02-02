import React from "react";
import { apiFetch } from "../utils/api";

export function useInfiniteFeed({ endpoint, limit = 10 }) {
  const [items, setItems] = React.useState([]);
  const [cursor, setCursor] = React.useState(null);
  const [hasMore, setHasMore] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

  async function loadMore(reset = false) {
    if (loading) return;
    if (!hasMore && !reset) return;
    setLoading(true);
    try {
      const cur = reset ? null : cursor;
      const qs = new URLSearchParams();
      qs.set("limit", String(limit));
      if (cur) qs.set("cursor", String(cur));
      const data = await apiFetch(`${endpoint}?${qs.toString()}`);

      if (reset) {
        setItems(data.items || []);
      } else {
        setItems(prev => [...prev, ...(data.items || [])]);
      }
      setHasMore(Boolean(data.hasMore));
      setCursor(data.nextCursor || null);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setItems([]);
    setCursor(null);
    setHasMore(true);
  }

  return { items, setItems, hasMore, loading, loadMore, reset };
}