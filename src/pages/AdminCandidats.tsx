import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, Search, Trash2, Shield, Eye, Download, Star } from 'lucide-react';

export function AdminCandidats() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  useEffect(() => {
    let hasToken = false;
    try { hasToken = !!localStorage.getItem('token'); } catch {}
    if (!user && !hasToken) {
      navigate('/connexion');
    } else if (user && user.role !== 'ADMIN') {
      navigate('/');
    } else {
      fetchCandidates();
    }
  }, [user, navigate]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Filter to only CANDIDAT role who have a CV (or just CANDIDAT)
        // The user says "les candidat qui ont importer leur cv"
        const filtered = data.filter((u: any) => u.role === 'CANDIDAT' && u.profile && u.profile.cvUrl);
        setCandidates(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCvPremium = async (id: string, isCurrentlyPremium: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${id}/premium`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
           isPremium: !isCurrentlyPremium,
           // if promoting, auto-set to 30 days. If removing, set null
           premiumUntil: !isCurrentlyPremium ? new Date(Date.now() + 30*24*60*60*1000).toISOString() : null
        })
      });
      if (res.ok) {
        fetchCandidates();
      } else {
        alert("Erreur lors de la mise à jour");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur serveur");
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cet utilisateur ? Cette action est irréversible.")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setCandidates(candidates.filter(c => c.id !== id));
        setSelectedCandidates(p => p.filter(x => x !== id));
      } else {
        alert("Erreur lors de la suppression");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur serveur");
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedCandidates(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedCandidates(filteredCandidates.slice((page - 1) * PER_PAGE, page * PER_PAGE).map(c => c.id));
    } else {
      setSelectedCandidates([]);
    }
  };

  const bulkDelete = async () => {
    if (!confirm(`Supprimer ${selectedCandidates.length} candidat(s) ?`)) return;
    for (const id of selectedCandidates) {
       try {
         await fetch(`/api/admin/users/${id}`, {
           method: 'DELETE',
           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
         });
       } catch (err) {
         console.error(err);
       }
    }
    setSelectedCandidates([]);
    fetchCandidates();
  };

  const filteredCandidates = candidates.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.profile?.titreProf?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <Helmet>
         <title>Gestion des CVs Candidats | Admin</title>
      </Helmet>

      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-lg border border-white/10">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Gestion des CVs</h1>
                <p className="text-gray-400 mt-1 font-medium">Gérez et promouvez les candidats dans la CVthèque</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button onClick={() => navigate('/admin')} variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 rounded-xl font-bold">
                Retour au Tableau de bord
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
         <Card className="rounded-[2.5rem] border-gray-100 shadow-xl overflow-hidden bg-white/50 backdrop-blur-xl">
           <CardHeader className="bg-white border-b border-gray-100 px-8 py-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                 <div>
                    <CardTitle className="text-xl font-black text-gray-900">Base de Candidats ({filteredCandidates.length})</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">Candidats ayant importé leur CV</p>
                 </div>
                 
                 <div className="relative w-full md:w-96">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                   <Input 
                     placeholder="Rechercher par nom, email, titre..." 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="pl-10 h-12 bg-gray-50 border-gray-200 rounded-xl w-full"
                   />
                 </div>
              </div>
           </CardHeader>
           
           <CardContent className="p-0">
              {selectedCandidates.length > 0 && (
                <div className="bg-red-50 border-b border-red-100 px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <span className="text-sm font-black text-red-900 flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5" /> {selectedCandidates.length} candidat(s) sélectionné(s)
                  </span>
                  <div className="flex gap-2">
                    <Button onClick={bulkDelete} size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-[10px] rounded-xl px-4 py-2 h-auto shadow-sm">
                      Supprimer la sélection
                    </Button>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="p-12 text-center text-gray-500 font-medium">Chargement des candidats...</div>
              ) : filteredCandidates.length === 0 ? (
                <div className="p-12 text-center text-gray-500 font-medium">Aucun candidat trouvé avec CV importé.</div>
              ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                             <th className="p-6 w-16">
                               <input type="checkbox" onChange={selectAll} checked={selectedCandidates.length > 0 && selectedCandidates.length === Math.min(filteredCandidates.length - (page - 1) * PER_PAGE, PER_PAGE)} className="w-5 h-5 rounded-md border-gray-300 text-red-600 focus:ring-red-600 cursor-pointer" />
                             </th>
                             <th className="p-6 font-black uppercase tracking-wider text-[10px] text-gray-400">Candidat</th>
                             <th className="p-6 font-black uppercase tracking-wider text-[10px] text-gray-400">Profil</th>
                             <th className="p-6 font-black uppercase tracking-wider text-[10px] text-gray-400">Statut Promo</th>
                             <th className="p-6 font-black uppercase tracking-wider text-[10px] text-gray-400 text-right">Actions</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50 bg-white">
                          {filteredCandidates.slice((page - 1) * PER_PAGE, page * PER_PAGE).map((c, i) => (
                             <tr key={c.id} className={`transition-colors ${selectedCandidates.includes(c.id) ? 'bg-red-50/20' : 'hover:bg-gray-50/50'}`}>
                                <td className="p-6">
                                  <input type="checkbox" checked={selectedCandidates.includes(c.id)} onChange={() => toggleSelection(c.id)} className="w-5 h-5 rounded-md border-gray-300 text-red-600 focus:ring-red-600 cursor-pointer" />
                                </td>
                                <td className="p-6">
                                   <div className="font-bold text-gray-900 flex items-center gap-2">
                                     {c.name}
                                     {c.profile?.isPremium && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                                   </div>
                                   <div className="text-sm text-gray-500">{c.email}</div>
                                </td>
                                <td className="p-6">
                                   <div className="font-medium text-gray-900">{c.profile?.titreProf || 'Non défini'}</div>
                                   <div className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                                      <a href={c.profile?.cvUrl} target="_blank" rel="noreferrer" className="flex items-center text-blue-600 hover:text-blue-700 font-medium">
                                        <Eye className="w-3 h-3 mr-1" /> Voir le CV
                                      </a>
                                      {c.profile?.cvUrl && (
                                        <a href={c.profile.cvUrl} download className="flex items-center text-gray-500 hover:text-gray-700 font-medium">
                                          <Download className="w-3 h-3 mr-1" /> PDF
                                        </a>
                                      )}
                                   </div>
                                </td>
                                <td className="p-6">
                                   {c.profile?.isPremium ? (
                                      <div className="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase border border-amber-200">
                                         CV Promu
                                      </div>
                                   ) : (
                                      <div className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-black uppercase border border-gray-200">
                                         Standard
                                      </div>
                                   )}
                                </td>
                                <td className="p-6 text-right space-x-2">
                                   <Button 
                                     onClick={() => toggleCvPremium(c.id, c.profile?.isPremium || false)} 
                                     size="sm" 
                                     className={`${c.profile?.isPremium ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'} font-bold text-xs rounded-xl px-4`}
                                   >
                                     {c.profile?.isPremium ? 'Mettre en pause' : 'Promouvoir le CV'}
                                   </Button>
                                   <Button onClick={() => deleteUser(c.id)} variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 rounded-xl w-10 p-0 text-center inline-flex items-center justify-center">
                                     <Trash2 className="w-4 h-4" />
                                   </Button>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                </div>
              )}
           </CardContent>
         </Card>

         {filteredCandidates.length > PER_PAGE && (
           <div className="flex items-center justify-center space-x-4 mt-8 pb-8">
             <Button 
               variant="outline" 
               onClick={() => setPage(p => Math.max(1, p - 1))}
               disabled={page === 1}
               className="rounded-xl font-bold uppercase text-xs border-gray-200 bg-white"
             >
               Précédent
             </Button>
             <span className="text-sm font-bold text-gray-500">
               Page {page} sur {Math.ceil(filteredCandidates.length / PER_PAGE)}
             </span>
             <Button 
               variant="outline" 
               onClick={() => setPage(p => Math.min(Math.ceil(filteredCandidates.length / PER_PAGE), p + 1))}
               disabled={page === Math.ceil(filteredCandidates.length / PER_PAGE)}
               className="rounded-xl font-bold uppercase text-xs border-gray-200 bg-white"
             >
               Suivant
             </Button>
           </div>
         )}
      </div>
    </div>
  );
}
