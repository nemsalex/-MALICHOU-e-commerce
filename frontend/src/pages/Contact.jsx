import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import api from '../api';

export default function Contact() {
  const [form,    setForm]    = useState({ name:'', email:'', subject:'', message:'' });
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    await api.post('/contact/', form);
    setSent(true);
  } catch {
    alert("Erreur lors de l'envoi. Réessayez.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-base-100">
      <Navbar/>

      {/* HERO */}
      <section className="hero-gradient text-white py-16 px-6 text-center">
        <p className="text-xs tracking-[0.3em] uppercase opacity-60 mb-3">Nous sommes là</p>
        <h1 className="font-display text-5xl font-light">Contactez-nous</h1>
        <p className="opacity-60 text-sm mt-4 max-w-md mx-auto">
          Une question, une suggestion ou juste envie de dire bonjour ? On vous répond sous 24h.
        </p>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-16 grid lg:grid-cols-3 gap-12">

        {/* INFOS */}
        <div className="space-y-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] opacity-40 mb-6">Nos coordonnées</p>
            {[
              { icon: Mail,    label:'Email',    value:'contact@liza.com' },
              { icon: Phone,   label:'Téléphone',value:'+226 64 73 52 27' },
              { icon: MapPin,  label:'Adresse',  value:'Ouagadougou, Burkina Faso' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex gap-4 items-start mb-6">
                <div className="w-10 h-10 bg-base-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="opacity-60"/>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider opacity-40">{label}</p>
                  <p className="text-sm mt-1">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-base-200 rounded p-5">
            <p className="text-xs uppercase tracking-wider opacity-40 mb-2">Horaires</p>
            <p className="text-sm opacity-70">Lun – Ven : 8h00 – 18h00</p>
            <p className="text-sm opacity-70">Sam : 9h00 – 14h00</p>
            <p className="text-sm opacity-40">Dim : Fermé</p>
          </div>
        </div>

        {/* FORMULAIRE */}
        <div className="lg:col-span-2">
          {sent ? (
            <div className="flex flex-col items-center justify-center h-full py-20 gap-4 text-center">
              <CheckCircle size={56} className="text-success"/>
              <h2 className="font-display text-3xl">Message envoyé !</h2>
              <p className="opacity-50 text-sm">Nous vous répondrons dans les 24h.</p>
              <button onClick={() => { setSent(false); setForm({ name:'', email:'', subject:'', message:'' }); }}
                className="btn btn-ghost btn-sm uppercase tracking-widest mt-4">
                Nouveau message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                {[
                  { key:'name',  label:'Nom complet',  type:'text' },
                  { key:'email', label:'Email',         type:'email' },
                ].map(f => (
                  <fieldset key={f.key} className="fieldset">
                    <legend className="fieldset-legend text-xs uppercase tracking-widest opacity-60">{f.label}</legend>
                    <input type={f.type} className="input input-bordered w-full"
                      value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})} required/>
                  </fieldset>
                ))}
              </div>

              <fieldset className="fieldset">
                <legend className="fieldset-legend text-xs uppercase tracking-widest opacity-60">Sujet</legend>
                <select className="select select-bordered w-full"
                  value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required>
                  <option value="">Choisir un sujet...</option>
                  <option>Question sur une commande</option>
                  <option>Retour / Remboursement</option>
                  <option>Produit indisponible</option>
                  <option>Partenariat</option>
                  <option>Autre</option>
                </select>
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend text-xs uppercase tracking-widest opacity-60">Message</legend>
                <textarea className="textarea textarea-bordered w-full h-36 text-sm"
                  placeholder="Écrivez votre message ici..."
                  value={form.message} onChange={e => setForm({...form, message: e.target.value})} required/>
              </fieldset>

              <button type="submit" className={`btn btn-primary w-full uppercase tracking-widest ${loading ? 'loading' : ''}`}>
                {!loading && <><Send size={14}/> Envoyer le message</>}
              </button>
            </form>
          )}
        </div>
      </div>

      <footer className="footer footer-center bg-base-200 text-base-content p-8">
        <p className="font-display text-xl tracking-widest">MALICHOU</p>
        <p className="text-xs opacity-40 uppercase tracking-widest">© 2026 — Tous droits réservés</p>
      </footer>
    </div>
  );
}