// src/components/ui/OptimizedMedia.tsx

interface OptimizedMediaProps {
  // A standard image URL, also used as a poster for videos
  imageUrl: string;
  // An optional video URL (.mp4, .webm, etc.)
  videoUrl?: string;
  // Alt text for accessibility
  alt: string;
}

/**
 * A component that lazily loads and renders an HTML5 video if a videoUrl is provided,
 * otherwise falls back to a lazily loaded image.
 * Videos are muted, autoplaying, and looped to act like GIFs.
 */
export default function OptimizedMedia({ imageUrl, videoUrl, alt }: OptimizedMediaProps) {
  const isVideo = videoUrl && (videoUrl.endsWith('.mp4') || videoUrl.endsWith('.webm'));

  if (isVideo) {
    return (
      <video
        className="h-full w-full object-cover"
        src={videoUrl}
        poster={imageUrl} // Shows the image while the video loads
        autoPlay
        loop
        muted
        playsInline // Essential for autoplay on iOS
      >
        Your browser does not support the video tag.
      </video>
    );
  }

  return (
    <img
      className="h-full w-full object-cover"
      src={imageUrl}
      alt={alt}
      loading="lazy" // Native browser lazy loading
      decoding="async" // Helps prevent render-blocking
    />
  );
}
