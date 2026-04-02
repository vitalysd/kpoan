"use client";

import {
  type CSSProperties,
  type HTMLAttributes,
  useEffect,
  useRef,
  useState,
} from "react";

type RevealProps = HTMLAttributes<HTMLDivElement> & {
  delay?: number;
  distance?: number;
  once?: boolean;
};

export function Reveal({
  children,
  className = "",
  delay = 0,
  distance = 36,
  once = true,
  style,
  ...props
}: RevealProps) {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timeoutId = setTimeout(() => {
            setIsVisible(true);
            if (once) observer.unobserve(entry.target);
          }, 90);
        } else if (!once) {
          if (timeoutId) clearTimeout(timeoutId);
          setIsVisible(false);
        }
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -12% 0px",
      },
    );

    observer.observe(element);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [once]);

  return (
    <div
      ref={elementRef}
      className={`reveal ${isVisible ? "is-visible" : ""} ${className}`}
      style={
        {
          "--reveal-delay": `${delay}ms`,
          "--reveal-distance": `${distance}px`,
          ...style,
        } as CSSProperties
      }
      {...props}
    >
      {children}
    </div>
  );
}
