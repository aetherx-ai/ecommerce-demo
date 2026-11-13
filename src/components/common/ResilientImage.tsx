import React, { useState } from 'react';
import { Package } from 'lucide-react';

interface ResilientImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackTitle?: string;
}

export const ResilientImage: React.FC<ResilientImageProps> = ({
  src,
  alt,
  className = '',
  fallbackTitle,
  loading = 'lazy',
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        role="img"
        aria-label={alt || fallbackTitle || 'BAZARIO Product'}
        className={`flex flex-col items-center justify-center bg-[#EEF0F4] text-[#6B7280] select-none ${className}`}
      >
        <Package className="w-6 h-6 stroke-[1.5] mb-1.5" />
        <span className="text-[11px] font-medium px-3 text-center line-clamp-2">
          {fallbackTitle || alt || 'BAZARIO'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
      {...rest}
    />
  );
};
