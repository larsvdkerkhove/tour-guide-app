import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoute, getWaypoints } from '../../firebase/db';
import { useGPS } from '../../hooks/useGPS';
import { useVoice } from '../../hooks/useVoice';
import { afstandInMeters } from '../../utils/geo';
import MapView from '../../components/MapView';
import NavInstruction from '../../components/NavInstruction';

export default function Navigate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [route, setRoute] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aangekomen, setAangekomen] = useState(false);
  const [huidigeInstructie, setHuidigeInstructie] = useState(null);
  const [volgendWaypoint, setVolgendWaypoint] = useState(null);

  const uitgesprookenRef = useRef(new Set());

  const gps = useGPS();
  const { speak } = useVoice();

  useEffect(() => {
    Promise.all([getRoute(id), getWaypoints(id)])
      .then(([r, wps]) => {
        setRoute(r);
        setWaypoints(wps);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Verwerk GPS updates
  useEffect(() => {
    if (!gps.lat || !gps.lng || waypoints.length === 0 || aangekomen) return;

    const userLat = gps.lat;
    const userLng = gps.lng;

    // Controleer aankomst bij laatste waypoint
    const laatste = waypoints[waypoints.length - 1];
    const afstandLaatste = afstandInMeters(userLat, userLng, laatste.lat, laatste.lng);
    if (afstandLaatste < 30) {
      setAangekomen(true);
      speak('Je bent aangekomen! Geniet van je bestemming.');
      return;
    }

    // Zoek dichtstbijzijnde waypoint dat nog niet voorbij is
    let dichtstbijzijndeWpIndex = 0;
    let minAfstand = Infinity;
    waypoints.forEach((wp, i) => {
      const d = afstandInMeters(userLat, userLng, wp.lat, wp.lng);
      if (d < minAfstand) {
        minAfstand = d;
        dichtstbijzijndeWpIndex = i;
      }
    });

    const activeWp = waypoints[dichtstbijzijndeWpIndex];
    const volgende = waypoints[dichtstbijzijndeWpIndex + 1] ?? null;
    setVolgendWaypoint(volgende ?? activeWp);

    // Verwerk instructies van elk waypoint
    let eersteInstructieGezet = false;
    waypoints.forEach((wp, wpIndex) => {
      if (!wp.instructies) return;
      wp.instructies.forEach((instructie, instrIndex) => {
        const sleutel = `${wp.id ?? wpIndex}-${instrIndex}`;
        if (uitgesprookenRef.current.has(sleutel)) return;

        const afstandTotWp = afstandInMeters(userLat, userLng, wp.lat, wp.lng);
        const triggerAfstand = instructie.afstand ?? 50;

        if (afstandTotWp <= triggerAfstand) {
          uitgesprookenRef.current.add(sleutel);
          speak(instructie.tekst);
          if (!eersteInstructieGezet) {
            setHuidigeInstructie(instructie);
            eersteInstructieGezet = true;
          }
        } else if (!eersteInstructieGezet && wpIndex >= dichtstbijzijndeWpIndex) {
          // Zet als volgende te verwachten instructie
          setHuidigeInstructie(instructie);
          eersteInstructieGezet = true;
        }
      });
    });
  }, [gps.lat, gps.lng, waypoints, aangekomen, speak]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const userLocation = gps.lat ? { lat: gps.lat, lng: gps.lng } : null;

  return (
    <div className="relative w-full h-screen bg-gray-900 flex flex-col overflow-hidden">
      {/* Instructiebalk */}
      {!aangekomen && huidigeInstructie && (
        <NavInstruction
          instructie={huidigeInstructie}
          volgendWaypoint={volgendWaypoint}
        />
      )}

      {/* Aankomstmelding */}
      {aangekomen && (
        <div className="absolute top-0 left-0 right-0 z-20 bg-green-700 text-white px-4 py-4 text-center shadow-lg">
          <p className="text-2xl font-bold">🎉 Je bent aangekomen!</p>
          <p className="text-sm mt-1">Geniet van de route!</p>
        </div>
      )}

      {/* GPS fout */}
      {gps.error && !gps.lat && (
        <div className="absolute bottom-24 left-4 right-4 z-20 bg-yellow-600 text-white rounded-xl px-4 py-3 text-sm shadow">
          ⚠️ {gps.error}
        </div>
      )}

      {/* Kaart */}
      <div className="flex-1">
        <MapView
          waypoints={waypoints}
          userLocation={userLocation}
          showRoute
          interactive
        />
      </div>

      {/* Terug + route info balk */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gray-900 bg-opacity-90 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(`/route/${id}`)}
          className="flex-shrink-0 bg-gray-700 hover:bg-gray-600 text-white rounded-full p-3"
          aria-label="Terug"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>
        <div className="flex-1 text-white">
          <p className="font-semibold text-sm truncate">{route?.naam}</p>
          {gps.accuracy && (
            <p className="text-xs text-gray-400">GPS: ±{Math.round(gps.accuracy)} m</p>
          )}
        </div>
        {aangekomen && (
          <button
            onClick={() => navigate('/routes')}
            className="bg-green-600 hover:bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-full"
          >
            Afsluiten
          </button>
        )}
      </div>
    </div>
  );
}
