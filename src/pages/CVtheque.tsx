import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, MapPin, User as UserIcon, Briefcase, FileText, Eye, Star } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function CVtheque() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCv, setSelectedCv] = useState<string | null>(null);

  useEffect(() => {
    let hasToken = false;
    try { hasToken = !!localStorage.getItem('token'); } catch {}
    
    if (!user && !hasToken) {
      navigate('/connexion');
      return;
    }

    if (user && user.role !== 'RECRUTEUR' && user.role !== 'ADMIN') {
      navigate('/');
      return;
    }

    const fetchCVs = async () => {
      try {
        const res = await fetch('/api/cvtheque', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) {
          throw new Error('Erreur lors de la récupération des CVs');
        }
        const data = await res.json();
        // Sort items: Premium profiles first, then by date (if available) or ID
        const sortedProfiles = data.sort((a: any, b: any) => {
          const aIsPremium = a.isPremium && new Date(a.premiumUntil) > new Date();
          const bIsPremium = b.isPremium && new Date(b.premiumUntil) > new Date();
          
          if (aIsPremium && !bIsPremium) return -1;
          if (!aIsPremium && bIsPremium) return 1;
          return b.id.localeCompare(a.id);
        });
        setProfiles(sortedProfiles);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
       fetchCVs();
    }
  }, [user, token, navigate]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#006837]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>CVthèque - Liggeybi</title>
      </Helmet>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">CVthèque Premium</h1>
          <p className="text-slate-500 mt-2 font-medium">Découvrez les meilleurs talents de notre réseau.</p>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl font-medium border border-red-100">
          {error}
        </div>
      ) : profiles.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Aucun CV disponible pour le moment</h3>
          <p className="text-slate-500 font-medium">Les CVs importés par les candidats apparaîtront ici.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {profiles.map((profile) => {
            const isPremium = profile.isPremium && new Date(profile.premiumUntil) > new Date();
            return (
            <Card key={profile.id} className={`overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-500 group rounded-[2rem] border-0 ring-1 ${isPremium ? 'ring-amber-400 bg-gradient-to-b from-amber-50/50 to-white shadow-amber-900/5' : 'ring-gray-200 bg-white shadow-gray-900/5'} shadow-xl`}>
              <CardContent className="p-0 relative">
                {isPremium && (
                  <div className="absolute -top-1 -right-1 z-20">
                     <div className="bg-gradient-to-br from-amber-400 to-amber-600 text-white text-[10px] uppercase font-black tracking-widest py-1.5 px-4 rounded-bl-2xl rounded-tr-[2rem] shadow-lg flex items-center gap-1.5">
                       <Star className="h-3 w-3 fill-white/80" /> Top CV
                     </div>
                  </div>
                )}
                
                <div className="h-48 relative overflow-hidden bg-gray-100 border-b border-gray-100">
                    {/* PDF Background icon rendering */}
                    {profile.cvUrl && (
                       <div className="absolute inset-0 flex items-center justify-center opacity-20 transform scale-150 mix-blend-multiply pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-gray-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
                       </div>
                    )}
                    <div className={`absolute inset-0 opacity-20 ${isPremium ? 'bg-gradient-to-b from-amber-400 to-transparent' : 'bg-gradient-to-b from-[#006837] to-transparent'}`} />
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center pt-4 z-10">
                       <div className={`h-20 w-20 bg-white rounded-full p-1.5 shadow-xl border-4 ${isPremium ? 'border-amber-100' : 'border-white'}`}>
                          <div className="h-full w-full bg-gray-50 rounded-full flex items-center justify-center overflow-hidden">
                              {profile.photoUrl ? (
                                <img src={profile.photoUrl} alt="Photo" className="h-full w-full object-cover" />
                              ) : (
                                <UserIcon className="h-8 w-8 text-gray-300" />
                              )}
                          </div>
                       </div>
                    </div>
                </div>
                
                <div className="pt-6 pb-8 px-6 text-center relative z-10 bg-white rounded-t-3xl -mt-6">
                  <h3 className="text-xl font-black text-gray-900 leading-tight mb-1 truncate px-2">
                    {profile.prenom || profile.nom ? `${profile.prenom || ''} ${profile.nom || ''}`.trim() : "Candidat Anonyme"}
                  </h3>
                  
                  {profile.titre ? (
                     <div className="flex items-center justify-center gap-1.5 text-[#006837] mb-4 bg-[#006837]/5 py-1.5 px-3 rounded-full inline-flex mx-auto max-w-full">
                         <Briefcase className="h-3.5 w-3.5 shrink-0" />
                         <span className="text-xs font-black uppercase tracking-wider truncate">{profile.titre}</span>
                     </div>
                  ) : (
                     <div className="h-8 mb-4"></div>
                  )}

                  <div className="flex flex-col gap-2 text-[11px] text-gray-500 font-bold mb-6">
                    {(profile.ville || profile.pays) ? (
                      <div className="flex items-center justify-center gap-1.5 bg-gray-50 py-1.5 rounded-xl">
                        <MapPin className="h-3.5 w-3.5 opacity-70 text-gray-400" />
                        <span className="truncate uppercase tracking-widest">{[profile.ville, profile.pays].filter(Boolean).join(', ')}</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5 bg-gray-50 py-1.5 rounded-xl opacity-0">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>-</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      variant="outline"
                      className="flex-1 bg-white border-2 border-gray-100 text-gray-700 hover:border-gray-900 hover:bg-gray-900 hover:text-white font-black uppercase text-[10px] tracking-widest transition-all rounded-xl h-11"
                      onClick={() => setSelectedCv(profile.cvUrl)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir le CV
                    </Button>
                    <a 
                      href={profile.cvUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-11 h-11 flex items-center justify-center bg-white border-2 border-gray-100 text-gray-600 hover:border-blue-600 hover:bg-blue-600 hover:text-white font-bold transition-all rounded-xl p-0 shrink-0"
                      title="Télécharger le PDF"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}

      {/* PDF Preview Modal */}
      <Dialog open={!!selectedCv} onOpenChange={(open) => !open && setSelectedCv(null)}>
        <DialogContent className="max-w-4xl w-full h-[90vh] p-0 overflow-hidden flex flex-col rounded-3xl">
          <DialogHeader className="p-4 border-b bg-white">
            <div className="flex items-center justify-between">
               <DialogTitle className="text-xl font-black">Aperçu du CV</DialogTitle>
               <a 
                 href={selectedCv}
                 download
                 target="_blank"
                 rel="noopener noreferrer"
                 className="flex items-center justify-center px-4 py-2 bg-[#006837] hover:bg-[#004d29] text-white font-bold rounded-xl"
               >
                 <Download className="h-4 w-4 mr-2" />
                 Télécharger le PDF
               </a>
            </div>
          </DialogHeader>
          <div className="flex-1 bg-slate-100 relative">
            {selectedCv && (
               <iframe 
                  src={`${selectedCv}#toolbar=0`}
                  className="absolute inset-0 w-full h-full border-0 bg-white"
                  title="PDF Preview"
               />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
