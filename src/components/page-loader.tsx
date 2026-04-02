"use client";

import { useEffect, useState } from "react";

export function PageLoader() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const hideTimer = window.setTimeout(() => {
      setIsVisible(false);
    }, 850);

    return () => window.clearTimeout(hideTimer);
  }, []);

  return (
    <div
      aria-hidden={!isVisible}
      className={`page-loader ${isVisible ? "is-visible" : "is-hidden"}`}
    >
      <div className="page-loader__content">
        <div className="page-loader__mark">
          <span className="page-loader__ring" />
          <span className="page-loader__core" />
        </div>
        <div className="page-loader__title">КПОАН</div>
        <div className="page-loader__subtitle">Комплексные поставки оборудования</div>
      </div>
    </div>
  );
}
