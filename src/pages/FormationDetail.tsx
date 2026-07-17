import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PlayCircle, CheckCircle, Award } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AdBanner } from '@/components/ads/AdBanner';
import { renderMarkdown } from '@/lib/markdown';
import { SafeHtml } from '@/components/SafeHtml';

export default function FormationDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formation, setFormation] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/formations/${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(async (data) => {
        if (!data) {
           navigate('/formations');
           return;
        }
        setFormation(data);
        if (data.id) {
           fetch(`/api/formations/${data.id}/leaderboard`)
            .then(r => r.json())
            .then(setLeaderboard)
            .catch(console.error);
        }
        if (user) {
          const res = await fetch('/api/my-formations', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
          if(res.ok) {
             const enacts = await res.json();
             if (enacts.some((e:any) => e.formationId === data.id)) setIsEnrolled(true);
          }
        }
        setLoading(false);
      });
  }, [slug, user, navigate]);

  const handleEnroll = async () => {
    if (!user) {
      navigate('/connexion?message=' + encodeURIComponent("Veuillez vous connecter pour vous inscrire à cette formation."));
      return;
    }
    
    try {
      const res = await fetch(`/api/formations/${formation.id}/enroll`, {
         method: 'POST',
         headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
         const data = await res.json();
         if (data.redirectUrl) {
            window.location.href = data.redirectUrl;
            return;
         }
         setIsEnrolled(true);
         navigate(`/formations/${slug}/learn`);
      }
    } catch(e) { console.error(e); }
  };

  if (loading) return <div className="p-12 text-center">Chargement...</div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-16 grid md:grid-cols-2 gap-12 items-center">
          <div className="min-w-0">
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">{formation.titre}</h1>
            {formation.description && (
              <SafeHtml 
                className="text-lg text-gray-600 mb-8 prose max-w-none line-clamp-3" 
                html={formation.description} 
              />
            )}
            <div className="flex flex-wrap items-center gap-4">
              {isEnrolled ? (
                <Link to={`/formations/${slug}/learn`} className="w-full sm:w-auto text-center bg-primary hover:bg-green-700 text-white px-4 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-colors shadow-lg shadow-green-500/30">
                  Reprendre la lecture
                </Link>
              ) : (
                <button onClick={handleEnroll} className="w-full sm:w-auto bg-primary hover:bg-green-700 text-white px-4 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-colors shadow-lg shadow-green-500/30">
                  {formation.prix === 0 ? "Commencer Gratuitement" : 
                    formation.prixPromo ? (
                      <span className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                        <span className="line-through text-green-200 text-sm">{formation.prix} FCFA</span>
                        <span>Acheter pour {formation.prixPromo} FCFA</span>
                      </span>
                    ) : `Acheter pour ${formation.prix} FCFA`
                  }
                </button>
              )}
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black aspect-video flex items-center justify-center group">
             {formation.videoUrl ? (
                formation.videoUrl.includes('youtube.com') || formation.videoUrl.includes('youtu.be') ? (
                  <div className="w-full h-full relative">
                    <iframe 
                       src={`${formation.videoUrl.replace('watch?v=', 'embed/').split('&')[0].replace('youtu.be/', 'youtube.com/embed/')}?modestbranding=1&rel=0&controls=1&showinfo=0`} 
                       className="w-full h-full absolute inset-0"
                       allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                       allowFullScreen
                    ></iframe>
                    {/* Hack : block clicks on top bar (title, share) and youtube logo bottom right */}
                    <div className="absolute top-0 left-0 right-0 h-16 bg-transparent z-10"></div>
                    <div className="absolute bottom-0 right-0 w-20 h-12 bg-transparent z-10"></div>
                  </div>
                ) : (
                  <video src={formation.videoUrl} controls className="w-full h-full object-cover" poster={formation.imageUrl} />
                )
             ) : (
                formation.imageUrl ? (
                   <img src={formation.imageUrl} alt="Cover" className="w-full h-full object-contain bg-gray-900" />
                ) : (
                   <span className="text-gray-400">Aucune présentation</span>
                )
             )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-12 min-w-0">
        <div className="md:col-span-2 space-y-8 min-w-0">
           <AdBanner slot="7547413607" />
           
           {formation.description && (
             <div className="bg-white rounded-2xl p-4 sm:p-8 border shadow-sm border-gray-100 overflow-hidden">
               <h2 className="text-xl sm:text-2xl font-bold mb-6">À propos de cette formation</h2>
               <SafeHtml 
                 className="text-gray-600 prose sm:prose-lg max-w-none min-w-0" 
                 html={formation.description} 
               />
             </div>
           )}

           <div className="bg-white rounded-2xl p-4 sm:p-8 border shadow-sm border-gray-100 overflow-hidden">
             <h2 className="text-xl sm:text-2xl font-bold mb-6 flex flex-wrap items-center gap-2"><PlayCircle className="text-primary shrink-0"/> Programme de la formation</h2>
             <div className="space-y-4">
               {formation.chapitres?.map((chap: any, i: number) => (
                  <div key={chap.id} className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white transition-colors">
                     <div className="w-10 h-10 shrink-0 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">
                        {i + 1}
                     </div>
                     <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-lg truncate">{chap.titre}</h4>
                     </div>
                  </div>
               ))}
               {formation.chapitres?.length === 0 && <p className="text-gray-500">Aucun chapitre pour le moment.</p>}
             </div>
           </div>
        </div>
        <div className="space-y-6">
           <div className="bg-white rounded-2xl p-4 sm:p-6 border shadow-sm border-gray-100 overflow-hidden">
             <h3 className="font-bold text-gray-900 mb-4 text-lg">Inclus dans ce cours</h3>
             <ul className="space-y-3">
               <li className="flex items-center gap-3 text-gray-600"><PlayCircle size={18} className="text-primary"/> {formation.chapitres?.length} chapitres détaillés</li>
               <li className="flex items-center gap-3 text-gray-600"><Award size={18} className="text-primary"/> Certificat de complétion</li>
               <li className="flex items-center gap-3 text-gray-600"><CheckCircle size={18} className="text-primary"/> Accès à vie</li>
             </ul>
           </div>
           {leaderboard.length > 0 && (
              <div className="bg-white rounded-2xl p-4 sm:p-6 border shadow-sm border-gray-100 mt-6 overflow-hidden">
                <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2"><Award className="text-yellow-500 shrink-0" size={24} /> Classement Quiz</h3>
                <div className="space-y-3">
                  {leaderboard.map((u: any, i: number) => (
                     <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                           <span className="font-black text-gray-400 w-4">{i + 1}.</span>
                           <span className="font-bold text-gray-900 flex-1 truncate max-w-[150px]">{u.nom}</span>
                        </div>
                        <span className="font-black text-primary">{u.score}%</span>
                     </div>
                  ))}
                </div>
              </div>
           )}
           <AdBanner slot="2905716196" format="rectangle" />
        </div>
      </div>
    </div>
  );
}