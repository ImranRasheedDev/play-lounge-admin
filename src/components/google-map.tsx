"use client";

import React, { useEffect, useRef } from "react";

interface GoogleMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  className?: string;
}

export function GoogleMap({ latitude, longitude, zoom = 15, className = "" }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    // Initialize map if not already initialized
    mapInstanceRef.current ??= new google.maps.Map(mapRef.current, {
      center: { lat: latitude, lng: longitude },
      zoom: zoom,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
    });

    // Create or update marker
    if (markerRef.current) {
      markerRef.current.setPosition({ lat: latitude, lng: longitude });
    } else {
      markerRef.current = new google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: mapInstanceRef.current,
        title: "Selected Location",
        animation: google.maps.Animation.DROP,
      });
    }

    // Center map on new coordinates
    mapInstanceRef.current.setCenter({ lat: latitude, lng: longitude });
  }, [latitude, longitude, zoom]);

  return (
    <div ref={mapRef} className={`h-[400px] w-full rounded-lg border ${className}`} style={{ minHeight: "400px" }} />
  );
}
