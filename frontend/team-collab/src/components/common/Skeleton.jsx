// components/common/Skeleton.jsx
import React from 'react';

const Skeleton = ({ className, variant = 'text' }) => {
  const baseClass = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded';
  
  const variants = {
    text: 'h-4 w-full',
    circle: 'rounded-full',
    rect: 'rounded-lg',
    card: 'h-48 w-full rounded-xl'
  };

  return (
    <div className={`${baseClass} ${variants[variant]} ${className || ''}`} />
  );
};

export const ProjectCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
    <Skeleton className="w-12 h-12 mb-4" variant="circle" />
    <Skeleton className="h-6 w-3/4 mb-2" />
    <Skeleton className="h-4 w-1/2 mb-4" />
    <div className="flex gap-4">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-16" />
    </div>
  </div>
);

export const TaskCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
    <Skeleton className="h-5 w-3/4 mb-2" />
    <Skeleton className="h-4 w-full mb-3" />
    <Skeleton className="h-4 w-2/3" />
  </div>
);

export default Skeleton;