import React from "react";

export default function InfiniteSentinel({ onVisible, disabled }) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (disabled) return;
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) onVisible?.();
    }, { rootMargin: "200px" });

    obs.observe(el);
    return () => obs.disconnect();
  }, [onVisible, disabled]);

  return <div ref={ref} style={{ height: 1 }} />;
}