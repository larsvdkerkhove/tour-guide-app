export default function RouteCard({ route, onClick }) {
  const afstandTekst =
    route.totaalAfstand >= 1000
      ? `${(route.totaalAfstand / 1000).toFixed(1)} km`
      : route.totaalAfstand
      ? `${route.totaalAfstand} m`
      : null;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {route.afbeeldingUrl && (
        <img
          src={route.afbeeldingUrl}
          alt={route.naam}
          className="w-full h-40 object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      )}
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-900 mb-1">{route.naam}</h2>
        {route.beschrijving && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {route.beschrijving}
          </p>
        )}
        <div className="flex gap-4 text-sm text-gray-500">
          {afstandTekst && (
            <span className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-blue-500">
                <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z" />
              </svg>
              {afstandTekst}
            </span>
          )}
          {route.duur && (
            <span className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-blue-500">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
              </svg>
              {route.duur} min
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
