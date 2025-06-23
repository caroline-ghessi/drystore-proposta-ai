
import { useState, useEffect } from 'react';

interface DeviceFingerprint {
  userAgent: string;
  language: string;
  platform: string;
  screenResolution: string;
  timezone: string;
  colorDepth: number;
  cookieEnabled: boolean;
  fingerprint: string;
}

export const useDeviceFingerprint = () => {
  const [fingerprint, setFingerprint] = useState<DeviceFingerprint | null>(null);

  useEffect(() => {
    const generateFingerprint = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx?.fillText('Device fingerprinting', 2, 2);
      const canvasFingerprint = canvas.toDataURL();

      const components = [
        navigator.userAgent,
        navigator.language,
        navigator.platform,
        `${screen.width}x${screen.height}`,
        Intl.DateTimeFormat().resolvedOptions().timeZone,
        screen.colorDepth.toString(),
        navigator.cookieEnabled.toString(),
        canvasFingerprint
      ];

      const fingerprintData: DeviceFingerprint = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        colorDepth: screen.colorDepth,
        cookieEnabled: navigator.cookieEnabled,
        fingerprint: btoa(components.join('|')).substring(0, 32)
      };

      setFingerprint(fingerprintData);
    };

    generateFingerprint();
  }, []);

  const isKnownDevice = (storedFingerprint: string): boolean => {
    return fingerprint?.fingerprint === storedFingerprint;
  };

  const saveDeviceFingerprint = () => {
    if (fingerprint) {
      localStorage.setItem('device_fingerprint', fingerprint.fingerprint);
    }
  };

  const getStoredFingerprint = (): string | null => {
    return localStorage.getItem('device_fingerprint');
  };

  return {
    fingerprint,
    isKnownDevice,
    saveDeviceFingerprint,
    getStoredFingerprint
  };
};
