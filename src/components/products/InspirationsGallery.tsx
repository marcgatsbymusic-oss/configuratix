import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

interface InspirationsGalleryProps {
  images: string[];
}

export function InspirationsGallery({ images }: InspirationsGalleryProps) {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!images || images.length === 0) return null;

  return (
    <section className="bg-[#f9fafb] py-16 lg:py-24 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black uppercase tracking-widest text-black mb-4">
            {t('productDetail.inspirations', { defaultValue: 'Inspirations' })}
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
            {t('productDetail.inspirationsDesc', { defaultValue: 'See how our premium windows transform real-world living spaces.' })}
          </p>
        </div>

        {/* CSS Masonry Layout */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {images.map((src, idx) => (
            <div 
              key={idx} 
              className="break-inside-avoid relative group overflow-hidden cursor-zoom-in rounded-sm shadow-sm"
              onClick={() => setSelectedImage(src)}
            >
              <img 
                src={src} 
                alt={`Inspiration ${idx + 1}`} 
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 md:p-12"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white hover:text-mammut-gold transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X size={32} />
          </button>
          <img 
            src={selectedImage} 
            alt="Enlarged Inspiration" 
            className="max-w-full max-h-full object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
