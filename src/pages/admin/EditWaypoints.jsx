import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getWaypoints,
  saveWaypoint,
  deleteWaypoint,
  reorderWaypoints,
  getRoute
} from '../../firebase/db';
import MapView from '../../components/MapView';

const RICHTINGEN = ['links', 'rechts', 'rechtdoor', 'rotonde', 'aankomst'];

function leegInstructie() {
  return { tekst: '', afstand: 50, richting: 'rechtdoor' };
}

function leegWaypoint(volgorde, lat, lng) {
  return {
    naam: '',
    beschrijving: '',
    lat,
    lng,
    volgorde,
    instructies: [leegInstructie()]
  };
}

export default function EditWaypoints() {
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const [route, setRoute] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [actieveIndex, setActieveIndex] = useState(null);
  const [formulier, setFormulier] = useState(null);
  const [opslaan, setOpslaan] = useState(false);
  const [bericht, setBericht] = useState('');

  async function laadWaypoints() {
    const [r, wps] = await Promise.all([getRoute(routeId), getWaypoints(routeId)]);
    setRoute(r);
    setWaypoints(wps);
  }

  useEffect(() => {
    laadWaypoints();
  }, [routeId]);

  // Klik op kaart → nieuw waypoint toevoegen
  const handleMapClick = useCallback(
    ({ lat, lng }) => {
      const volgorde = waypoints.length + 1;
      const nieuw = leegWaypoint(volgorde, lat, lng);
      setFormulier(nieuw);
      setActieveIndex(null);
    },
    [waypoints.length]
  );

  function selecteerWaypoint(index) {
    setActieveIndex(index);
    setFormulier({ ...waypoints[index] });
  }

  // Formulier helpers
  function updateFormulierVeld(veld, waarde) {
    setFormulier(prev => ({ ...prev, [veld]: waarde }));
  }

  function updateInstructie(instrIndex, veld, waarde) {
    setFormulier(prev => {
      const nieuweInstructies = [...prev.instructies];
      nieuweInstructies[instrIndex] = { ...nieuweInstructies[instrIndex], [veld]: waarde };
      return { ...prev, instructies: nieuweInstructies };
    });
  }

  function voegInstructieToe() {
    setFormulier(prev => ({
      ...prev,
      instructies: [...prev.instructies, leegInstructie()]
    }));
  }

  function verwijderInstructie(instrIndex) {
    setFormulier(prev => ({
      ...prev,
      instructies: prev.instructies.filter((_, i) => i !== instrIndex)
    }));
  }

  async function handleOpslaanWaypoint(e) {
    e.preventDefault();
    if (!formulier.naam.trim()) {
      setBericht('Geef het waypoint een naam.');
      return;
    }
    setOpslaan(true);
    setBericht('');
    try {
      await saveWaypoint(routeId, formulier);
      await laadWaypoints();
      setFormulier(null);
      setActieveIndex(null);
      setBericht('Waypoint opgeslagen!');
      setTimeout(() => setBericht(''), 2000);
    } catch {
      setBericht('Opslaan mislukt.');
    } finally {
      setOpslaan(false);
    }
  }

  async function handleVerwijderWaypoint(wp) {
    if (!window.confirm(`Waypoint "${wp.naam || 'Naamloos'}" verwijderen?`)) return;
    await deleteWaypoint(routeId, wp.id);
    await laadWaypoints();
    if (formulier?.id === wp.id) {
      setFormulier(null);
      setActieveIndex(null);
    }
  }

  async function handleVerschuif(index, richting) {
    const nieuweVolgorde = [...waypoints];
    const swapIndex = richting === 'omhoog' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= nieuweVolgorde.length) return;
    [nieuweVolgorde[index], nieuweVolgorde[swapIndex]] = [
      nieuweVolgorde[swapIndex],
      nieuweVolgorde[index]
    ];
    const orderedIds = nieuweVolgorde.map(wp => wp.id);
    await reorderWaypoints(routeId, orderedIds);
    await laadWaypoints();
  }

  const actieveWaypointId =
    actieveIndex !== null ? waypoints[actieveIndex]?.id : null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/routes')}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Terug"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-700">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-900">
            Waypoints — {route?.naam ?? '…'}
          </h1>
        </div>
      </header>

      {bericht && (
        <div className="bg-blue-600 text-white text-center text-sm py-2">{bericht}</div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row max-w-6xl mx-auto w-full gap-0 lg:gap-4 px-0 lg:px-4 py-0 lg:py-4">
        {/* Kaart */}
        <div className="h-64 lg:h-auto lg:flex-1 relative">
          <MapView
            waypoints={waypoints}
            showRoute
            onMapClick={handleMapClick}
            activeWaypointId={actieveWaypointId}
            interactive
          />
          <p className="absolute bottom-3 left-3 bg-white bg-opacity-90 text-xs text-gray-600 px-2 py-1 rounded shadow">
            Klik op kaart om waypoint toe te voegen
          </p>
        </div>

        {/* Zijpaneel */}
        <div className="w-full lg:w-80 flex flex-col overflow-hidden">
          {/* Waypoint lijst */}
          <div className="bg-white border-b lg:border lg:rounded-xl shadow-sm overflow-y-auto max-h-64 lg:max-h-72">
            <div className="px-4 pt-4 pb-2">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Waypoints ({waypoints.length})
              </h2>
            </div>
            {waypoints.length === 0 && (
              <p className="text-sm text-gray-400 px-4 pb-4">
                Klik op de kaart om het eerste waypoint toe te voegen.
              </p>
            )}
            <ul>
              {waypoints.map((wp, i) => (
                <li
                  key={wp.id}
                  className={`flex items-center gap-3 px-4 py-3 border-t border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    actieveIndex === i ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => selecteerWaypoint(i)}
                >
                  <span className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                  <span className="flex-1 font-medium text-gray-800 text-sm truncate">
                    {wp.naam || <em className="text-gray-400">Naamloos</em>}
                  </span>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={e => { e.stopPropagation(); handleVerschuif(i, 'omhoog'); }}
                      disabled={i === 0}
                      className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"
                      aria-label="Omhoog"
                    >
                      ↑
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleVerschuif(i, 'omlaag'); }}
                      disabled={i === waypoints.length - 1}
                      className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"
                      aria-label="Omlaag"
                    >
                      ↓
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleVerwijderWaypoint(wp); }}
                      className="p-1 rounded hover:bg-red-100 text-red-500"
                      aria-label="Verwijderen"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Bewerk formulier */}
          {formulier && (
            <form
              onSubmit={handleOpslaanWaypoint}
              className="bg-white mt-2 lg:mt-3 lg:border lg:rounded-xl shadow-sm flex-1 overflow-y-auto p-4 space-y-3"
            >
              <h2 className="font-semibold text-gray-800">
                {formulier.id ? 'Waypoint bewerken' : 'Nieuw waypoint'}
              </h2>
              <p className="text-xs text-gray-400">
                Positie: {formulier.lat?.toFixed(5)}, {formulier.lng?.toFixed(5)}
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Naam *</label>
                <input
                  type="text"
                  required
                  value={formulier.naam}
                  onChange={e => updateFormulierVeld('naam', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Grote Markt"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Beschrijving
                </label>
                <textarea
                  rows={2}
                  value={formulier.beschrijving}
                  onChange={e => updateFormulierVeld('beschrijving', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Optionele info voor de gebruiker…"
                />
              </div>

              {/* Instructies */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Instructies</label>
                  <button
                    type="button"
                    onClick={voegInstructieToe}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    + Toevoegen
                  </button>
                </div>
                <div className="space-y-3">
                  {formulier.instructies.map((instr, i) => (
                    <div
                      key={i}
                      className="border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500">
                          Instructie {i + 1}
                        </span>
                        {formulier.instructies.length > 1 && (
                          <button
                            type="button"
                            onClick={() => verwijderInstructie(i)}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Verwijderen
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={instr.tekst}
                        onChange={e => updateInstructie(i, 'tekst', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Sla links af richting het plein"
                      />
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="text-xs text-gray-500 mb-0.5 block">
                            Afstand (m)
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={instr.afstand}
                            onChange={e =>
                              updateInstructie(i, 'afstand', parseInt(e.target.value, 10))
                            }
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-gray-500 mb-0.5 block">Richting</label>
                          <select
                            value={instr.richting}
                            onChange={e => updateInstructie(i, 'richting', e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                          >
                            {RICHTINGEN.map(r => (
                              <option key={r} value={r}>
                                {r.charAt(0).toUpperCase() + r.slice(1)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setFormulier(null); setActieveIndex(null); }}
                  className="flex-1 border border-gray-300 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  disabled={opslaan}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
                >
                  {opslaan ? 'Opslaan…' : 'Opslaan'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
