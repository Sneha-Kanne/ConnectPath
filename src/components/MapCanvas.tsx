import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { LocationData, RouteOption } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../hooks/useLanguage';
import { getLocalizedLocationName } from '../lib/themedLocationNames';

interface MapCanvasProps {
  startLocation: LocationData | null;
  endLocation: LocationData | null;
  selectedRoute: RouteOption | null;
  userLocation?: { lat: number; lng: number } | null;
  isTracking?: boolean;
  onMapClick?: (lat: number, lng: number) => void;
  onSelectCoordinates?: (lat: number, lng: number, type: 'start' | 'end') => void;
  selectionMode: 'start' | 'end' | null;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  startLocation,
  endLocation,
  selectedRoute,
  userLocation,
  isTracking = false,
  onMapClick,
  onSelectCoordinates,
  selectionMode,
}) => {
  const { theme } = useTheme();
  const { language, t } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const startMarkerRef = useRef<L.Marker | null>(null);
  const endMarkerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const routeBackgroundPolylineRef = useRef<L.Polyline | null>(null);
  const deadZoneMarkersRef = useRef<L.Marker[]>([]);
  const poiMarkersRef = useRef<L.Marker[]>([]);
  const userLocationGroupRef = useRef<L.LayerGroup | null>(null);
  const userPulseMarkerRef = useRef<L.Marker | null>(null);
  const userCircleMarkerRef = useRef<L.CircleMarker | null>(null);
  const userLocationAnimationRef = useRef<number | null>(null);
  const displayedUserLocationRef = useRef<{ lat: number; lng: number } | null>(null);
  const hasMapInteractionRef = useRef(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Telangana Default Coordinates (Hyderabad)
    const defaultCenter: [number, number] = [17.3850, 78.4867];

    // Create Map
    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 8,
      zoomControl: false,
      attributionControl: false, // Keep it super clean
      zoomAnimation: true,
      markerZoomAnimation: true,
      fadeAnimation: true,
      zoomSnap: 1,
      zoomDelta: 1,
      wheelDebounceTime: 40,
      wheelPxPerZoomLevel: 80,
      inertia: true,
      zoomAnimationThreshold: 8,
    });

    // OpenStreetMap Tile Layer (Free, no API key required)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      updateWhenZooming: true,
      updateWhenIdle: false,
      keepBuffer: 2,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapRef.current = map;

    const resizeObserver = new ResizeObserver(() => map.invalidateSize({ pan: false }));
    resizeObserver.observe(mapContainerRef.current);

    const markMapInteraction = () => {
      hasMapInteractionRef.current = true;
    };
    map.on('zoomstart dragstart', markMapInteraction);

    // Handle clicks for selection mode
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.off('zoomstart dragstart', markMapInteraction);
        resizeObserver.disconnect();
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    requestAnimationFrame(() => map.invalidateSize({ pan: false }));
  }, [theme]);

  // Handle click events in selection modes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (selectionMode && onSelectCoordinates) {
        onSelectCoordinates(e.latlng.lat, e.latlng.lng, selectionMode);
      }
    };

    map.off('click');
    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [selectionMode, onSelectCoordinates]);

  // Update Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Custom Glowing Cyan DivIcon for Start Pin
    const startIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div class="relative flex items-center justify-center w-8 h-8">
          <div class="absolute w-6 h-6 rounded-full bg-cyan-glow/20 animate-ping"></div>
          <div class="absolute w-4 h-4 rounded-full bg-cyan-glow border border-white pulse-cyan"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    // Custom Glowing Coral DivIcon for End Pin
    const endIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div class="relative flex items-center justify-center w-8 h-8">
          <div class="absolute w-6 h-6 rounded-full bg-coral-glow/20 animate-ping"></div>
          <div class="absolute w-4 h-4 rounded-full bg-coral-glow border border-white pulse-coral"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    // Render Start Marker
    if (startLocation) {
      if (startMarkerRef.current) {
        startMarkerRef.current.setLatLng([startLocation.lat, startLocation.lng]);
        startMarkerRef.current.setPopupContent(`<div class="text-obsidian font-semibold text-xs font-sans">${t('start_terminal', 'Start')}: ${getLocalizedLocationName(startLocation.name, language)}</div>`);
      } else {
        startMarkerRef.current = L.marker([startLocation.lat, startLocation.lng], { icon: startIcon })
          .addTo(map)
          .bindPopup(`<div class="text-obsidian font-semibold text-xs font-sans">${t('start_terminal', 'Start')}: ${getLocalizedLocationName(startLocation.name, language)}</div>`);
      }
    } else {
      if (startMarkerRef.current) {
        startMarkerRef.current.remove();
        startMarkerRef.current = null;
      }
    }

    // Render End Marker
    if (endLocation) {
      if (endMarkerRef.current) {
        endMarkerRef.current.setLatLng([endLocation.lat, endLocation.lng]);
        endMarkerRef.current.setPopupContent(`<div class="text-obsidian font-semibold text-xs font-sans">${t('end_terminal', 'Destination')}: ${getLocalizedLocationName(endLocation.name, language)}</div>`);
      } else {
        endMarkerRef.current = L.marker([endLocation.lat, endLocation.lng], { icon: endIcon })
          .addTo(map)
          .bindPopup(`<div class="text-obsidian font-semibold text-xs font-sans">${t('end_terminal', 'Destination')}: ${getLocalizedLocationName(endLocation.name, language)}</div>`);
      }
    } else {
      if (endMarkerRef.current) {
        endMarkerRef.current.remove();
        endMarkerRef.current = null;
      }
    }

    // Adjust Bounds if both exist and no route is active
    if (startLocation && endLocation && !selectedRoute && !hasMapInteractionRef.current) {
      const bounds = L.latLngBounds([
        [startLocation.lat, startLocation.lng],
        [endLocation.lat, endLocation.lng]
      ]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else if (startLocation && !endLocation && !hasMapInteractionRef.current) {
      map.setView([startLocation.lat, startLocation.lng], 14);
    } else if (endLocation && !startLocation && !hasMapInteractionRef.current) {
      map.setView([endLocation.lat, endLocation.lng], 14);
    }
  }, [startLocation, endLocation, selectedRoute, language, t]);

  // Real-Time GPS User Location Marker & Tracking
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!userLocation) {
      if (userLocationAnimationRef.current !== null) {
        cancelAnimationFrame(userLocationAnimationRef.current);
        userLocationAnimationRef.current = null;
      }
      userLocationGroupRef.current?.clearLayers();
      userLocationGroupRef.current?.remove();
      userLocationGroupRef.current = null;
      userPulseMarkerRef.current = null;
      userCircleMarkerRef.current = null;
      displayedUserLocationRef.current = null;
      return;
    }

    const group = userLocationGroupRef.current ?? L.layerGroup().addTo(map);
    userLocationGroupRef.current = group;

    if (!userPulseMarkerRef.current || !userCircleMarkerRef.current) {
      const pulsingIcon = L.divIcon({
        className: 'user-gps-pulse-wrapper',
        html: `
          <div class="relative flex items-center justify-center w-10 h-10 -ml-5 -mt-5 pointer-events-none">
            <div class="absolute w-10 h-10 rounded-full bg-blue-500/30 gps-pulse-ring"></div>
            <div class="absolute w-6 h-6 rounded-full bg-blue-400/40 animate-ping"></div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });
      userPulseMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: pulsingIcon, interactive: false });
      group.addLayer(userPulseMarkerRef.current);

      userCircleMarkerRef.current = L.circleMarker([userLocation.lat, userLocation.lng], {
        radius: 8,
        fillColor: '#3B82F6',
        fillOpacity: 1,
        color: '#FFFFFF',
        weight: 2.5,
        className: 'leaflet-gps-marker',
      }).bindPopup(`
        <div class="text-obsidian font-bold text-xs font-sans">
          Your live location<br/>
          <span class="text-[10px] font-mono text-blue-600">${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)}</span>
        </div>
      `);
      group.addLayer(userCircleMarkerRef.current);
    }

    const start = displayedUserLocationRef.current ?? userLocation;
    const target = userLocation;
    const animationStart = performance.now();
    const animationDuration = displayedUserLocationRef.current ? 650 : 0;

    if (userLocationAnimationRef.current !== null) {
      cancelAnimationFrame(userLocationAnimationRef.current);
    }

    const animateLocation = (now: number) => {
      const progress = animationDuration === 0
        ? 1
        : Math.min(1, (now - animationStart) / animationDuration);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const lat = start.lat + (target.lat - start.lat) * easedProgress;
      const lng = start.lng + (target.lng - start.lng) * easedProgress;
      const position: [number, number] = [lat, lng];

      userPulseMarkerRef.current?.setLatLng(position);
      userCircleMarkerRef.current?.setLatLng(position);
      displayedUserLocationRef.current = { lat, lng };

      if (progress < 1) {
        userLocationAnimationRef.current = requestAnimationFrame(animateLocation);
      } else {
        userLocationAnimationRef.current = null;
      }
    };

    userLocationAnimationRef.current = requestAnimationFrame(animateLocation);

    if (isTracking) {
      map.panTo([userLocation.lat, userLocation.lng], { animate: true, duration: 0.65 });
    }
  }, [userLocation, isTracking]);

  useEffect(() => {
    return () => {
      if (userLocationAnimationRef.current !== null) {
        cancelAnimationFrame(userLocationAnimationRef.current);
      }
      userLocationGroupRef.current?.clearLayers();
      userLocationGroupRef.current?.remove();
    };
  }, []);

  // Update Route Polyline and Dead Zone Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clean up old polylines
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }
    if (routeBackgroundPolylineRef.current) {
      routeBackgroundPolylineRef.current.remove();
      routeBackgroundPolylineRef.current = null;
    }

    // Clean up old dead zone markers
    deadZoneMarkersRef.current.forEach(m => m.remove());
    deadZoneMarkersRef.current = [];

    // Clean up old POI markers
    poiMarkersRef.current.forEach(m => m.remove());
    poiMarkersRef.current = [];

    if (selectedRoute && selectedRoute.coordinates.length > 0) {
      const isEmergency = selectedRoute.id === 'emergency';

      // Background glow line
      routeBackgroundPolylineRef.current = L.polyline(
        selectedRoute.coordinates,
        {
          color: isEmergency ? '#FF3366' : '#00F0FF',
          weight: 8,
          opacity: 0.25,
          lineCap: 'round',
          lineJoin: 'round',
        }
      ).addTo(map);

      // Active sharp line
      polylineRef.current = L.polyline(
        selectedRoute.coordinates,
        {
          color: isEmergency ? '#FF3366' : '#00F0FF',
          weight: 4,
          opacity: 0.9,
          dashArray: selectedRoute.id === 'connectivity' ? '8, 8' : undefined,
          lineCap: 'round',
          lineJoin: 'round',
        }
      ).addTo(map);

      // Add pulsing red dead zones if fastest route (or if it contains low connectivity)
      if (selectedRoute.id === 'fastest' && selectedRoute.coordinates.length > 5) {
        const deadZoneIndices = [
          Math.floor(selectedRoute.coordinates.length * 0.33),
          Math.floor(selectedRoute.coordinates.length * 0.66)
        ];

        const deadZoneIcon = L.divIcon({
          className: 'custom-dead-icon',
          html: `
            <div class="relative flex items-center justify-center w-8 h-8">
              <div class="absolute w-6 h-6 rounded-full bg-coral-glow/30 animate-ping"></div>
              <div class="absolute w-3.5 h-3.5 rounded-full bg-coral-glow border border-white shadow-[0_0_8px_#FF3366]"></div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        deadZoneIndices.forEach((idx, i) => {
          const coord = selectedRoute.coordinates[idx];
          const marker = L.marker(coord, { icon: deadZoneIcon })
            .addTo(map)
            .bindPopup(`<div class="text-obsidian font-bold text-xs font-sans">Dead Zone #${i+1}<br/><span class="text-[10px] font-normal text-gray-500">Signal drops to 0 bars here</span></div>`);
          
          deadZoneMarkersRef.current.push(marker);
        });
      }

      // Render POIs (Rest Stops, Fuel, Dining, Hotels) along the route
      if (selectedRoute.pointsOfInterest && selectedRoute.pointsOfInterest.length > 0) {
        selectedRoute.pointsOfInterest.forEach((poi) => {
          const poiIcon = L.divIcon({
            className: 'custom-poi-marker',
            html: `
              <div class="relative group flex items-center justify-center w-7 h-7 rounded-full bg-black/80 border border-cyan-glow/50 shadow-[0_0_10px_rgba(0,240,255,0.4)] hover:scale-125 transition-transform cursor-pointer">
                <span class="text-xs leading-none select-none">${poi.icon}</span>
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

          const marker = L.marker([poi.lat, poi.lng], { icon: poiIcon })
            .addTo(map)
            .bindPopup(`
              <div class="text-obsidian p-1 font-sans">
                <div class="flex items-center gap-1 font-bold text-xs text-black">
                  <span>${poi.icon}</span>
                  <span>${poi.name}</span>
                </div>
                <div class="text-[10px] text-gray-600 mt-0.5">
                  <span>${poi.type.replace('_', ' ').toUpperCase()} • ${poi.distanceKm} km away</span>
                </div>
                ${poi.rating ? `<div class="text-[9px] text-amber-600 font-bold mt-0.5">Rating: ${poi.rating.toFixed(1)}</div>` : ''}
              </div>
            `);

          poiMarkersRef.current.push(marker);
        });
      }

      // Fit bounds to polyline if valid coordinates exist
      try {
        const validCoords = selectedRoute.coordinates.filter(
          c => Array.isArray(c) && c.length >= 2 && !isNaN(c[0]) && !isNaN(c[1])
        );
        if (validCoords.length > 0) {
          const bounds = L.latLngBounds(validCoords as [number, number][]);
          if (bounds.isValid()) {
            map.invalidateSize();
            map.fitBounds(bounds, { padding: [80, 80], maxZoom: 16, animate: true, duration: 0.6 });
          }
        }
      } catch (err) {
        console.warn('Error adjusting bounds for route:', err);
      }
    }
  }, [selectedRoute]);

  return (
    <div className="relative w-full h-full">
      <div 
        id="map" 
        ref={mapContainerRef} 
        className="w-full h-full outline-none z-0"
      />
      {/* Subtle border shadow around map edges */}
      <div className="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_20px_rgba(0,0,0,0.15)]" />
      
      {/* Map region badge */}
      <div 
        className="absolute top-24 md:top-4 right-4 z-20 px-3.5 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-md transition-colors"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-md)',
          color: 'var(--text-primary)',
        }}
      >
        <span className="w-2 h-2 rounded-full shrink-0 animate-pulse" style={{ background: 'var(--green)' }} />
        <span className="text-[10px] font-sans font-extrabold tracking-wider uppercase flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
          Telangana, IN
        </span>
      </div>
      
      {selectionMode && (
        <div 
          className="absolute top-24 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-full text-xs font-sans tracking-wider flex items-center gap-2 shadow-lg animate-pulse backdrop-blur-md"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--accent-border)',
            color: 'var(--accent)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <span className="w-2 h-2 rounded-full animate-ping" style={{ background: 'var(--accent)' }} />
          Click on the map to set {selectionMode === 'start' ? 'Starting Location' : 'Destination'}
        </div>
      )}
    </div>
  );
};
