import React from 'react';
import { Helmet } from 'react-helmet-async';

export function Legal() {
  const lastUpdated = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <Helmet>
        <title>Mentions Légales — Liggeybi.com</title>
        <meta name="description" content="Découvrez les mentions légales et les conditions d'utilisation de la plateforme Liggeybi.com." />
      </Helmet>

      <div className="bg-gray-900 text-white py-20 text-center space-y-4">
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Mentions Légales</h1>
        <p className="text-gray-400 font-medium">Dernière mise à jour : {lastUpdated}</p>
      </div>

      <div className="container mx-auto px-4 -mt-10">
        <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl p-8 md:p-16 space-y-12">
          
          <Section title="1. Édition du site">
            <p>
              Le site Liggeybi.com est édité par Liggeybi, dont le siège social est situé à Dakar, Sénégal. 
              Pour toute question, vous pouvez nous contacter à l'adresse email suivante : contact@liggeybi.com.
            </p>
          </Section>

          <Section title="2. Hébergement">
            <p>
              Le site est hébergé par les services Cloud de Google, garantissant une disponibilité et une sécurité optimale pour nos utilisateurs à travers le Sénégal et l'Afrique.
            </p>
          </Section>

          <Section title="3. Propriété intellectuelle">
            <p>
              L'ensemble du contenu (textes, logos, images, icônes) est la propriété exclusive de Liggeybi.com, sauf mention contraire relative aux offres de tiers. Toute reproduction, même partielle, est strictement interdite sans autorisation préalable.
            </p>
          </Section>

          <Section title="4. Données Personnelles">
            <p>
              Conformément à la législation en vigueur sur la protection des données personnelles, vous disposez d'un droit d'accès, de rectification et de suppression des données vous concernant. Les informations collectées lors de la création d'un compte sont destinées exclusivement à l'usage de la plateforme pour faciliter vos recherches d'emploi ou le recrutement.
            </p>
          </Section>

          <Section title="5. Responsabilité">
            <p>
              Liggeybi.com s'efforce de fournir des informations précises. Toutefois, nous ne saurions être tenus responsables de l'exactitude des offres postées par les recruteurs tiers ou des éventuelles erreurs dans les annonces de concours et bourses. Les utilisateurs sont invités à vérifier la véracité des informations auprès des institutions concernées.
            </p>
          </Section>

          <Section title="6. Cookies">
            <p>
              Le site utilise des cookies pour améliorer l'expérience utilisateur, notamment pour mémoriser vos préférences de navigation et analyser le trafic via Google Analytics. Vous pouvez désactiver les cookies dans les paramètres de votre navigateur.
            </p>
          </Section>

        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight pb-2 border-b border-gray-50">{title}</h2>
      <div className="text-gray-600 leading-relaxed font-medium">
        {children}
      </div>
    </section>
  );
}
