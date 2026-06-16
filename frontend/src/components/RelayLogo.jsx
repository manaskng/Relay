import React from "react";

/**
 * RelayLogo — Custom brand mark for Relay.
 * An abstract "R" formed by intersecting signal paths,
 * representing real-time relay/connection between developers.
 *
 * Props:
 *   size  — width & height in px (default 24)
 *   className — additional tailwind classes
 */
const RelayLogo = ({ size = 24, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Outer ring — represents the relay network */}
    <circle
      cx="16"
      cy="16"
      r="14"
      stroke="currentColor"
      strokeWidth="1.5"
      opacity="0.3"
    />
    {/* Inner paths — stylised "R" with signal flow */}
    <path
      d="M11 24V8h5.5a5 5 0 0 1 0 10H14l7 6"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Signal dot — represents live connection */}
    <circle cx="23" cy="10" r="2" fill="currentColor" opacity="0.6" />
  </svg>
);

export default RelayLogo;
