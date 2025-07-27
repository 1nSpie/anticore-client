"use client";

import React, { useState } from "react";
import Image from "next/image";
import { apiClient } from "src/lib/api";

interface ServerImageProps {
  filePath: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export const ServerImage: React.FC<ServerImageProps> = ({
  filePath,
  alt,
  width = 1000,
  height = 1000,
  className = "",
  priority = false,
  fill = false,
  sizes,
  quality = 85,
  onLoad,
  onError,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const folderFile = filePath.split("/");

  const imageUrl = apiClient.getImageUrl(folderFile[0], folderFile[1]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setImageError(true);
    setIsLoading(false);
    onError?.(new Error(`Failed to load image: ${imageUrl}`));
  };

  if (imageError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 ${className}`}
        style={{ width: fill ? "100%" : width, height: fill ? "100%" : height }}
      >
        <div className="text-center p-4">
          <svg 
            className="w-12 h-12 mx-auto mb-2 text-gray-400 dark:text-gray-500" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
          </svg>
          <span className="text-sm">Изображение не загружено</span>
        </div>
      </div>
    );
  }

  const imageProps = {
    src: imageUrl,
    alt,
    className: `${className} ${
      isLoading ? "opacity-0" : "opacity-100"
    } transition-opacity duration-500`,
    onLoad: handleLoad,
    onError: handleError,
    priority,
    sizes,
    quality,
    placeholder: "blur" as const,
    blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSBWjlGhvFCDaEMVl+OPt3QxSmubtqPPHvt5PcaJuauZ/0B/KIaHJCFiUH/9k=",
  };

  if (fill) {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <Image {...imageProps} fill unoptimized/>;
  }

  // eslint-disable-next-line jsx-a11y/alt-text
  return <Image {...imageProps} width={width} height={height} unoptimized/>;
};

export default ServerImage;
