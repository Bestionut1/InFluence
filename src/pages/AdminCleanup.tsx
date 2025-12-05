/**
 * Admin Cleanup Page
 * Debug and cleanup tool for development
 * DELETE ALL USER GENOGRAMS - CAREFUL!
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { AppHeader } from '../components/layout/AppHeader';
import * as firestoreService from '../services/firestore';

export const AdminCleanup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [genograms, setGenograms] = useState<any[]>([]);

  // Load genograms on mount
  useEffect(() => {
    const loadGenograms = async () => {
      try {
        const data = await firestoreService.getUserGenograms();
        setGenograms(data);
      } catch (error) {
        console.error('Error loading genograms:', error);
      }
    };

    loadGenograms();
  }, []);

  const handleDeleteAllGenograms = async () => {
    if (!confirmed) {
      setMessage('⚠️ Confirmă prin bifarea căsuței!');
      return;
    }

    setLoading(true);
    setMessage('Se șterge...');

    try {
      // Get all user genograms
      const allGenograms = await firestoreService.getUserGenograms();
      console.log(`Found ${allGenograms.length} genograms to delete`);

      // Delete each one
      let deleted = 0;
      for (const geno of allGenograms) {
        try {
          await firestoreService.deleteGenogram(geno.id);
          deleted++;
          setMessage(`✓ Șterse ${deleted}/${allGenograms.length}...`);
        } catch (err) {
          console.error(`Failed to delete ${geno.id}:`, err);
        }
      }

      setMessage(`✅ Șterse cu succes ${deleted} genograme!`);
      setConfirmed(false);
      setGenograms([]);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error during cleanup:', error);
      setMessage(`❌ Eroare: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 page-enter">
      <AppHeader showLogo showUserMenu sticky={false} />

      <main className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Status Bar */}
        <Card className="bg-slate-900/50 border border-slate-700">
          <CardBody className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-400">Total genograme în Firestore:</p>
                <p className="text-2xl font-bold text-slate-200">{genograms.length}</p>
              </div>
              <div className="text-right">
                {genograms.length === 0 ? (
                  <p className="text-sm text-green-400">✅ Baza de date este curată!</p>
                ) : (
                  <p className="text-sm text-yellow-400">⚠️ {genograms.length} genograme de șterg</p>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Genograms List (Debug) */}
        {genograms.length > 0 && (
          <Card className="bg-slate-900/50 border border-slate-700">
            <CardBody className="p-4 space-y-3">
              <h3 className="font-semibold text-slate-200">Genograme în baza de date:</h3>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {genograms.map((g) => (
                  <div
                    key={g.id}
                    className="p-3 rounded bg-slate-800/50 border border-slate-700 text-xs text-slate-400 space-y-1"
                  >
                    <p className="font-mono text-slate-200 font-semibold">{g.title || '(fără titlu)'}</p>
                    <p className="text-slate-500">ID: {g.id.substring(0, 40)}...</p>
                    <p className="text-blue-400">
                      👥 Membri: <span className="text-white font-semibold">{g.people?.length || 0}</span>
                    </p>
                    <p className="text-purple-400">
                      🔗 Relații: <span className="text-white font-semibold">{g.relations?.length || 0}</span>
                    </p>
                    <p className="text-green-400">
                      📋 Profiluri: <span className="text-white font-semibold">{g.profiles?.length || 0}</span>
                    </p>
                    {g.people && g.people.length > 0 && (
                      <p className="text-cyan-400">
                        👤 Primă persoană: <span className="text-white">{g.people[0]?.name || '(unnamed)'}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Warning Card */}
        <Card className="border-2 border-red-700/50 bg-red-950/30">
          <CardBody className="p-8 space-y-6">
            {/* Warning Header */}
            <div className="flex items-start gap-4">
              <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <h1 className="text-2xl font-bold text-red-400 mb-2">⚠️ Admin Cleanup</h1>
                <p className="text-red-300 text-sm">
                  Acest instrument șterge TOATE genogramele tale din Firestore. Aceasta acțiune NU POATE FI ANULATĂ!
                </p>
              </div>
            </div>

            {/* Info Box */}
            <Card className="bg-slate-900/50 border border-slate-700">
              <CardBody className="p-4">
                <h3 className="font-semibold text-slate-200 mb-2">Ce se va întâmpla:</h3>
                <ul className="text-sm text-slate-400 space-y-1 ml-4">
                  <li>✓ Se vor șterge TOATE genogramele tale din Firestore</li>
                  <li>✓ Dashboard-ul va arăta 0 genograme</li>
                  <li>✓ Aceasta va reseta complet starea aplicației</li>
                  <li>✗ NU POATE FI ANULATĂ - NU MAI POȚI RECUPERA DATELE!</li>
                </ul>
              </CardBody>
            </Card>

            {/* Status Message */}
            {message && (
              <Card
                className={`border ${
                  message.startsWith('✅')
                    ? 'border-green-700 bg-green-950/30'
                    : message.startsWith('❌')
                      ? 'border-red-700 bg-red-950/30'
                      : 'border-yellow-700 bg-yellow-950/30'
                }`}
              >
                <CardBody className="p-4">
                  <p
                    className={
                      message.startsWith('✅')
                        ? 'text-green-400'
                        : message.startsWith('❌')
                          ? 'text-red-400'
                          : 'text-yellow-400'
                    }
                  >
                    {message}
                  </p>
                </CardBody>
              </Card>
            )}

            {/* Checkbox Confirmation */}
            <label htmlFor="confirm-delete" className="flex items-center gap-3 p-4 rounded-lg border border-red-700/30 bg-red-950/20 cursor-pointer hover:bg-red-950/40 transition-colors">
              <input
                id="confirm-delete"
                name="confirm-delete"
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                disabled={loading}
                className="w-5 h-5 rounded border-red-700 accent-red-600"
              />
              <span className="text-sm text-red-300">
                Da, sunt sigur! Șterge TOATE genogramele mele permanent!
              </span>
            </label>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="ghost"
                onClick={handleGoBack}
                disabled={loading}
                className="flex-1"
              >
                ← Înapoi la Dashboard
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteAllGenograms}
                disabled={!confirmed || loading}
                isLoading={loading}
                className="flex-1"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {loading ? 'Se șterge...' : 'Șterge Permanent'}
              </Button>
            </div>

            {/* Additional Info */}
            <Card className="bg-slate-900/50 border border-slate-700">
              <CardBody className="p-4">
                <p className="text-xs text-slate-500">
                  💡 <strong>Sfat:</strong> Folosește această pagină DOAR pentru a reseta aplicația. După ștergere, poți
                  crea genograme noi ca de obicei.
                </p>
              </CardBody>
            </Card>
          </CardBody>
        </Card>
      </main>
    </div>
  );
};
