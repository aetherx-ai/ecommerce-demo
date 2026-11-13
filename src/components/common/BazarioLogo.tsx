import React from 'react';
import { Language } from '../../types/bazario';

interface BazarioLogoProps {
  lang?: Language;
  darkText?: boolean;
  compact?: boolean;
}

export const BazarioLogo: React.FC<BazarioLogoProps> = ({
  lang = 'bn',
  darkText = true,
  compact = false,
}) => {
  return (
    <span className="inline-flex items-center gap-2.5 select-none whitespace-nowrap shrink-0">
      <svg
        width="32"
        height="32"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect width="36" height="36" rx="8" fill="#F85606" />
        <path
          d="M10.5 13H25.5L23.8 26.5H12.2L10.5 13Z"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path
          d="M14.5 13V10.5C14.5 8.567 16.067 7 18 7C19.933 7 21.5 8.567 21.5 10.5V13"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="18" cy="19.5" r="2.1" fill="#FFFFFF" />
      </svg>
      <span className="flex flex-col leading-none">
        <span
          className={`text-lg font-bold tracking-tight ${
            darkText ? 'text-[#172337]' : 'text-white'
          }`}
        >
          BAZARIO
        </span>
        {!compact && (
          <span
            className={`text-[10px] font-medium tracking-wide mt-0.5 ${
              darkText ? 'text-[#6B7280]' : 'text-white/75'
            }`}
          >
            {lang === 'bn' ? 'বাজারিও বাংলাদেশ' : 'BANGLADESH'}
          </span>
        )}
      </span>
    </span>
  );
};
