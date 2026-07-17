import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <Helmet>
        <title>Contactez-nous — Liggeybi.com Support</title>
        <meta name="description" content="Une question, une suggestion ou besoin d'aide ? Contactez l'équipe de Liggeybi.com." />
      </Helmet>

      <div className="bg-[#ED1C24] text-white py-20">
        <div className="container mx-auto px-4 text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Contactez-nous</h1>
          <p className="text-white/80 font-medium max-w-xl mx-auto">
            Nous sommes là pour vous aider. Notre équipe vous répondra dans les plus brefs délais.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-8">
              <h2 className="text-xl font-black text-gray-900 uppercase">Nos Coordonnées</h2>
              
              <div className="space-y-6">
                <ContactInfo 
                  icon={<Mail className="h-5 w-5 text-[#ED1C24]" />}
                  label="Email"
                  value="contact@liggeybi.com"
                />
                <ContactInfo 
                  icon={<MapPin className="h-5 w-5 text-[#ED1C24]" />}
                  label="Adresse"
                  value="Dakar, Sénégal"
                />
              </div>

              <div className="pt-6 border-t border-gray-50">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Réseaux Sociaux</h3>
                <div className="flex space-x-4">
                  <SocialButton color="bg-blue-600" label="FB" />
                  <SocialButton color="bg-blue-400" label="TW" />
                  <SocialButton color="bg-pink-600" label="IG" />
                  <SocialButton color="bg-red-600" label="YT" />
                </div>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-xl">
              {submitted ? (
                <div className="text-center py-20 space-y-6">
                  <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <Send className="h-10 w-10" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 uppercase">Message Envoyé !</h2>
                  <p className="text-gray-500 font-medium max-w-sm mx-auto">Merci de nous avoir contactés. Nous reviendrons vers vous d'ici 24 à 48 heures.</p>
                  <Button variant="outline" onClick={() => setSubmitted(false)} className="rounded-xl font-bold uppercase tracking-widest text-[10px]">Envoyer un autre message</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nom Complet</label>
                      <Input placeholder="Votre nom" className="h-12 rounded-xl bg-gray-50 border-none px-4" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email</label>
                      <Input type="email" placeholder="votre@email.com" className="h-12 rounded-xl bg-gray-50 border-none px-4" required />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sujet</label>
                    <Input placeholder="Comment pouvons-nous vous aider ?" className="h-12 rounded-xl bg-gray-50 border-none px-4" required />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Message</label>
                    <Textarea placeholder="Écrivez votre message ici..." className="min-h-[150px] rounded-2xl bg-gray-50 border-none p-4" required />
                  </div>

                  <Button type="submit" className="w-full h-14 bg-[#ED1C24] hover:bg-[#c4161b] text-white font-black text-lg rounded-2xl shadow-xl transition-transform hover:scale-[1.01]">
                    Envoyer <Send className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactInfo({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-start space-x-4">
      <div className="bg-gray-50 p-3 rounded-xl">{icon}</div>
      <div>
        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{label}</p>
        <p className="text-gray-900 font-bold">{value}</p>
      </div>
    </div>
  );
}

function SocialButton({ color, label }: { color: string, label: string }) {
  return (
    <div className={`${color} w-10 h-10 rounded-xl flex items-center justify-center text-white text-[10px] font-black cursor-pointer hover:opacity-80 transition-opacity`}>
      {label}
    </div>
  );
}
