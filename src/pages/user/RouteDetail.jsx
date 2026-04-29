import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoute, getWaypoints } from '../../firebase/db';
import MapView from '../../components/MapView';

export default function RouteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [route, setRoute] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getRoute(id), getWaypoints(id)])
      .then(([r, wps]) => {
        setRoute(r);
        setWaypoints(wps);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!route) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6">
        <p className="text-gray-500 text-lg">Route niet gevonden.</p>
        <button
          onClick={() => navigate('/routes')}
          className="text-blue-600 underline"
        >
          Terug naar overzicht
        </button>
      </div>
    );
  }

  const afstandTekst =
    route.totaalAfstand >= 1000
      ? `${(route.totaalAfstand / 1000).toFixed(1)} km`
      : route.totaalAfstand
      ? `${route.totaalAfstand} m`
      : null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Kaart */}
      <div className="h-56 relative">
        <MapView waypoints={waypoints} showRoute interactive={false} />
        <button
          onClick={() => navigate('/routes')}
          className="absolute top-3 left-3 z-10 bg-white rounded-full p-2 shadow-md"
          aria-label="Terug"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-700">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>
      </div>

      {/* Info */}
      <div className="flex-1 bg-white rounded-t-3xl -mt-4 px-6 pt-6 pb-8 shadow-lg">
        {route.afbeeldingUrl && (
          <img
            src={route.afbeeldingUrl}
            alt={route.naam}
            className="w-full h-40 object-cover rounded-xl mb-4"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        )}

        <h1 className="text-2xl font-bold text-gray-900 mb-2">{route.naam}</h1>

        <div className="flex gap-4 mb-4">
          {afstandTekst && (
            <span className="bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">
              📍 {afstandTekst}
            </span>
          )}
          {route.duur && (
            <span className="bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">
              ⏱ {route.duur} min
            </span>
          )}
        </div>

        {route.beschrijving && (
          <p className="text-gray-600 text-base leading-relaxed mb-6">
            {route.beschrijving}
          </p>
        )}

        {waypoints.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Bezienswaardigheden
            </h2>
            <ol className="space-y-2">
              {waypoints.map((wp, i) => (
                <li key={wp.id} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-800">{wp.naam}</p>
                    {wp.beschrijving && (
                      <p className="text-sm text-gray-500">{wp.beschrijving}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        <button
          onClick={() => navigate(`/navigate/${id}`)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 rounded-2xl transition-colors"
        >
          🚀 Start navigatie
        </button>
      </div>
    </div>
  );
}
