const RICHTING_ICONEN = {
  links: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
      <path d="M9 19V5l-7 7 7 7zm5-14v14l7-7-7-7z" transform="scale(-1,1) translate(-24,0)" />
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
    </svg>
  ),
  rechts: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z" />
    </svg>
  ),
  rechtdoor: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
      <path d="M12 2l-4 4h3v14h2V6h3L12 2z" />
    </svg>
  ),
  rotonde: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
      <path d="M12 4C7.58 4 4 7.58 4 12s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm-1-9v4l3.25 1.95.75-1.23-2.75-1.67V9H11z" />
    </svg>
  ),
  aankomst: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
    </svg>
  )
};

export default function NavInstruction({ instructie, volgendWaypoint }) {
  if (!instructie) return null;

  const icoon = RICHTING_ICONEN[instructie.richting] ?? RICHTING_ICONEN.rechtdoor;

  return (
    <div className="absolute top-0 left-0 right-0 z-20 bg-gray-900 bg-opacity-95 text-white px-4 py-3 flex items-center gap-4 shadow-lg">
      <div className="flex-shrink-0 text-blue-400">{icoon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xl font-bold leading-tight truncate">{instructie.tekst}</p>
        {volgendWaypoint && (
          <p className="text-sm text-gray-400 mt-0.5 truncate">
            Richting: {volgendWaypoint.naam}
          </p>
        )}
      </div>
      {instructie.afstand > 0 && (
        <div className="flex-shrink-0 text-right">
          <p className="text-lg font-semibold text-blue-300">
            {instructie.afstand < 1000
              ? `${instructie.afstand} m`
              : `${(instructie.afstand / 1000).toFixed(1)} km`}
          </p>
        </div>
      )}
    </div>
  );
}
