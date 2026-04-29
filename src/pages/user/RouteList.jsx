import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoutes } from '../../firebase/db';
import RouteCard from '../../components/RouteCard';

export default function RouteList() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getRoutes()
      .then(setRoutes)
      .catch(() => setError('Kon routes niet laden. Probeer het opnieuw.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">🗺️ Tour Guide</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kies een route om te starten</p>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6">
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-center">
            {error}
          </div>
        )}

        {!loading && !error && routes.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-5xl mb-4">🧭</p>
            <p className="text-lg font-medium">Nog geen routes beschikbaar</p>
            <p className="text-sm mt-1">Kom later terug!</p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {routes.map(route => (
            <RouteCard
              key={route.id}
              route={route}
              onClick={() => navigate(`/route/${route.id}`)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
