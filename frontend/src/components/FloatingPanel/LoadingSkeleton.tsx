/**
 * LoadingSkeleton Component
 * Animated skeleton placeholders for loading states
 */

import React from 'react';

export default function LoadingSkeleton(): JSX.Element {
  return (
    <div className="flex-1 overflow-y-auto" role="status" aria-label="Loading notifications">
      <ul className="divide-y divide-gray-100">
        {[...Array(5)].map((_, index) => (
          <li key={index} className="flex gap-3 px-4 py-3">
            {/* Avatar skeleton */}
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
            
            {/* Content skeleton */}
            <div className="flex-1 min-w-0">
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse mb-2" />
              <div className="h-3 bg-gray-200 rounded w-full animate-pulse mb-1" />
              <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse mb-2" />
              <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
            </div>
            
            {/* Unread indicator skeleton */}
            <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse mt-2" />
          </li>
        ))}
      </ul>
    </div>
  );
}
