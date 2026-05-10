import { useState } from 'react';

const COUNTRIES = [
  { code: 'BF', dial: '+226', flag: '🇧🇫', name: 'Burkina Faso' },
  { code: 'CI', dial: '+225', flag: '🇨🇮', name: "Côte d'Ivoire" },
  { code: 'ML', dial: '+223', flag: '🇲🇱', name: 'Mali' },
  { code: 'SN', dial: '+221', flag: '🇸🇳', name: 'Sénégal' },
  { code: 'GH', dial: '+233', flag: '🇬🇭', name: 'Ghana' },
  { code: 'TG', dial: '+228', flag: '🇹🇬', name: 'Togo' },
  { code: 'BJ', dial: '+229', flag: '🇧🇯', name: 'Bénin' },
  { code: 'NE', dial: '+227', flag: '🇳🇪', name: 'Niger' },
  { code: 'FR', dial: '+33',  flag: '🇫🇷', name: 'France' },
  { code: 'TCH', dial: '+235',  flag: '🇹🇨', name: 'Tchad' },
];

export default function PhoneInput({ value, onChange, placeholder = 'XX XX XX XX' }) {
  const [country, setCountry] = useState(COUNTRIES[0]); // Burkina par défaut
  const [open,    setOpen]    = useState(false);

  const handleChange = (e) => {
    onChange(`${country.dial} ${e.target.value}`);
  };

  const handleCountry = (c) => {
    setCountry(c);
    setOpen(false);
    onChange(`${c.dial} `);
  };

  const phoneNumber = value.replace(country.dial, '').trim();

  return (
    <div className="flex gap-2 relative">
      {/* SÉLECTEUR PAYS */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="btn btn-ghost border border-base-300 gap-1 px-3 h-12 min-h-0">
          <span>{country.flag}</span>
          <span className="text-xs opacity-60">{country.dial}</span>
        </button>

        {open && (
          <div className="absolute top-14 left-0 bg-base-100 border border-base-200 rounded shadow-2xl z-50 w-52 max-h-60 overflow-y-auto">
            {COUNTRIES.map(c => (
              <button
                key={c.code}
                type="button"
                onClick={() => handleCountry(c)}
                className="flex items-center gap-3 w-full px-4 py-2 hover:bg-base-200 text-sm transition-colors">
                <span>{c.flag}</span>
                <span className="flex-1 text-left">{c.name}</span>
                <span className="opacity-40 text-xs">{c.dial}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* NUMÉRO */}
      <input
        type="tel"
        className="input input-bordered flex-1"
        placeholder={placeholder}
        value={phoneNumber}
        onChange={handleChange}
      />
    </div>
  );
}