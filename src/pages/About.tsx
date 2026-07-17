import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Target, Users, BookOpen, ShieldCheck } from 'lucide-react';

export function About() {
  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <Helmet>
        <title>À Propos de Liggeybi.com — Votre Partenaire Emploi au Sénégal</title>
        <meta name="description" content="Découvrez l'histoire et la mission de Liggeybi, la première plateforme d'offres d'emploi, bourses et concours au Sénégal." />
      </Helmet>

      {/* Hero Section */}
      <div className="bg-[#006837] text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:40px_40px]" />
        <div className="container mx-auto px-4 relative z-10 text-center space-y-6">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Notre Mission</h1>
          <p className="max-w-2xl mx-auto text-lg text-white/80 font-medium">
            Connecter les talents sénégalais aux meilleures opportunités professionnelles, académiques et nationales.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card 
            icon={<Target className="h-8 w-8 text-[#F7BE16]" />}
            title="Vision"
            description="Devenir la référence incontournable pour l'insertion professionnelle et la réussite des étudiants au Sénégal."
          />
          <Card 
            icon={<Users className="h-8 w-8 text-[#F7BE16]" />}
            title="Communauté"
            description="Établir un pont solide entre les recruteurs, les institutions et les chercheurs d'opportunités."
          />
          <Card 
            icon={<ShieldCheck className="h-8 w-8 text-[#F7BE16]" />}
            title="Fiabilité"
            description="Vérifier et certifier chaque annonce pour garantir des opportunités réelles et sérieuses."
          />
        </div>

        <div className="mt-20 max-w-4xl mx-auto space-y-12">
          <section className="space-y-6">
            <h2 className="text-3xl font-black text-gray-900 uppercase">Qui sommes-nous ?</h2>
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-gray-100 shadow-xl space-y-6 leading-relaxed text-gray-600 font-medium">
              <p>
                Liggeybi.com est né d'un constat simple : la difficulté pour les jeunes diplômés et les professionnels sénégalais d'accéder à l'information en temps utile. Qu'il s'agisse d'un premier emploi, d'une bourse d'études à l'étranger ou d'un concours de la fonction publique, l'information est souvent dispersée.
              </p>
              <p>
                Notre plateforme centralise l'ensemble de ces opportunités en un seul lieu, optimisé pour une consultation rapide et efficace sur tous les supports (mobile, desktop, et même via les réseaux sociaux).
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-3xl font-black text-gray-900 uppercase">Pourquoi nous faire confiance ?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-100/50 p-8 rounded-3xl border border-gray-100">
                <h3 className="text-xl font-black text-[#006837] mb-3">Mise à jour quotidienne</h3>
                <p className="text-gray-600 text-sm font-medium">Nos équipes veillent chaque jour à ce que les dernières offres soient publiées en temps réel.</p>
              </div>
              <div className="bg-gray-100/50 p-8 rounded-3xl border border-gray-100">
                <h3 className="text-xl font-black text-[#006837] mb-3">Service gratuit</h3>
                <p className="text-gray-600 text-sm font-medium">L'accès aux offres et aux candidatures reste totalement gratuit pour tous les candidats.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Card({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-2xl space-y-4 hover:scale-[1.02] transition-transform">
      {icon}
      <h3 className="text-xl font-black text-gray-900 uppercase">{title}</h3>
      <p className="text-gray-600 text-sm font-medium leading-relaxed">{description}</p>
    </div>
  );
}
