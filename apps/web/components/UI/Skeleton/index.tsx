import React from "react";

interface SkeletonProps {
  style:
    "rounded-full" | "rounded" | "rounded-xs" | "rounded-lg" | "rounded-xl";
  className: string;
  classNameDiv?: string;
}

const Skeleton = ({
  style,
  className = "",
  classNameDiv = "",
}: SkeletonProps) => {
  return (
    <div role="status" className={`animate-pulse ${classNameDiv}`}>
      <div className={`bg-gray-200 ${style} ${className} dark:bg-gray-700`} />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Skeleton;
