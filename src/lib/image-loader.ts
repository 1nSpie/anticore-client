// Custom image loader for Next.js using backend API

interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

export default function customImageLoader({ src, width, quality }: ImageLoaderProps): string {
  // If the src is already a full URL, use it as is
  if (src.startsWith('http://') || src.startsWith('https://')) {
    const url = new URL(src);
    
    // Add optimization parameters
    if (width && width > 0) {
      url.searchParams.set('w', width.toString());
    }
    if (quality) {
      url.searchParams.set('q', quality.toString());
    }
    
    return url.toString();
  }
  
  // For relative URLs, construct the full URL
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:4444';
  const url = new URL(src, baseUrl);
  
  // Add optimization parameters
  if (width && width > 0) {
    url.searchParams.set('w', width.toString());
  }
  if (quality) {
    url.searchParams.set('q', quality.toString());
  }
  
  return url.toString();
}
