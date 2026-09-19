import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { GoogleMapsPlatformComponent, hasValidGoogleMapsKey } from "./GoogleMapsPlatformComponent";
import { Compass, Sparkles } from "lucide-react";

// Fix standard Leaflet icon assets for Vite bundler
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const providerIcon = L.divIcon({
  className: "custom-provider-pin",
  html: `<div style="background-color: #059669; color: white; border: 2px solid white; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); font-weight: bold;">⚡</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const clientIcon = L.divIcon({
  className: "custom-client-pin",
  html: `<div style="background-color: #2563eb; color: white; border: 2px solid white; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); font-weight: bold;">🏠</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

export function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

interface ConnectLocationMapProps {
  mode: "geocoder" | "tracking";
  initialAddress?: string;
  lat?: number;
  lng?: number;
  onLocationChange?: (location: { lat: number; lng: number; address: string; zone: string }) => void;
  isValidated?: boolean;
  providerName?: string;
  providerTitle?: string;
  providerLat?: number;
  providerLng?: number;
  providerZone?: string;
  clientName?: string;
  clientAddress?: string;
  clientLat?: number;
  clientLng?: number;
  serviceTitle?: string;
  etaMinutes?: number;
}

export const ConnectLocationMap: React.FC<ConnectLocationMapProps> = ({
  mode,
  initialAddress = "",
  lat = -25.9692,
  lng = 32.5732,
  onLocationChange,
  isValidated = false,
  providerName = "Prestador Certificado TARIRA",
  providerTitle = "Técnico Especialista",
  providerLat = -25.9692,
  providerLng = 32.5732,
  providerZone = "Maputo Cidade",
  clientName = "Cliente TARIRA Connect",
  clientAddress = "Av. Julius Nyerere, Maputo",
  clientLat = -25.9520,
  clientLng = 32.5850,
  serviceTitle = "Serviço de Manutenção & Suporte",
  etaMinutes = 25,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);

  const [addressInput, setAddressInput] = useState(initialAddress || providerZone);
  const [currentLat, setCurrentLat] = useState(lat || providerLat || -25.9692);
  const [currentLng, setCurrentLng] = useState(lng || providerLng || 32.5732);
  const [hasMapInitError, setHasMapInitError] = useState(false);

  // Sync state if props change
  useEffect(() => {
    if (lat && lat !== currentLat) setCurrentLat(lat);
    if (lng && lng !== currentLng) setCurrentLng(lng);
  }, [lat, lng]);

  useEffect(() => {
    if (initialAddress && initialAddress !== addressInput) {
      setAddressInput(initialAddress);
    }
  }, [initialAddress]);

  // Leaflet initialization and cleanup with error safety
  useEffect(() => {
    if (hasValidGoogleMapsKey) return;
    if (!mapContainerRef.current) return;

    try {
      const container = mapContainerRef.current;
      
      // Clean up previous leaflet instance if container is reused
      if ((container as any)._leaflet_id && !mapInstanceRef.current) {
        delete (container as any)._leaflet_id;
      }

      if (!mapInstanceRef.current) {
        const map = L.map(container, {
          center: [currentLat, currentLng],
          zoom: 13,
          scrollWheelZoom: false,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        const group = L.layerGroup().addTo(map);
        markerGroupRef.current = group;
        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;
      const group = markerGroupRef.current;
      if (group) {
        group.clearLayers();
      }

      if (mode === "geocoder") {
        const marker = L.marker([currentLat, currentLng], { icon: providerIcon, draggable: true });
        if (group) {
          group.addLayer(marker);
        } else {
          marker.addTo(map);
        }

        marker.on("dragend", () => {
          try {
            const pos = marker.getLatLng();
            setCurrentLat(pos.lat);
            setCurrentLng(pos.lng);
            if (onLocationChange) {
              onLocationChange({ lat: pos.lat, lng: pos.lng, address: addressInput, zone: "Maputo" });
            }
          } catch (e) {
            console.warn("Marker dragend notice:", e);
          }
        });
      } else {
        const pMarker = L.marker([providerLat, providerLng], { icon: providerIcon }).bindPopup(providerName);
        const cMarker = L.marker([clientLat, clientLng], { icon: clientIcon }).bindPopup(clientName);
        const poly = L.polyline(
          [[providerLat, providerLng], [clientLat, clientLng]],
          { color: "#d97706", weight: 3, dashArray: "5, 10" }
        );

        if (group) {
          group.addLayer(pMarker);
          group.addLayer(cMarker);
          group.addLayer(poly);
        } else {
          pMarker.addTo(map);
          cMarker.addTo(map);
          poly.addTo(map);
        }
      }
    } catch (err) {
      console.warn("Leaflet map initialization notice (handled gracefully):", err);
      setHasMapInitError(true);
    }

    return () => {
      try {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
          markerGroupRef.current = null;
        }
      } catch (err) {
        console.warn("Leaflet cleanup notice:", err);
      }
    };
  }, [mode, providerLat, providerLng, clientLat, clientLng, hasValidGoogleMapsKey]);

  // If Google Maps API key is configured, use Google Maps Platform natively!
  if (hasValidGoogleMapsKey) {
    return (
      <GoogleMapsPlatformComponent
        mode={mode}
        initialLat={currentLat}
        initialLng={currentLng}
        initialAddress={addressInput}
        providerName={providerName}
        providerLat={providerLat}
        providerLng={providerLng}
        clientName={clientName}
        clientLat={clientLat}
        clientLng={clientLng}
        onLocationSelect={(loc) => {
          setCurrentLat(loc.lat);
          setCurrentLng(loc.lng);
          setAddressInput(loc.address);
          if (onLocationChange) {
            onLocationChange(loc);
          }
        }}
      />
    );
  }

  return (
    <div className="w-full space-y-3">
      {mode === "geocoder" && (
        <div className="flex gap-2">
          <input
            type="text"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            placeholder="Digite o bairro ou endereço em Moçambique..."
            className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
          />
        </div>
      )}
      {hasMapInitError ? (
        <div className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#172554]" />
            <span>Localização definida: <strong>{addressInput || "Maputo, Moçambique"}</strong> ({currentLat.toFixed(4)}, {currentLng.toFixed(4)})</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Geolocalização Ativa</span>
        </div>
      ) : (
        <div ref={mapContainerRef} className="w-full h-64 rounded-2xl overflow-hidden border border-slate-300 shadow-xs" />
      )}
      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
        <span>Arraste o pino para ajustar a localização exata</span>
        <span className="text-[10px] text-slate-500 font-mono">Google Maps Platform Ready</span>
      </div>
    </div>
  );
};
