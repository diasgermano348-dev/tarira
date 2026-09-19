import React, { useState, useEffect, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { MapPin, Navigation, Search, CheckCircle2, AlertCircle, Layers, Compass, Loader2 } from 'lucide-react';

// Constitution Rule 1: Get Key from Vite process.env / import.meta / global
export const GOOGLE_MAPS_API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

export const hasValidGoogleMapsKey = Boolean(GOOGLE_MAPS_API_KEY) && GOOGLE_MAPS_API_KEY !== 'YOUR_API_KEY';

interface LocationCoords {
  lat: number;
  lng: number;
  address?: string;
  zone?: string;
}

interface GoogleMapsLocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  onLocationSelect?: (loc: { lat: number; lng: number; address: string; zone: string }) => void;
  height?: string;
  zoom?: number;
  readOnly?: boolean;
}

/**
 * Places API (New) Text Search & Autocomplete
 */
function PlacesSearchBar({
  onSelectPlace,
}: {
  onSelectPlace: (place: { lat: number; lng: number; address: string; name: string }) => void;
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<google.maps.places.Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const placesLib = useMapsLibrary('places');
  const map = useMap();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (!placesLib || text.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    try {
      // CF11: uses textQuery (NOT query or text). CF9: fields array required
      const { places } = await placesLib.Place.searchByText({
        textQuery: text,
        fields: ['displayName', 'location', 'formattedAddress', 'id'],
        locationBias: map?.getCenter() || { lat: -25.9692, lng: 32.5732 }, // Maputo Default
        maxResultCount: 6,
      });

      if (places && places.length > 0) {
        setSuggestions(places);
        setShowDropdown(true);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.warn('Google Places search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (p: google.maps.places.Place) => {
    if (!p.location) return;
    const lat = typeof p.location.lat === 'function' ? (p.location as any).lat() : (p.location as any).lat;
    const lng = typeof p.location.lng === 'function' ? (p.location as any).lng() : (p.location as any).lng;
    const displayName = p.displayName || p.formattedAddress || 'Local Selecionado';
    const address = p.formattedAddress || displayName;

    setQuery(displayName);
    setShowDropdown(false);

    if (map) {
      map.panTo({ lat, lng });
      map.setZoom(15);
    }

    onSelectPlace({ lat, lng, address, name: displayName });
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder="Pesquisar endereço, bairro ou ponto de referência (Google Places)..."
          className="w-full pl-10 pr-10 py-2.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-400 shadow-lg"
        />
        {loading && (
          <Loader2 className="w-4 h-4 text-blue-400 animate-spin absolute right-3.5 top-3" />
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
          {suggestions.map((place) => (
            <button
              key={place.id || Math.random().toString()}
              type="button"
              onClick={() => handleSelect(place)}
              className="w-full px-3.5 py-2.5 text-left text-xs hover:bg-slate-800/80 transition-colors border-b border-slate-800 last:border-0 flex items-start gap-2.5 cursor-pointer text-slate-200"
            >
              <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white text-xs">{place.displayName}</div>
                {place.formattedAddress && (
                  <div className="text-[11px] text-slate-400 truncate">{place.formattedAddress}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Route polyline renderer using modern Routes API (Route.computeRoutes)
 */
function RoutePolyline({
  origin,
  destination,
}: {
  origin: google.maps.LatLngLiteral;
  destination: google.maps.LatLngLiteral;
}) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!routesLib || !map || !origin || !destination) return;

    // Clear previous polylines
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    // CF7 & CF13: Route.computeRoutes requires fields & travelMode
    routesLib.Route.computeRoutes({
      origin,
      destination,
      travelMode: 'DRIVING',
      fields: ['path', 'distanceMeters', 'durationMillis', 'viewport'],
    })
      .then(({ routes }) => {
        if (routes && routes[0]) {
          const newPolylines = routes[0].createPolylines();
          newPolylines.forEach((p) => {
            p.setOptions({
              strokeColor: '#f59e0b',
              strokeOpacity: 0.9,
              strokeWeight: 4,
            });
            p.setMap(map);
          });
          polylinesRef.current = newPolylines;

          if (routes[0].viewport) {
            map.fitBounds(routes[0].viewport);
          }
        }
      })
      .catch((err) => {
        console.warn('Routes API computeRoutes error:', err);
      });

    return () => {
      polylinesRef.current.forEach((p) => p.setMap(null));
    };
  }, [routesLib, map, origin.lat, origin.lng, destination.lat, destination.lng]);

  return null;
}

/**
 * Interactive Google Maps Location Selector & Tracking Component
 */
export const GoogleMapsPlatformComponent: React.FC<GoogleMapsLocationPickerProps & {
  mode?: 'geocoder' | 'tracking';
  providerName?: string;
  providerLat?: number;
  providerLng?: number;
  clientName?: string;
  clientLat?: number;
  clientLng?: number;
}> = ({
  initialLat = -25.9692,
  initialLng = 32.5732,
  initialAddress = 'Maputo, Moçambique',
  onLocationSelect,
  height = '320px',
  zoom = 13,
  readOnly = false,
  mode = 'geocoder',
  providerName = 'Prestador TARIRA',
  providerLat = -25.9692,
  providerLng = 32.5732,
  clientName = 'Cliente TARIRA',
  clientLat = -25.9520,
  clientLng = 32.5850,
}) => {
  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number }>({
    lat: initialLat,
    lng: initialLng,
  });
  const [selectedAddress, setSelectedAddress] = useState(initialAddress);

  const handleMapClick = (e: any) => {
    if (readOnly || mode === 'tracking') return;
    if (e.detail?.latLng) {
      const lat = e.detail.latLng.lat;
      const lng = e.detail.latLng.lng;
      setMarkerPos({ lat, lng });
      if (onLocationSelect) {
        onLocationSelect({
          lat,
          lng,
          address: selectedAddress || `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
          zone: 'Moçambique',
        });
      }
    }
  };

  const handlePlaceSelect = (place: { lat: number; lng: number; address: string; name: string }) => {
    setMarkerPos({ lat: place.lat, lng: place.lng });
    setSelectedAddress(place.address);
    if (onLocationSelect) {
      onLocationSelect({
        lat: place.lat,
        lng: place.lng,
        address: place.address,
        zone: place.name,
      });
    }
  };

  // Constitution Rule 1C: If no valid key, render informative setup banner
  if (!hasValidGoogleMapsKey) {
    return (
      <div className="w-full rounded-2xl bg-slate-900 border border-slate-800 p-6 text-center text-slate-300 shadow-xl space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto">
          <Compass className="w-6 h-6 stroke-[2]" />
        </div>
        <div className="max-w-md mx-auto">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Google Maps Platform — Chave de API Necessária
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Para ativar a visualização com mapas Google Maps em tempo real, pesquisa de locais com a Places API (New) e cálculo de rotas:
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left text-xs text-slate-300 space-y-2 max-w-lg mx-auto">
          <div className="font-bold text-blue-400 text-[11px] font-mono uppercase">
            Como configurar a sua chave no Google AI Studio:
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-xs">
            <li>Obtenha a sua chave no <a href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-300">Google Cloud Console</a></li>
            <li>Abra as <strong>Definições</strong> (ícone ⚙️ no canto superior direito) → <strong>Secrets</strong></li>
            <li>Adicione a variável <code>GOOGLE_MAPS_PLATFORM_KEY</code> com a sua chave</li>
            <li>A aplicação recompila automaticamente sem necessidade de recarregar</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2.5">
      {mode === 'geocoder' && !readOnly && (
        <PlacesSearchBar onSelectPlace={handlePlaceSelect} />
      )}

      {/* CF2: Map needs explicit height */}
      <div style={{ height, width: '100%' }} className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY} version="weekly">
          <Map
            defaultCenter={mode === 'tracking' ? { lat: providerLat, lng: providerLng } : markerPos}
            defaultZoom={zoom}
            mapId="DEMO_MAP_ID"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            onClick={handleMapClick}
            style={{ width: '100%', height: '100%' }}
            gestureHandling="greedy"
            disableDefaultUI={false}
          >
            {mode === 'geocoder' ? (
              <AdvancedMarker
                position={markerPos}
                draggable={!readOnly}
                onDragEnd={(e: any) => {
                  if (e.latLng) {
                    const lat = e.latLng.lat();
                    const lng = e.latLng.lng();
                    setMarkerPos({ lat, lng });
                    if (onLocationSelect) {
                      onLocationSelect({
                        lat,
                        lng,
                        address: selectedAddress,
                        zone: 'Moçambique',
                      });
                    }
                  }
                }}
              >
                <Pin background="#172554" glyphColor="#fff" borderColor="#0f172a" scale={1.1} />
              </AdvancedMarker>
            ) : (
              <>
                {/* Prestador Marker */}
                <AdvancedMarker position={{ lat: providerLat, lng: providerLng }} title={providerName}>
                  <Pin background="#059669" glyphColor="#fff" borderColor="#065f46" scale={1.1} />
                </AdvancedMarker>

                {/* Cliente Marker */}
                <AdvancedMarker position={{ lat: clientLat, lng: clientLng }} title={clientName}>
                  <Pin background="#2563eb" glyphColor="#fff" borderColor="#1e40af" scale={1.1} />
                </AdvancedMarker>

                {/* Rota entre Prestador e Cliente */}
                <RoutePolyline
                  origin={{ lat: providerLat, lng: providerLng }}
                  destination={{ lat: clientLat, lng: clientLng }}
                />
              </>
            )}
          </Map>
        </APIProvider>
      </div>

      {mode === 'geocoder' && (
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-mono text-slate-300">
              {markerPos.lat.toFixed(4)}, {markerPos.lng.toFixed(4)}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 uppercase font-mono">Google Maps Platform</span>
        </div>
      )}
    </div>
  );
};
