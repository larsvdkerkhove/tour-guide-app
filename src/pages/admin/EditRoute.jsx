import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoute, createRoute, updateRoute } from '../../firebase/db';

export default function EditRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNieuw = !id || id === 'nieuw';

  const [naam, setNaam] = useState('');
  const [beschrijving, setBeschrijving] = useState('');
  const [afbeeldingUrl, setAfbeeldingUrl] = useState('');
  const [duur, setDuur] = useState('');
  const [laden, setLaden] = useState(!isNieuw);
  const [opslaan, setOpslaan] = useState(false);
  const [fout, setFout] = useState('');

  useEffect(() => {
    if (isNieuw) return;
    getRoute(id)
      .then(route => {
        if (route) {
          setNaam(route.naam ?? '');
          setBeschrijving(route.beschrijving ?? '');
          setAfbeeldingUrl(route.afbeeldingUrl ?? '');
          setDuur(route.duur?.toString() ?? '');
        }
      })
      .finally(() => setLaden(false));
  }, [id, isNieuw]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!naam.trim()) {
      setFout('Geef de route een naam.');
      return;
    }
    setFout('');
    setOpslaan(true);
    try {
      const data = {
        naam: naam.trim(),
        beschrijving: beschrijving.trim(),
        afbeeldingUrl: afbeeldingUrl.trim(),
        duur: duur ? parseInt(duur, 10) : null
      };
      if (isNieuw) {
        await createRoute(data);
      } else {
        await updateRoute(id, data);
      }
      navigate('/admin/routes');
    } catch {
      setFout('Opslaan mislukt. Probeer opnieuw.');
    } finally {
      setOpslaan(false);
    }
  }

  if (laden) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/routes')}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Terug"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-700">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            {isNieuw ? 'Nieuwe route' : 'Route bewerken'}
          </h1>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Naam <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={naam}
              onChange={e => setNaam(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Wandeling door het stadscentrum"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Beschrijving
            </label>
            <textarea
              value={beschrijving}
              onChange={e => setBeschrijving(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Een korte omschrijving van de route…"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Afbeelding URL (optioneel)
            </label>
            <input
              type="url"
              value={afbeeldingUrl}
              onChange={e => setAfbeeldingUrl(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://…"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Geschatte duur (minuten)
            </label>
            <input
              type="number"
              value={duur}
              onChange={e => setDuur(e.target.value)}
              min={1}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="90"
            />
          </div>

          {fout && (
            <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{fout}</p>
          )}

          <button
            type="submit"
            disabled={opslaan}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-lg transition-colors"
          >
            {opslaan ? 'Opslaan…' : 'Opslaan'}
          </button>
        </form>
      </main>
    </div>
  );
}
