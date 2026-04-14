"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { Reveal } from "@/components/reveal";

const AUTO_SCROLL_SPEED = 36;

const certificates = Array.from({ length: 13 }, (_, index) => ({
  id: index + 1,
  src: `/certificate_${index + 1}.jpg`,
  alt: `Сертификат ${index + 1}`,
}));

export function CertificateCarousel() {
  const [selectedCertificate, setSelectedCertificate] = useState<string | null>(
    null,
  );
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const pausedRef = useRef(false);
  const draggingRef = useRef(false);
  const autoScrollRemainderRef = useRef(0);
  const dragStateRef = useRef({
    active: false,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
  });

  const carouselItems = useMemo(
    () => [...certificates, ...certificates, ...certificates],
    [],
  );

  useEffect(() => {
    if (!selectedCertificate) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedCertificate(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedCertificate]);

  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    draggingRef.current = isDragging;
  }, [isDragging]);

  const normalizeViewportScroll = (viewport: HTMLDivElement) => {
    const segmentWidth = viewport.scrollWidth / 3;

    if (segmentWidth <= 0) {
      return;
    }

    if (viewport.scrollLeft <= segmentWidth * 0.25) {
      viewport.scrollLeft += segmentWidth;
    } else if (viewport.scrollLeft >= segmentWidth * 1.75) {
      viewport.scrollLeft -= segmentWidth;
    }
  };

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    let frameId = 0;
    let lastTimestamp = 0;

    const getSegmentWidth = () => viewport.scrollWidth / 3;

    const normalizeScroll = () => {
      const segmentWidth = getSegmentWidth();

      if (segmentWidth <= 0) {
        return;
      }

      if (viewport.scrollLeft <= segmentWidth * 0.25) {
        viewport.scrollLeft += segmentWidth;
      } else if (viewport.scrollLeft >= segmentWidth * 1.75) {
        viewport.scrollLeft -= segmentWidth;
      }
    };

    const centerTrack = () => {
      const segmentWidth = getSegmentWidth();

      if (segmentWidth > 0 && viewport.scrollLeft === 0) {
        viewport.scrollLeft = segmentWidth;
      }
    };

    const tick = (timestamp: number) => {
      centerTrack();

      if (lastTimestamp === 0) {
        lastTimestamp = timestamp;
      }

      if (!pausedRef.current && !draggingRef.current) {
        const delta = timestamp - lastTimestamp;
        const nextOffset =
          autoScrollRemainderRef.current + (AUTO_SCROLL_SPEED * delta) / 1000;
        const wholePixels = Math.trunc(nextOffset);

        if (wholePixels !== 0) {
          viewport.scrollLeft += wholePixels;
          autoScrollRemainderRef.current = nextOffset - wholePixels;
        } else {
          autoScrollRemainderRef.current = nextOffset;
        }

        normalizeScroll();
      }

      lastTimestamp = timestamp;
      frameId = window.requestAnimationFrame(tick);
    };

    const onResize = () => {
      const segmentWidth = getSegmentWidth();

      if (segmentWidth > 0) {
        viewport.scrollLeft = segmentWidth;
      }
    };

    centerTrack();
    frameId = window.requestAnimationFrame(tick);
    window.addEventListener("resize", onResize);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    const stopDraggingGlobally = () => {
      dragStateRef.current.active = false;
      setIsDragging(false);
      setIsPaused(false);
    };

    const handleMouseMove = (event: MouseEvent) => {
      const viewport = viewportRef.current;
      const dragState = dragStateRef.current;

      if (!viewport || !dragState.active) {
        return;
      }

      const offsetX = event.clientX - dragState.startX;

      if (Math.abs(offsetX) > 6) {
        dragStateRef.current.moved = true;
      }

      viewport.scrollLeft = dragState.startScrollLeft - offsetX;
      normalizeViewportScroll(viewport);
    };

    const handleTouchMove = (event: TouchEvent) => {
      const viewport = viewportRef.current;
      const dragState = dragStateRef.current;
      const touch = event.touches[0];

      if (!viewport || !dragState.active || !touch) {
        return;
      }

      const offsetX = touch.clientX - dragState.startX;

      if (Math.abs(offsetX) > 6) {
        dragStateRef.current.moved = true;
      }

      viewport.scrollLeft = dragState.startScrollLeft - offsetX;
      normalizeViewportScroll(viewport);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopDraggingGlobally);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", stopDraggingGlobally);
    window.addEventListener("touchcancel", stopDraggingGlobally);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopDraggingGlobally);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", stopDraggingGlobally);
      window.removeEventListener("touchcancel", stopDraggingGlobally);
    };
  }, [isDragging]);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    dragStateRef.current = {
      active: true,
      startX: event.clientX,
      startScrollLeft: viewport.scrollLeft,
      moved: false,
    };

    setIsPaused(true);
    setIsDragging(true);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    const touch = event.touches[0];

    if (!viewport || !touch) {
      return;
    }

    dragStateRef.current = {
      active: true,
      startX: touch.clientX,
      startScrollLeft: viewport.scrollLeft,
      moved: false,
    };

    setIsPaused(true);
    setIsDragging(true);
  };

  return (
    <>
      <section className="relative overflow-hidden bg-white py-10 md:py-14">
        <div className="container mx-auto px-4 lg:px-8">
          <Reveal>
            <div className="certificate-carousel group relative">
              <div className="certificate-carousel__fade-left" />
              <div className="certificate-carousel__fade-right" />

              <div
                ref={viewportRef}
                className={`certificate-carousel__viewport ${isDragging ? "is-dragging" : ""}`}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
              >
                <div className="certificate-carousel__track">
                  {carouselItems.map((certificate, index) => (
                    <button
                      key={`${certificate.id}-${index}`}
                      type="button"
                      onClick={(event) => {
                        if (event.detail !== 0) {
                          if (dragStateRef.current.moved) {
                            dragStateRef.current.moved = false;
                            return;
                          }

                          setSelectedCertificate(certificate.src);
                          return;
                        }

                        setSelectedCertificate(certificate.src);
                      }}
                      onMouseEnter={() => setIsPaused(true)}
                      onMouseLeave={() => setIsPaused(false)}
                      className="certificate-carousel__card"
                      aria-label={`Открыть ${certificate.alt}`}
                      draggable={false}
                    >
                      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
                        <Image
                          src={certificate.src}
                          alt={certificate.alt}
                          fill
                          sizes="(max-width: 768px) 70vw, 22vw"
                          className="object-cover"
                          draggable={false}
                        />
                        <div className="certificate-carousel__image-overlay" />
                        <div className="certificate-carousel__zoom-indicator">
                          <Search className="h-5 w-5" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {selectedCertificate ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/92 p-4 backdrop-blur-sm"
          onClick={() => setSelectedCertificate(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Полноразмерный просмотр сертификата"
        >
          <button
            type="button"
            onClick={() => setSelectedCertificate(null)}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Закрыть просмотр"
          >
            <X className="h-5 w-5" />
          </button>

          <div
            className="relative h-[85vh] w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={selectedCertificate}
              alt="Сертификат в полном размере"
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
