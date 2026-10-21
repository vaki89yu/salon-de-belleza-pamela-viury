"use client";

import React from "react";

interface BrandLogoProps {
  variant?: "dark" | "light";
  compact?: boolean;
  className?: string;
}

/**
 * PAMELA VIURY — Official Brand Identity
 * Architectural double-arch crest with an interwoven PV monogram,
 * desert star jewel and couture needle line. Champagne gold + noir + rosewood.
 */
export function BrandLogo({
  variant = "dark",
  compact = false,
  className = "",
}: BrandLogoProps) {
  const textPrimary =
    variant === "light" ? "text-[#FBF8F3]" : "text-[#21171D]";
  const textSecondary =
    variant === "light" ? "text-[#E3C99B]" : "text-[#8C6A3F]";
  const monogramInk = variant === "light" ? "#FBF8F3" : "#21171D";

  return (
    <div className={`inline-flex items-center gap-3.5 select-none ${className}`}>
      {/* PV Arch Crest */}
      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full drop-shadow-xs"
          aria-hidden="true"
        >
          {/* Outer couture arch */}
          <path
            d="M9 57V27C9 14.2975 19.2975 4 32 4C44.7025 4 55 14.2975 55 27V57H9Z"
            stroke="#B8915C"
            strokeWidth="1.7"
          />
          {/* Inner rosewood hairline arch */}
          <path
            d="M13.5 53.5V27C13.5 16.7827 21.7827 8.5 32 8.5C42.2173 8.5 50.5 16.7827 50.5 27V53.5H13.5Z"
            stroke="#7A2E43"
            strokeOpacity="0.55"
            strokeWidth="1"
          />
          {/* Desert star jewel */}
          <path
            d="M32 11.5L33.4 15.6L37.5 17L33.4 18.4L32 22.5L30.6 18.4L26.5 17L30.6 15.6L32 11.5Z"
            fill="#B8915C"
          />
          {/* Letter P — upright stem + couture bowl */}
          <path
            d="M23 48V25.5H31.5C35.4 25.5 38 28.1 38 31.6C38 35.1 35.4 37.7 31.5 37.7H23"
            stroke={monogramInk}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Letter V — gold interwoven stroke */}
          <path
            d="M29.5 25.5L37.5 46L45.5 25.5"
            stroke="#B8915C"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Viury signature dot */}
          <circle cx="45.8" cy="47.6" r="1.7" fill="#7A2E43" />
        </svg>
      </div>

      {!compact && (
        <div className="flex flex-col leading-none">
          <span
            className={`text-[0.58rem] font-semibold tracking-[0.42em] uppercase ${textSecondary}`}
          >
            Salón de Belleza
          </span>
          <span
            className={`font-display mt-1.5 text-[1.55rem] leading-none font-normal tracking-[0.14em] uppercase ${textPrimary}`}
          >
            Pamela Viury
          </span>
          <span
            className={`mt-1.5 text-[0.58rem] font-medium tracking-[0.32em] uppercase ${textSecondary}`}
          >
            Alta Estética · Cd. Juárez, Chih.
          </span>
        </div>
      )}
    </div>
  );
}

/** Rotating certified wax-style seal used on hero, tickets and download centre. */
export function OfficialSealBadge({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative inline-flex h-28 w-28 items-center justify-center select-none ${className}`}
    >
      <svg
        viewBox="0 0 140 140"
        className="h-full w-full animate-[spin_30s_linear_infinite]"
        aria-hidden="true"
      >
        <defs>
          <path
            id="pamelaViurySealCircle"
            d="M 70, 70 m -52, 0 a 52,52 0 1,1 104,0 a 52,52 0 1,1 -104,0"
          />
        </defs>
        <circle
          cx="70"
          cy="70"
          r="64"
          fill="none"
          stroke="#B8915C"
          strokeWidth="1.2"
          strokeDasharray="3 3"
        />
        <circle
          cx="70"
          cy="70"
          r="42"
          fill="none"
          stroke="#7A2E43"
          strokeWidth="1"
          strokeOpacity="0.55"
        />
        <text
          fill="#8C6A3F"
          fontSize="8"
          fontWeight="600"
          letterSpacing="2.4px"
        >
          <textPath href="#pamelaViurySealCircle" startOffset="0%">
            PAMELA VIURY • FOLIO OFICIAL • CD. JUÁREZ CHIH. •
          </textPath>
        </text>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-xl tracking-[0.18em] text-[#21171D]">
          PV
        </span>
        <span className="mt-0.5 text-[8px] font-semibold tracking-[0.22em] uppercase text-[#7A2E43]">
          Certificado
        </span>
      </div>
    </div>
  );
}

/** Large signature lockup for manifesto, footer statements and gift documents. */
export function PamelaSignature({
  variant = "dark",
  className = "",
}: {
  variant?: "dark" | "light";
  className?: string;
}) {
  return (
    <div className={`select-none ${className}`}>
      <p
        className={`font-script text-5xl leading-none ${
          variant === "light" ? "text-[#E3C99B]" : "text-[#7A2E43]"
        }`}
      >
        Pamela Viury
      </p>
      <p
        className={`mt-2 text-[0.62rem] font-semibold tracking-[0.38em] uppercase ${
          variant === "light" ? "text-[#FBF8F3]/80" : "text-[#8C6A3F]"
        }`}
      >
        Fundadora & Directora Creativa
      </p>
    </div>
  );
}
