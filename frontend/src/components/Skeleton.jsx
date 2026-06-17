import React from 'react';

export function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-700/50 rounded-xl ${className}`}
    />
  );
}
