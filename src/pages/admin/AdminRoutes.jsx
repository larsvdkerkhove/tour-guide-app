import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAllRoutes,
  deleteRoute,
  updateRoute,
  getWaypoints
} from '../../firebase/db';
import { logoutAdmin } from '../../firebase/auth';

export default function AdminRoutes() {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [waypointCounts, setWaypointCounts] = useState({});
  const [loading, setLoading] = useState(true);

  async function laadRoutes() {
    setLoading(true);
    const data = await getAllRoutes();
    setRoutes(data);

    const counts = {};
    await Promise.all(
      data.map(async (r) => {
        const wps = await getWaypoints(r.id);
        counts[r.id] = wps.length;
      })
    );
    setWaypointCounts(counts);
    setLoading(false);
  }

  useEffect(() => {
    laadRoutes();
  }, []);

  async function handleVerwijder(route) {
    if (!window.confirm(`Route "${route.naam}" definitief verwijderen?`)) return;
    await deleteRoute(route.id);
    await laadRoutes();
  }

  async function handlePubliceer(route) {
    await updateRoute(route.id, { gepubliceerd: !route.gepubliceerd });
    await laadRoutes();
  }

  async function handleUitloggen() {
    await logoutAdmin();
    navigate('/admin/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Admin — Routes</h1>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/admin/route/nieuw')}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              + Nieuwe route
            </button>
            <button
              onClick={handleUitloggen}
              className="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Uitloggen
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : routes.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-3">📋</p>
            <p>Nog geen routes aangemaakt.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {routes.map(route => (
              <div
                key={route.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-semibold text-gray-900 text-lg">{route.naam}</h2>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          route.gepubliceerd
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {route.gepubliceerd ? 'Gepubliceerd' : 'Concept'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {waypointCounts[route.id] ?? '…'} waypoints
                      {route.duur ? ` · ${route.duur} min` : ''}
                    </p>
                  </div>

                  <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
                    <button
                      onClick={() => navigate(`/admin/route/${route.id}`)}
                      className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Bewerken
                    </button>
                    <button
                      onClick={() => navigate(`/admin/waypoints/${route.id}`)}
                      className="text-sm px-3 py-1.5 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50"
                    >
                      Waypoints
                    </button>
                    <button
                      onClick={() => handlePubliceer(route)}
                      className={`text-sm px-3 py-1.5 rounded-lg ${
                        route.gepubliceerd
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {route.gepubliceerd ? 'Depubliceren' : 'Publiceren'}
                    </button>
                    <button
                      onClick={() => handleVerwijder(route)}
                      className="text-sm px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100"
                    >
                      Verwijderen
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
