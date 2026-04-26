import React from 'react';

export const IconWindows = ({ size = 24, className = "" }: { size?: number | string, className?: string }) => (
  <svg viewBox="0 0 40 40" width={size} height={size} className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <rect x="4" y="32" width="32" height="4" />
    <path fillRule="evenodd" clipRule="evenodd" d="M6 4h28v26H6V4zm4 4h8v8h-8V8zm12 0h8v8h-8V8zm-12 10h8v8h-8v-8zm12 0h8v8h-8v-8z" />
  </svg>
);

export const IconDoors = ({ size = 24, className = "" }: { size?: number | string, className?: string }) => (
  <svg viewBox="0 0 40 40" width={size} height={size} className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <rect x="28" y="6" width="4" height="28" />
    <path fillRule="evenodd" clipRule="evenodd" d="M10 8l16-2v28l-16-2V8zm12.5 12a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
  </svg>
);

export const IconPatioDoors = ({ size = 24, className = "" }: { size?: number | string, className?: string }) => (
  <svg viewBox="0 0 40 40" width={size} height={size} className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M4 6h32v28H4V6zm2 2h14v24H6V8zm14 0h14v24H20V8zM10 12h6v16h-6V12zm14 0h6v16h-6V12z" />
  </svg>
);

export const IconRollerShutters = ({ size = 24, className = "" }: { size?: number | string, className?: string }) => (
  <svg viewBox="0 0 40 40" width={size} height={size} className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <rect x="6" y="6" width="28" height="4" />
    <rect x="8" y="12" width="24" height="3" />
    <rect x="8" y="17" width="24" height="3" />
    <rect x="8" y="22" width="24" height="3" />
    <path fillRule="evenodd" clipRule="evenodd" d="M6 26h28v8H6v-8zm4 3h8v2h-8v-2zm12 0h8v2h-8v-2z" />
    <rect x="4" y="35" width="32" height="3" />
  </svg>
);

export const IconExteriorBlinds = ({ size = 24, className = "" }: { size?: number | string, className?: string }) => (
  <svg viewBox="0 0 40 40" width={size} height={size} className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <rect x="6" y="6" width="28" height="4" />
    <rect x="8" y="12" width="24" height="2" />
    <rect x="8" y="16" width="24" height="2" />
    <rect x="8" y="20" width="24" height="2" />
    <rect x="8" y="24" width="24" height="2" />
    <path fillRule="evenodd" clipRule="evenodd" d="M6 28h28v6H6v-6zm4 2h8v2h-8v-2zm12 0h8v2h-8v-2z" />
    <rect x="4" y="35" width="32" height="3" />
  </svg>
);

export const IconGarageDoors = ({ size = 24, className = "" }: { size?: number | string, className?: string }) => (
  <svg viewBox="0 0 40 40" width={size} height={size} className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M6 6h28v30h-4V10H10v26H6V6z" />
    <rect x="12" y="12" width="16" height="4" />
    <rect x="12" y="18" width="16" height="4" />
    <rect x="12" y="24" width="16" height="4" />
    <rect x="12" y="30" width="16" height="4" />
  </svg>
);

export const IconInteriorBlinds = ({ size = 24, className = "" }: { size?: number | string, className?: string }) => (
  <svg viewBox="0 0 40 40" width={size} height={size} className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <rect x="6" y="6" width="28" height="4" />
    <rect x="8" y="11" width="24" height="6" />
    <path fillRule="evenodd" clipRule="evenodd" d="M8 18h24v14H8V18zm4 4h10v6h-10v-6z" />
    <path fillRule="evenodd" clipRule="evenodd" d="M26 23h2v6h-2v-6zm1 6a2 2 0 100 4 2 2 0 000-4zm0 1a1 1 0 110 2 1 1 0 010-2z" />
    <rect x="4" y="34" width="32" height="3" />
  </svg>
);

export const IconMosquitoNets = ({ size = 24, className = "" }: { size?: number | string, className?: string }) => (
  <svg viewBox="0 0 40 40" width={size} height={size} className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M6 6h28v28H6V6zm4 4h20v20H10V10z" />
    <path stroke="currentColor" strokeWidth="1" strokeDasharray="1 2" d="M12 10v20M15 10v20M18 10v20M21 10v20M24 10v20M27 10v20" />
    <path stroke="currentColor" strokeWidth="1" strokeDasharray="1 2" d="M10 12h20M10 15h20M10 18h20M10 21h20M10 24h20M10 27h20" />
    <rect x="4" y="35" width="32" height="3" />
  </svg>
);

export const IconSmartHome = ({ size = 24, className = "" }: { size?: number | string, className?: string }) => (
  <svg viewBox="0 0 40 40" width={size} height={size} className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M20 4L4 18h4v16h10v-8h4v8h10V18h4L20 4zm0 13a1 1 0 100 2 1 1 0 000-2zm0-4a5 5 0 00-3.5 1.5l1.4 1.4A3 3 0 0120 15a3 3 0 012.1.9l1.4-1.4A5 5 0 0020 13zm0-4a9 9 0 00-6.4 2.6l1.4 1.4a7 7 0 0110 0l1.4-1.4A9 9 0 0020 9z" />
  </svg>
);

export const IconConservatories = ({ size = 24, className = "" }: { size?: number | string, className?: string }) => (
  <svg viewBox="0 0 40 40" width={size} height={size} className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M4 6h32v28H4V6zm4 4h24v20H8V10zm2 2v6h6v-6h-6zm10 0v6h6v-6h-6zm-10 10v6h6v-6h-6zm10 0v6h6v-6h-6z" />
  </svg>
);

export const IconPergola = ({ size = 24, className = "" }: { size?: number | string, className?: string }) => (
  <svg viewBox="0 0 40 40" width={size} height={size} className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <rect x="4" y="6" width="32" height="4" />
    <rect x="6" y="10" width="4" height="3" />
    <rect x="14" y="10" width="4" height="3" />
    <rect x="22" y="10" width="4" height="3" />
    <rect x="30" y="10" width="4" height="3" />
    <rect x="8" y="13" width="6" height="23" />
    <rect x="26" y="13" width="6" height="23" />
  </svg>
);
