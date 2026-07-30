import React from 'react';

export default function LoadingSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-4 animate-pulse">
          <div className="h-44 w-full bg-slate-300 dark:bg-slate-800 rounded-xl shimmer" />
          <div className="space-y-2">
            <div className="h-5 w-3/4 bg-slate-300 dark:bg-slate-800 rounded shimmer" />
            <div className="h-3 w-full bg-slate-200 dark:bg-slate-800/60 rounded shimmer" />
            <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-800/60 rounded shimmer" />
          </div>
          <div className="pt-2 flex justify-between">
            <div className="h-4 w-1/3 bg-slate-300 dark:bg-slate-800 rounded shimmer" />
            <div className="h-4 w-1/4 bg-slate-300 dark:bg-slate-800 rounded shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}
