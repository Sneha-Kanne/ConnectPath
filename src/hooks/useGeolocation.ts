import { useState, useEffect, useCallback, useRef } from 'react';

export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  error: string | null;
  isTracking: boolean;
  permissionStatus: 'granted' | 'prompt' | 'denied' | 'unknown';
}

export interface UseGeolocationReturn extends GeolocationState {
  startTracking: () => void;
  stopTracking: () => void;
  clearError: () => void;
}

export function useGeolocation(options: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 5000,
  timeout: 12000,
}): UseGeolocationReturn {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    heading: null,
    speed: null,
    error: null,
    isTracking: false,
    permissionStatus: 'unknown',
  });

  const watchIdRef = useRef<number | null>(null);

  // Monitor Permissions API if supported in browser
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName })
        .then((status) => {
          setState((prev) => ({
            ...prev,
            permissionStatus: status.state,
          }));

          status.onchange = () => {
            setState((prev) => ({
              ...prev,
              permissionStatus: status.state,
              error: status.state === 'denied' ? 'Location permission was denied.' : null,
            }));
          };
        })
        .catch(() => {
          // Permissions API might not be supported in some browsers or contexts
        });
    }
  }, []);

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    setState((prev) => ({
      ...prev,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      heading: position.coords.heading,
      speed: position.coords.speed,
      error: null,
      isTracking: true,
      permissionStatus: 'granted',
    }));
  }, []);

  const handleError = useCallback((err: GeolocationPositionError) => {
    let errorMessage = 'An unknown GPS error occurred.';

    switch (err.code) {
      case err.PERMISSION_DENIED:
        errorMessage = 'Location access denied by user. Please allow GPS permissions in your browser.';
        break;
      case err.POSITION_UNAVAILABLE:
        errorMessage = 'GPS position unavailable. Check device satellites or network connectivity.';
        break;
      case err.TIMEOUT:
        errorMessage = 'GPS location request timed out. Retrying satellite acquisition...';
        break;
    }

    setState((prev) => ({
      ...prev,
      error: errorMessage,
      isTracking: false,
      permissionStatus: err.code === err.PERMISSION_DENIED ? 'denied' : prev.permissionStatus,
    }));
  }, []);

  const startTracking = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocation is not supported by your browser or environment.',
        isTracking: false,
      }));
      return;
    }

    // Clear existing watch if any
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setState((prev) => ({ ...prev, isTracking: true, error: null }));

    try {
      const id = navigator.geolocation.watchPosition(handleSuccess, handleError, options);
      watchIdRef.current = id;
    } catch (e: any) {
      setState((prev) => ({
        ...prev,
        isTracking: false,
        error: e?.message || 'Failed to start GPS tracking watcher.',
      }));
    }
  }, [handleSuccess, handleError, options]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setState((prev) => ({
      ...prev,
      isTracking: false,
    }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  return {
    ...state,
    startTracking,
    stopTracking,
    clearError,
  };
}
