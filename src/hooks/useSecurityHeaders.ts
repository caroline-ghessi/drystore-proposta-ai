
import { useEffect } from 'react';

export const useSecurityHeaders = () => {
  useEffect(() => {
    // Set security headers via meta tags where possible
    const setMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Content Security Policy
    setMetaTag('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: blob: https:; " +
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co; " +
      "frame-ancestors 'none';"
    );

    // X-Frame-Options
    setMetaTag('X-Frame-Options', 'DENY');

    // X-Content-Type-Options
    setMetaTag('X-Content-Type-Options', 'nosniff');

    // Referrer Policy
    setMetaTag('referrer', 'strict-origin-when-cross-origin');
  }, []);
};
