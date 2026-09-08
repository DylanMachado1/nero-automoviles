'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';

type GalleryImage = { src: string; alt: string };

export function VehicleGallery({ images }: { images: GalleryImage[] }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const move = useCallback((direction: number) => {
    setActive((current) => (current + direction + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
      if (event.key === 'ArrowLeft') move(-1);
      if (event.key === 'ArrowRight') move(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, move]);

  if (!images.length) return <div className="gallery-empty">Fotografías pendientes</div>;

  return (
    <>
      <div className="vehicle-gallery-main">
        <button type="button" className="gallery-open" onClick={() => setOpen(true)} aria-label="Ampliar fotografía" onTouchStart={(event) => setTouchStart(event.touches[0].clientX)} onTouchEnd={(event) => { if (touchStart === null) return; const delta = event.changedTouches[0].clientX - touchStart; if (Math.abs(delta) > 45 && images.length > 1) move(delta > 0 ? -1 : 1); setTouchStart(null); }}>
          <img src={images[active].src} alt={images[active].alt} decoding="async" />
          <span><Expand /> Ampliar</span>
        </button>
        {images.length > 1 && (
          <div className="vehicle-thumbnails" aria-label="Fotografías del vehículo">
            {images.map((image, index) => (
              <button key={image.src} type="button" onClick={() => setActive(index)} aria-current={active === index}>
                <img src={image.src} alt="" loading="lazy" decoding="async" />
                <span className="sr-only">Ver fotografía {index + 1}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {open && (
        <dialog className="lightbox" open aria-label="Galería ampliada">
          <button className="lightbox-close" type="button" onClick={() => setOpen(false)} aria-label="Cerrar galería"><X /></button>
          {images.length > 1 && <button className="lightbox-prev" type="button" onClick={() => move(-1)} aria-label="Foto anterior"><ChevronLeft /></button>}
          <img src={images[active].src} alt={images[active].alt} />
          {images.length > 1 && <button className="lightbox-next" type="button" onClick={() => move(1)} aria-label="Foto siguiente"><ChevronRight /></button>}
          <p>{active + 1} / {images.length}</p>
        </dialog>
      )}
    </>
  );
}
