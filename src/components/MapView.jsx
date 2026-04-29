import { useRef, useEffect, useCallback } from 'react';
import Map, { Marker, Source, Layer, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MapView({
  waypoints = [],
  userLocation = null,
  showRoute = false,
  onMapClick = null,
  interactive = true,
  activeWaypointId = null
}) {
  const mapRef = useRef(null);

  // Bereken initiale viewport op basis van waypoints
  const initialLng = waypoints[0]?.lng ?? 4.3517;
  const initialLat = waypoints[0]?.lat ?? 50.8503;

  const routeGeoJSON = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: waypoints.map(wp => [wp.lng, wp.lat])
    }
  };

  const handleClick = useCallback(
    (event) => {
      if (onMapClick) {
        const { lng, lat } = event.lngLat;
        onMapClick({ lng, lat });
      }
    },
    [onMapClick]
  );

  // Centreer op gebruikerslocatie wanneer die verandert
  useEffect(() => {
    if (userLocation?.lat && userLocation?.lng && mapRef.current) {
      mapRef.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        duration: 800
      });
    }
  }, [userLocation?.lat, userLocation?.lng]);

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={MAPBOX_TOKEN}
      initialViewState={{
        longitude: initialLng,
        latitude: initialLat,
        zoom: 14
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      onClick={onMapClick ? handleClick : undefined}
      cursor={onMapClick ? 'crosshair' : 'grab'}
      interactive={interactive}
    >
      <NavigationControl position="bottom-right" />

      {/* Route lijn */}
      {showRoute && waypoints.length > 1 && (
        <Source id="route" type="geojson" data={routeGeoJSON}>
          <Layer
            id="route-line"
            type="line"
            paint={{
              'line-color': '#3b82f6',
              'line-width': 4,
              'line-opacity': 0.8
            }}
          />
        </Source>
      )}

      {/* Waypoint markers */}
      {waypoints.map((wp, index) => (
        <Marker
          key={wp.id ?? index}
          longitude={wp.lng}
          latitude={wp.lat}
          anchor="bottom"
        >
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full border-2 font-bold text-sm shadow-lg
              ${activeWaypointId && wp.id === activeWaypointId
                ? 'bg-orange-500 border-white text-white scale-125'
                : 'bg-blue-600 border-white text-white'
              }`}
          >
            {index + 1}
          </div>
        </Marker>
      ))}

      {/* Gebruikerslocatie — blauwe stip */}
      {userLocation?.lat && userLocation?.lng && (
        <Marker longitude={userLocation.lng} latitude={userLocation.lat} anchor="center">
          <div className="relative">
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
            <div className="absolute inset-0 w-4 h-4 bg-blue-400 rounded-full animate-ping opacity-50" />
          </div>
        </Marker>
      )}
    </Map>
  );
}
