import React, { memo, useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import { getImageVariant } from '../../data/imageVariants';

interface ResilientImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackTitle?: string;
  sizes?: string;
  priority?: boolean;
}

export const ResilientImage: React.FC<ResilientImageProps> = memo(({
  src,
  alt,
  className = '',
  fallbackTitle,
  loading,
  decoding,
  sizes,
  priority = false,
  width,
  height,
  fetchPriority,
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

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

  const variant = getImageVariant(src);
  const resolvedLoading = loading ?? (priority ? 'eager' : 'lazy');
  const resolvedDecoding = decoding ?? (priority ? 'sync' : 'async');
  const resolvedFetchPriority = fetchPriority ?? (priority ? 'high' : undefined);
  const resolvedWidth = width ?? variant?.width;
  const resolvedHeight = height ?? variant?.height;

  const imgEl = (
    <img
      src={src}
      alt={alt}
      width={resolvedWidth}
      height={resolvedHeight}
      loading={resolvedLoading}
      decoding={resolvedDecoding}
      fetchPriority={resolvedFetchPriority}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
      {...rest}
    />
  );

  if (!variant) {
    return imgEl;
  }

  return (
    <picture className="contents">
      <source
        type="image/webp"
        srcSet={`${variant.sm} ${variant.smWidth}w, ${variant.lg} ${variant.lgWidth}w`}
        sizes={sizes ?? '(max-width: 640px) 48vw, (max-width: 1024px) 32vw, 280px'}
      />
      {imgEl}
    </picture>
  );
});

ResilientImage.displayName = 'ResilientImage';
