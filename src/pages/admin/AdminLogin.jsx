import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../../firebase/auth';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [wachtwoord, setWachtwoord] = useState('');
  const [fout, setFout] = useState('');
  const [laden, setLaden] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setFout('');
    setLaden(true);
    try {
      await loginAdmin(email, wachtwoord);
      navigate('/admin/routes', { replace: true });
    } catch {
      setFout('Ongeldig e-mailadres of wachtwoord. Probeer het opnieuw.');
    } finally {
      setLaden(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <span className="text-4xl">🗝️</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Admin inloggen</h1>
          <p className="text-gray-500 text-sm mt-1">Alleen voor beheerders</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mailadres
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@voorbeeld.be"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wachtwoord
            </label>
            <input
              type="password"
              required
              value={wachtwoord}
              onChange={e => setWachtwoord(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          {fout && (
            <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{fout}</p>
          )}

          <button
            type="submit"
            disabled={laden}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-lg transition-colors"
          >
            {laden ? 'Bezig…' : 'Inloggen'}
          </button>
        </form>
      </div>
    </div>
  );
}
