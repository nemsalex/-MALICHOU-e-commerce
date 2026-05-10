import { useState } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';

const VILLES_BURKINA = {
  'Ouagadougou': [
    'Secteur 1 (Patte d\'Oie)', 'Secteur 2', 'Secteur 3', 'Secteur 4',
    'Secteur 5', 'Secteur 6', 'Secteur 7', 'Secteur 8', 'Secteur 9',
    'Secteur 10', 'Secteur 11', 'Secteur 12', 'Secteur 13', 'Secteur 14',
    'Secteur 15', 'Secteur 16', 'Secteur 17', 'Secteur 18', 'Secteur 19',
    'Secteur 20', 'Secteur 21', 'Secteur 22', 'Secteur 23', 'Secteur 24',
    'Secteur 25', 'Secteur 26', 'Secteur 27', 'Secteur 28', 'Secteur 29',
    'Secteur 30', 'Gounghin', 'Cissin', 'Wemtenga', 'Karpala',
    'Tampouy', 'Tanghin', 'Pissy', 'Sig-Noghin', 'Nioko',
    'Saaba', 'Kombissiri (périphérie)', 'Autre',
  ],
  'Bobo-Dioulasso': [
    'Secteur 1', 'Secteur 2', 'Secteur 3', 'Secteur 4', 'Secteur 5',
    'Secteur 6', 'Secteur 7', 'Secteur 8', 'Secteur 9', 'Secteur 10',
    'Dioulassoba', 'Koko', 'Sarfalao', 'Bindougousso', 'Lafiabougou',
    'Accart-ville', 'Dogona', 'Autre',
  ],
  'Koudougou': [
    'Secteur 1', 'Secteur 2', 'Secteur 3', 'Secteur 4',
    'Secteur 5', 'Secteur 6', 'Secteur 7', 'Autre',
  ],
  'Ouahigouya': [
    'Secteur 1', 'Secteur 2', 'Secteur 3', 'Secteur 4',
    'Secteur 5', 'Secteur 6', 'Autre',
  ],
  'Banfora': [
    'Secteur 1', 'Secteur 2', 'Secteur 3', 'Secteur 4', 'Autre',
  ],
  'Manga': ['Centre', 'Périphérie', 'Autre'],
  'Tenkodogo': ['Centre', 'Périphérie', 'Autre'],
  'Kaya': ['Centre', 'Périphérie', 'Autre'],
  'Dédougou': ['Centre', 'Périphérie', 'Autre'],
  'Fada N\'Gourma': ['Centre', 'Périphérie', 'Autre'],
};

export default function AddressInput({ value, onChange }) {
  const [ville,    setVille]    = useState('');
  const [quartier, setQuartier] = useState('');
  const [repere,   setRepere]   = useState('');

  const handleVille = (v) => {
    setVille(v);
    setQuartier('');
    updateAddress(v, '', repere);
  };

  const handleQuartier = (q) => {
    setQuartier(q);
    updateAddress(ville, q, repere);
  };

  const handleRepere = (r) => {
    setRepere(r);
    updateAddress(ville, quartier, r);
  };

  const updateAddress = (v, q, r) => {
    const parts = [v, q, r].filter(Boolean);
    onChange(parts.join(', '));
  };

  return (
    <div className="space-y-3">
      {/* VILLE */}
      <div>
        <p className="text-xs uppercase tracking-widest opacity-40 mb-2 flex items-center gap-2">
          <MapPin size={11}/> Ville
        </p>
        <div className="relative">
          <select
            className="select select-bordered w-full"
            value={ville}
            onChange={e => handleVille(e.target.value)}
            required>
            <option value="">Choisir une ville...</option>
            {Object.keys(VILLES_BURKINA).map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* QUARTIER / SECTEUR */}
      {ville && (
        <div>
          <p className="text-xs uppercase tracking-widest opacity-40 mb-2">
            Quartier / Secteur
          </p>
          <select
            className="select select-bordered w-full"
            value={quartier}
            onChange={e => handleQuartier(e.target.value)}
            required>
            <option value="">Choisir un quartier...</option>
            {VILLES_BURKINA[ville]?.map(q => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>
        </div>
      )}

      {/* POINT DE REPÈRE */}
      {quartier && (
        <div>
          <p className="text-xs uppercase tracking-widest opacity-40 mb-2">
            Point de repère (optionnel)
          </p>
          <input
            type="text"
            className="input input-bordered w-full text-sm"
            placeholder="Ex: Près du marché, derrière l'école..."
            value={repere}
            onChange={e => handleRepere(e.target.value)}
          />
        </div>
      )}

      {/* APERÇU ADRESSE */}
      {ville && quartier && (
        <div className="bg-base-200 px-4 py-3 rounded text-sm opacity-70">
          <span className="text-xs uppercase tracking-widest opacity-50 block mb-1">
            Adresse de livraison
          </span>
          {[ville, quartier, repere].filter(Boolean).join(', ')}
        </div>
      )}
    </div>
  );
}