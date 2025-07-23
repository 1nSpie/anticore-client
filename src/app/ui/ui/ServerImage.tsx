"use client";

import React, { useState } from "react";
import Image from "next/image";
import { apiClient } from "@/lib/api";


interface ServerImageProps {
  filePath: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
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
        className={`flex items-center justify-center bg-gray-200 text-gray-500 ${className}`}
        style={{ width: fill ? "100%" : width, height: fill ? "100%" : height }}
      >
        <span className="text-sm">Failed to load image</span>
      </div>
    );
  }

  const imageProps = {
    src: imageUrl,
    alt,
    className: `${className} ${
      isLoading ? "opacity-0" : "opacity-100"
    } transition-opacity duration-300`,
    onLoad: handleLoad,
    onError: handleError,
    priority,
    sizes,
  };

  if (fill) {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <Image {...imageProps} fill unoptimized/>;
  }

  // eslint-disable-next-line jsx-a11y/alt-text
  return <Image {...imageProps} width={width} height={height} unoptimized/>;
};

export default ServerImage;
