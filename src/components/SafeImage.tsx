import React, { useState } from 'react';
import { Layers } from 'lucide-react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackLabel?: string;
}

export function SafeImage({ src, alt, fallbackLabel, className = '', ...rest }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#1C1554] via-[#151042] to-[#0F0B2E] text-[#C7CEEA] ${className}`}
      >
        <Layers className="h-8 w-8 text-[#A855F7]/80" aria-hidden="true" />
        {fallbackLabel && (
          <span className="mt-2 px-4 text-center text-xs font-medium text-[#C7CEEA]">
            {fallbackLabel}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
      {...rest}
    />
  );
}
