import { cachedFetch } from '@/lib/fetchCache';
import { Link } from 'react-router-dom';
import { Globe, MessageCircle, Share2, ShieldCheck, Zap, Award } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Footer() {
  const [siteLogo, setSiteLogo] = useState<string | null>(null);

  useEffect(() => {
    cachedFetch('/api/config/site')
      .then(res => res.json())
      .then(data => {
        if (data.logoUrl) setSiteLogo(data.logoUrl);
      })
      .catch(console.error);
  }, []);

  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-4 border-t border-gray-800">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-4">
          <Link to="/" className="text-2xl font-black tracking-tighter text-white block">
            {siteLogo ? (
              <img src={siteLogo} alt="LIGGEYBI" className="h-10 object-contain" />
            ) : (
              "LIGGEYBI"
            )}
          </Link>
          <p className="text-sm leading-relaxed">
            La première plateforme d'offres d'emploi, de bourses d'études et de concours au Sénégal. 
            Trouvez votre prochain défi professionnel dès aujourd'hui.
          </p>
          <div className="flex space-x-4">
            <Globe className="h-5 w-5 hover:text-blue-500 cursor-pointer" />
            <MessageCircle className="h-5 w-5 hover:text-green-500 cursor-pointer" />
            <Share2 className="h-5 w-5 hover:text-pink-500 cursor-pointer" />
          </div>
        </div>

        <div>
           <h3 className="text-white font-bold mb-6 text-lg">Catégories</h3>
           <ul className="space-y-3">
             <li><Link to="/offre-demploi" className="hover:text-blue-400 transition-colors">Offre d'Emploi</Link></li>
             <li><Link to="/bourses" className="hover:text-green-400 transition-colors">Bourses d'Études</Link></li>
             <li><Link to="/concours" className="hover:text-orange-400 transition-colors">Concours Nationaux</Link></li>
             <li><Link to="/formation" className="hover:text-purple-400 transition-colors">Formation</Link></li>
           </ul>
        </div>

        <div>
           <h3 className="text-white font-bold mb-6 text-lg">Liens Utiles</h3>
           <ul className="space-y-3">
             <li><Link to="/a-propos" className="hover:text-blue-400 transition-colors">À Propos</Link></li>
             <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Contact</Link></li>
             <li><Link to="/publier" className="hover:text-blue-400 transition-colors">Publier une Offre</Link></li>
             <li><Link to="/mentions-legales" className="hover:text-blue-400 transition-colors">Mentions Légales</Link></li>
           </ul>
        </div>

        <div>
           <h3 className="text-white font-bold mb-6 text-lg">Nos Engagements</h3>
           <ul className="space-y-4 text-sm text-gray-400">
             <li className="flex items-start space-x-3">
               <ShieldCheck className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
               <span>Des offres d'emploi rigoureusement vérifiées et sourcées.</span>
             </li>
             <li className="flex items-start space-x-3">
               <Zap className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
               <span>Mise à jour quotidienne pour ne rater aucune opportunité.</span>
             </li>
             <li className="flex items-start space-x-3">
               <Award className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
               <span>Un service 100% gratuit pour tous les candidats au Sénégal.</span>
             </li>
           </ul>
        </div>
      </div>
      <div className="container mx-auto mt-12 pt-8 border-t border-gray-800 text-center text-xs flex flex-col items-center justify-center space-y-2">
        {siteLogo ? (
          <img src={siteLogo} alt="LIGGEYBI" className="h-6 object-contain opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
        ) : null}
        <p>&copy; {new Date().getFullYear()} {siteLogo ? "Tous droits réservés." : "LIGGEYBI. Tous droits réservés."}</p>
      </div>
    </footer>
  );
}
