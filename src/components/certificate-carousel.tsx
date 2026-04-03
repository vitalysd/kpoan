"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Reveal } from "@/components/reveal";

const certificates = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  src: `/certificate_${index + 1}.jpg`,
  alt: `Сертификат ${index + 1}`,
}));

export function CertificateCarousel() {
  const [selectedCertificate, setSelectedCertificate] = useState<string | null>(
    null,
  );

  const carouselItems = useMemo(
    () => [...certificates, ...certificates],
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

  return (
    <>
      <section className="relative overflow-hidden bg-white py-10 md:py-14">
        <div className="container mx-auto px-4 lg:px-8">
          <Reveal>
            <div className="certificate-carousel group relative">
              <div className="certificate-carousel__fade-left" />
              <div className="certificate-carousel__fade-right" />

              <div className="certificate-carousel__track group-hover:[animation-play-state:paused]">
                {carouselItems.map((certificate, index) => (
                  <button
                    key={`${certificate.id}-${index}`}
                    type="button"
                    onClick={() => setSelectedCertificate(certificate.src)}
                    className="certificate-carousel__card"
                    aria-label={`Открыть ${certificate.alt}`}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-slate-900">
                      <Image
                        src={certificate.src}
                        alt={certificate.alt}
                        fill
                        sizes="(max-width: 768px) 70vw, 22vw"
                        className="object-cover"
                      />
                    </div>
                  </button>
                ))}
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
