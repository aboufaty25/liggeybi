import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Briefcase, Send, Plus, List as ListIcon, Clock, CheckCircle, Wallet, Users, LayoutDashboard, User, Coins, Trash2, Zap, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const HIGH_CPC_TITLES = [
  "Directeur Administratif et Financier (DAF)",
  "Chef de Projet Informatique Senior",
  "Expert Comptable / Auditeur Interne",
  "Ingénieur DevOps / Cloud (Remote)",
  "Consultant Expert en Stratégie d'Entreprise"
];

export function RecruiterDashboard() {
  const { token, user, refreshUser } = useAuth();
  const [offres, setOffres] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [visibilite, setVisibilite] = useState<'standard' | 'urgent' | 'premium'>('standard');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const defaultExpiration = new Date();
  defaultExpiration.setDate(defaultExpiration.getDate() + 30);
  const defaultDateStr = defaultExpiration.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    titre: '',
    categorie: 'offre-demploi',
    description: '',
    lieu: '',
    modeTravail: 'Sur site',
    salaire: '',
    experience: '',
    niveauEtude: '',
    typeContrat: 'CDI',
    modeCandidature: 'interne',
    emailContact: '',
    lienExterne: '',
    dateExpiration: defaultDateStr,
    logoUrl: '',
    imageUrl: '',
    tags: '',
    seoDescription: ''
  });
  const [candidatures, setCandidatures] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(user?.profile || {});
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('offres');
  const [selectedCv, setSelectedCv] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionToken = urlParams.get("sessionToken");
    
    if (sessionToken) {
      try {
        localStorage.setItem("token", sessionToken);
        window.location.href = window.location.pathname + "?success=true";
        return;
      } catch {}
    }

    let hasToken = false;
    try { hasToken = !!localStorage.getItem('token'); } catch {}
    if (!user && !hasToken) {
      navigate('/connexion');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchOffres = async () => {
      try {
        const res = await fetch('/api/my-offres', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOffres(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    const fetchCandidatures = async () => {
      try {
        const res = await fetch('/api/recruiter/candidatures', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCandidatures(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    const fetchProfile = async () => {
      try {
         const res = await fetch('/api/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
         });
         if (res.ok) setProfile(await res.json());
      } catch (err) {
         console.error(err);
      }
    };
    const fetchPackages = async () => {
      try {
        const res = await fetch('/api/public/job-packages');
        if (res.ok) {
          const data = await res.json();
          setPackages(data);
          if (data.length > 0) {
             const freePkg = data.find((p: any) => p.prix === 0);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (token) {
      refreshUser?.();
      fetchOffres();
      fetchCandidatures();
      fetchProfile();
      fetchPackages();
    }
  }, [token]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'imageUrl') => {
    let file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("L'image est trop grande (maximum 5MB).");
        e.target.value = '';
        return;
      }
      
      try {
        const { default: imageCompression } = await import('browser-image-compression');
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1200,
          useWebWorker: true
        };
        file = await imageCompression(file, options);
      } catch (error) {
        console.error("Compression failed", error);
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
          const res = await fetch('/api/upload-image', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ fileName: file!.name, fileData: base64 })
          });
          if (res.ok) {
             const data = await res.json();
             setFormData(prev => ({ ...prev, [field]: data.url }));
          } else {
             alert("Erreur lors de l'upload de l'image.");
          }
        } catch (err) {
          console.error(err);
          alert("Erreur réseau.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profile)
      });
      if (res.ok) alert("Profil mis à jour !");
    } catch (err) {
      console.error(err);
    }
  };

  const handleBuyCredits = async (packageId: string) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/buy-credits', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ packageId })
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else if (data.redirectUrl && data.redirectUrl.startsWith('http')) {
        window.location.href = data.redirectUrl;
      } else {
        alert("Crédits ajoutés avec succès !");
        refreshUser?.();
      }
    } catch (error) {
      alert("Erreur lors de l'achat.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check credits before submission
    const requiredCredits = visibilite === 'premium' ? 3 : (visibilite === 'urgent' ? 2 : 0);
    if (!editingId && (user?.credits || 0) < requiredCredits) {
      alert("Vous n'avez pas assez de crédits pour publier cette offre. Veuillez recharger votre solde.");
      setActiveTab('credits');
      return;
    }

    setIsLoading(true);
    try {
      const payload: any = { ...formData };
      if (!payload.dateExpiration) {
        payload.dateExpiration = null;
      } else {
        payload.dateExpiration = new Date(payload.dateExpiration).toISOString();
      }
      
      if (!editingId) {
        payload.visibilite = visibilite;
      }

      // Fallback image si vide
      if (!payload.imageUrl || payload.imageUrl.trim() === '') {
        const defaultImages: Record<string, string> = {
          'offre-demploi': 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1200',
          'bourses': 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1200',
          'concours': 'https://images.unsplash.com/photo-1573165231977-3e057cc8eaa2?auto=format&fit=crop&q=80&w=1200',
          'formation': 'https://images.unsplash.com/photo-1531123414708-f52f3856dc94?auto=format&fit=crop&q=80&w=1200'
        };
        payload.imageUrl = defaultImages[payload.categorie] || defaultImages['offre-demploi'];
      }
      
      const url = editingId ? `/api/offres/${editingId}` : '/api/offres';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setShowForm(false);
        setEditingId(null);
        setFormData({ titre: '', categorie: 'offre-demploi', description: '', lieu: '', modeTravail: 'Sur site', salaire: '', experience: '', niveauEtude: '', typeContrat: 'CDI', modeCandidature: 'interne', emailContact: '', lienExterne: '', dateExpiration: '', logoUrl: '', imageUrl: '', tags: '', seoDescription: '' });
        // Refresh offres
        refreshUser?.();
        const resOffres = await fetch('/api/my-offres', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resOffres.ok) {
          const data = await resOffres.json();
          setOffres(data);
        }
      } else {
         const err = await res.json();
         alert(err.error || "Erreur.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.role !== 'RECRUTEUR') return <div className="p-20 text-center font-bold">Accès réservé aux recruteurs.</div>;

  return (
    <div className="container mx-auto px-4 py-12 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter flex items-center">
             <LayoutDashboard className="mr-3 h-8 w-8 text-blue-700" /> Espace Recruteur
           </h1>
           <p className="text-gray-500 font-medium mt-1">Gérez vos annonces et candidatures, ou achetez des crédits.</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4">
           <div className="bg-white px-6 py-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
             <Coins className="h-6 w-6 text-yellow-500" />
             <div>
                <div className="text-[10px] font-black uppercase text-gray-400 leading-none">Solde Actuel</div>
                <div className="text-xl font-black text-gray-900 leading-none">{user?.credits || 0} Crédits</div>
             </div>
           </div>
          <Button onClick={() => { setShowForm(!showForm); setEditingId(null); }} className="bg-blue-700 hover:bg-blue-800 h-14 px-8 rounded-2xl font-black uppercase">
            {showForm ? 'Annuler' : <><Plus className="mr-2 h-5 w-5" /> Publier une annonce</>}
          </Button>
        </div>
      </div>

       {/* Quick Stats Overviews */}
       <div className="grid md:grid-cols-4 gap-4">
           <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                 <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Offres</div>
                 <div className="text-3xl font-black text-gray-900">{offres.length}</div>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                 <Briefcase className="h-6 w-6" />
              </div>
           </div>
           <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                 <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Candidatures</div>
                 <div className="text-3xl font-black text-gray-900">{candidatures.length}</div>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
                 <Users className="h-6 w-6" />
              </div>
           </div>
           <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                 <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Offres Premium</div>
                 <div className="text-3xl font-black text-gray-900">{offres.filter(o => o.visibilite === 'premium').length}</div>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                 <Zap className="h-6 w-6" />
              </div>
           </div>
           <div className="bg-gradient-to-br from-yellow-500 to-amber-600 p-6 rounded-3xl shadow-sm flex items-center justify-between text-white shadow-xl shadow-yellow-500/20">
              <div>
                 <div className="text-[10px] font-black uppercase tracking-widest text-yellow-100 mb-1">Solde Crédits</div>
                 <div className="text-3xl font-black">{user?.credits || 0}</div>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                 <Wallet className="h-6 w-6" />
              </div>
           </div>
       </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="rounded-[2.5rem] border-blue-100 shadow-2xl shadow-blue-900/5 p-4 mb-8">
              <CardHeader>
                <CardTitle className="text-2xl font-black uppercase tracking-tight">Nouvelle Annonce</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Titre de l'Offre</Label>
                    <Input required value={formData.titre} onChange={e => setFormData({...formData, titre: e.target.value})} placeholder="Ex: Développeur React Senior" className="h-12 rounded-xl bg-gray-50 border-none px-4" />
                    {formData.categorie === 'offre-demploi' && (
                      <div className="pt-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-2">💡 Suggestions de titres optimisés (Filières à haute valeur) :</p>
                        <div className="flex flex-wrap gap-2">
                          {HIGH_CPC_TITLES.map((title, idx) => (
                            <button 
                              key={idx} 
                              type="button" 
                              onClick={() => setFormData({...formData, titre: title})}
                              className="text-xs font-bold px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100"
                            >
                              {title}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Catégorie</Label>
                    <select 
                      value={formData.categorie} 
                      onChange={e => setFormData({...formData, categorie: e.target.value})}
                      className="w-full h-12 rounded-xl bg-gray-50 border-none px-4 text-sm font-bold focus:ring-2 focus:ring-blue-600 outline-none"
                    >
                      <option value="offre-demploi">Offre d'emploi</option>
                      <option value="bourses">Bourse d'études</option>
                      <option value="concours">Concours</option>
                      <option value="formation">Formation</option>
                      <option value="stage">Stage</option>
                      <option value="candidature-spontanee">Candidature spontanée</option>
                      <option value="finance-business">Finance & Business</option>
                      <option value="emploi-international">Emploi international</option>
                      <option value="appels-doffres">Appels d'offres</option>
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Logo de l'Entreprise</Label>
                    <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'logoUrl')} className="h-12 rounded-xl bg-gray-50 border-none px-4 py-3" />
                    {formData.logoUrl && <img src={formData.logoUrl} className="h-12 mt-2 object-contain bg-white p-1 rounded" alt="Preview" />}
                    {Array.from(new Set(offres.map(o => o.logoUrl).filter(Boolean))).length > 0 && (
                      <div className="mt-2">
                        <Label className="text-[10px] text-gray-400 uppercase font-bold mb-1">Historique :</Label>
                        <div className="flex gap-2 flex-wrap">
                          {Array.from(new Set(offres.map(o => o.logoUrl).filter(Boolean))).slice(0, 8).map((url, idx) => (
                             <img 
                               key={idx} 
                               src={url as string} 
                               onClick={() => setFormData({...formData, logoUrl: url as string})} 
                               className={`h-10 w-10 object-contain bg-white cursor-pointer border-2 p-1 rounded-lg ${formData.logoUrl === url ? 'border-[#006837]' : 'border-gray-200 hover:border-gray-300'}`} 
                               alt="Previous logo"
                             />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Image de Couverture</Label>
                    <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'imageUrl')} className="h-12 rounded-xl bg-gray-50 border-none px-4 py-3" />
                    {formData.imageUrl && <img src={formData.imageUrl} className="h-20 mt-2 object-cover rounded" alt="Preview" />}
                    {Array.from(new Set(offres.map(o => o.imageUrl).filter(Boolean))).length > 0 && (
                      <div className="mt-2">
                        <Label className="text-[10px] text-gray-400 uppercase font-bold mb-1">Historique :</Label>
                        <div className="flex gap-2 flex-wrap">
                          {Array.from(new Set(offres.map(o => o.imageUrl).filter(Boolean))).slice(0, 8).map((url, idx) => (
                             <img 
                               key={idx} 
                               src={url as string} 
                               onClick={() => setFormData({...formData, imageUrl: url as string})} 
                               className={`h-12 w-20 object-cover cursor-pointer border-2 rounded-lg ${formData.imageUrl === url ? 'border-[#006837]' : 'border-gray-200 hover:border-gray-300'}`} 
                               alt="Previous cover"
                             />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Tags / Mots-clés (séparés par des virgules)</Label>
                    <Input value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} placeholder="Ex: Informatique, Full Remote, React" className="h-12 rounded-xl bg-gray-50 border-none px-4" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Description SEO (Méta description)</Label>
                    <Textarea value={formData.seoDescription} onChange={e => setFormData({...formData, seoDescription: e.target.value})} placeholder="Ex: Devenez notre prochain développeur React..." className="h-20 rounded-xl bg-gray-50 border-none px-4 py-3 resize-none" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Description détaillée</Label>
                    <RichTextEditor value={formData.description} onChange={(val) => setFormData({...formData, description: val})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Lieu</Label>
                    <select required value={formData.lieu} onChange={e => setFormData({...formData, lieu: e.target.value})} className="flex h-12 w-full items-center justify-between rounded-xl bg-gray-50 px-4 py-2 border-none ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 text-sm">
                      <option value="">Sélectionnez un lieu</option>
                      {[
                        "Dakar", "Diourbel", "Fatick", "Kaffrine", "Kaolack", "Kédougou", 
                        "Kolda", "Louga", "Matam", "Saint-Louis", "Sédhiou", "Tambacounda", 
                        "Thiès", "Ziguinchor", "International", "Télétravail", "Toute la ligne"
                      ].map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Salaire</Label>
                    <Input value={formData.salaire} onChange={e => setFormData({...formData, salaire: e.target.value})} placeholder="Ex: 500 000 FCFA ou À débattre" className="h-12 rounded-xl bg-gray-50 border-none px-4" />
                  </div>
                  {formData.categorie === 'offre-demploi' && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Expérience</Label>
                        <Input value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} placeholder="Ex: 2 ans" className="h-12 rounded-xl bg-gray-50 border-none px-4" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Niveau d'étude</Label>
                        <Input value={formData.niveauEtude} onChange={e => setFormData({...formData, niveauEtude: e.target.value})} placeholder="Ex: Bac+3" className="h-12 rounded-xl bg-gray-50 border-none px-4" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Type de Contrat</Label>
                        <select 
                          value={formData.typeContrat} 
                          onChange={e => setFormData({...formData, typeContrat: e.target.value})}
                          className="w-full h-12 rounded-xl bg-gray-50 border-none px-4 text-sm font-bold outline-none"
                        >
                          <option>CDI</option>
                          <option>CDD</option>
                          <option>Stage</option>
                          <option>Freelance</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Mode de travail (Google Jobs)</Label>
                        <select 
                          value={formData.modeTravail} 
                          onChange={e => setFormData({...formData, modeTravail: e.target.value})}
                          className="w-full h-12 rounded-xl bg-gray-50 border-none px-4 text-sm font-bold outline-none"
                        >
                          <option value="Sur site">Sur site</option>
                          <option value="À distance">À distance (Télétravail)</option>
                          <option value="Hybride">Hybride</option>
                        </select>
                      </div>
                    </>
                  )}
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Date limite *</Label>
                    <Input required type="date" value={formData.dateExpiration} onChange={e => setFormData({...formData, dateExpiration: e.target.value})} className="h-12 rounded-xl bg-gray-50 border-none px-4" />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Type de Candidature</Label>
                    <select 
                      value={formData.modeCandidature} 
                      onChange={e => setFormData({...formData, modeCandidature: e.target.value})}
                      className="w-full h-12 rounded-xl bg-gray-50 border-none px-4 text-sm font-bold outline-none"
                    >
                      <option value="email">Candidature par Email</option>
                      <option value="lien">Lien Externe</option>
                      <option value="interne">Directement sur le site</option>
                    </select>
                  </div>

                  {formData.modeCandidature === 'email' && (
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Email de réception des CV</Label>
                      <Input required={formData.categorie === 'offre-demploi'} type="email" value={formData.emailContact} onChange={e => setFormData({...formData, emailContact: e.target.value})} placeholder="Ex: recrutement@entreprise.com" className="h-12 rounded-xl bg-gray-50 border-none px-4" />
                    </div>
                  )}

                  {formData.modeCandidature === 'lien' && (
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Lien du portail externe</Label>
                      <Input required={formData.categorie === 'offre-demploi'} type="url" value={formData.lienExterne} onChange={e => setFormData({...formData, lienExterne: e.target.value})} placeholder="Ex: https://careers.entreprise.com" className="h-12 rounded-xl bg-gray-50 border-none px-4" />
                    </div>
                  )}

                  {!editingId && (
                    <div className="space-y-4 md:col-span-2 bg-yellow-50/50 p-6 rounded-2xl border border-yellow-200">
                      <Label className="text-sm font-black uppercase tracking-widest text-yellow-900">Visibilité de l'annonce</Label>
                      <p className="text-xs text-yellow-700 font-bold mb-4">Combien de crédits souhaitez-vous dépenser pour cette offre ? L'utilisation de plus de crédits permet d'atteindre plus de candidats.</p>
                      <div className="grid sm:grid-cols-3 gap-4">
                        {[
                          { id: 'standard', name: 'Standard', desc: 'Publication normale', cost: 0, color: 'border-yellow-200 bg-white hover:border-yellow-300' },
                          { id: 'urgent', name: 'Urgent', desc: 'Logo "Urgent" et mis en avant', cost: 2, color: 'border-orange-200 bg-orange-50 hover:border-orange-400' },
                          { id: 'premium', name: 'Premium', desc: 'En tête de liste (7 jours)', cost: 3, color: 'border-primary/50 bg-primary/5 hover:border-primary' },
                        ].map((v) => (
                          <label key={v.id} className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col justify-between transition-all ${visibilite === v.id ? 'ring-2 ring-primary ring-offset-2 scale-[1.02] ' + v.color : v.color}`}>
                            <div className="flex items-start gap-4">
                              <input type="radio" value={v.id} checked={visibilite === v.id} onChange={() => setVisibilite(v.id as any)} className="mt-1" />
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900 leading-tight">{v.name}</h4>
                                <p className="text-[10px] text-gray-500 mt-1">{v.desc}</p>
                              </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-black/5 flex items-end justify-between font-black text-gray-900">
                              <span className="flex items-center gap-1"><Coins className="h-4 w-4 text-yellow-500" /> {v.cost === 0 ? 'Gratuit' : `${v.cost} ${v.cost > 1 ? 'Crédits' : 'Crédit'}`}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 md:col-span-2 flex justify-end mt-4">
                     <Button type="submit" disabled={isLoading} className="h-14 px-12 bg-blue-700 hover:bg-blue-800 rounded-2xl font-black uppercase shadow-lg shadow-blue-700/20 transition-transform active:scale-95">
                        {isLoading ? 'Envoi en cours...' : <><Send className="mr-2 h-5 w-5" /> Publier l'annonce</>}
                     </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 h-auto md:h-16 gap-2 rounded-2xl bg-white shadow-sm p-1 border border-gray-100 mb-8">
          <TabsTrigger value="offres" className="rounded-xl font-black uppercase text-xs tracking-widest h-12 md:h-auto"><ListIcon className="mr-2 h-4 w-4" /> Mes Annonces</TabsTrigger>
          <TabsTrigger value="candidates" className="rounded-xl font-black uppercase text-xs tracking-widest h-12 md:h-auto"><Users className="mr-2 h-4 w-4" /> Candidatures reçues</TabsTrigger>
          <TabsTrigger value="profile" className="rounded-xl font-black uppercase text-xs tracking-widest h-12 md:h-auto"><User className="mr-2 h-4 w-4" /> Mon Profil</TabsTrigger>
          <TabsTrigger value="credits" className="rounded-xl font-black uppercase text-xs tracking-widest h-12 md:h-auto text-yellow-700 data-[state=active]:bg-yellow-100 data-[state=active]:text-yellow-900"><Wallet className="mr-2 h-4 w-4" /> Acheter Crédits</TabsTrigger>
        </TabsList>

        <TabsContent value="credits">
          <Card className="rounded-[2.5rem] border-white shadow-xl bg-gradient-to-br from-yellow-50 to-white p-8 mb-8">
            <div className="text-center mb-10">
               <div className="inline-flex items-center justify-center h-20 w-20 bg-yellow-100 rounded-full mb-4">
                  <Coins className="h-10 w-10 text-yellow-500" />
               </div>
               <h2 className="text-3xl font-black text-gray-900 uppercase">Achetez vos Packs de Crédits</h2>
               <p className="text-gray-500 font-bold mt-2">Utilisez ces crédits pour poster vos offres, ou les rendre urgentes et premium !</p>
               <div className="text-xl font-black text-yellow-600 mt-4 bg-yellow-200/40 inline-flex px-6 py-2 rounded-full">Solde Actuel : {user?.credits || 0} Crédits</div>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
               {packages.map((pkg) => (
                  <div key={pkg.id} className="bg-white border text-center border-gray-100 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 relative overflow-hidden group">
                     <h3 className="text-xl font-black uppercase text-gray-900 mb-2">{pkg.nom}</h3>
                     {pkg.description && <p className="text-xs font-bold text-gray-400 mb-6">{pkg.description}</p>}
                     <div className="text-4xl font-black text-blue-700 mb-2">{pkg.prix === 0 ? "Gratuit" : `${pkg.prix} FCFA`}</div>
                     <div className="bg-yellow-100/50 text-yellow-800 text-sm font-black uppercase tracking-widest py-2 rounded-xl mb-6">
                        +{pkg.credits} Crédits
                     </div>
                     
                     <Button 
                        onClick={() => handleBuyCredits(pkg.id)}
                        disabled={isLoading}
                        className="w-full h-14 rounded-2xl bg-gray-900 hover:bg-black font-black uppercase tracking-widest shadow-xl group-hover:scale-105 transition-transform"
                     >
                        {isLoading ? 'En cours...' : 'Acheter'}
                     </Button>
                  </div>
               ))}
               {packages.length === 0 && <div className="col-span-3 text-center text-gray-500 font-bold p-10">Aucun pack disponible pour le moment.</div>}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card className="rounded-[2.5rem] border-blue-100 shadow-xl overflow-hidden mb-8">
            <div className="bg-blue-700 p-8 text-center text-white">
              <div className="h-20 w-20 rounded-full bg-white/20 mx-auto mb-4 flex items-center justify-center border-2 border-white/20 overflow-hidden">
                {user?.image ? <img src={user.image} className="h-full w-full object-cover object-center" alt="Profile" /> : <User className="h-10 w-10" />}
              </div>
              <h3 className="text-xl font-black uppercase text-white truncate">{user?.name}</h3>
              <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest mt-1">Recruteur</p>
            </div>
            <CardContent className="p-8">
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Nom de l'Entreprise</Label>
                    <Input value={profile.entreprise || ''} onChange={e => setProfile({...profile, entreprise: e.target.value})} placeholder="Ex: Liggeybi SA" className="h-12 rounded-xl bg-gray-50 border-none px-4" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Secteur d'Activité</Label>
                    <Input value={profile.secteurEntreprise || ''} onChange={e => setProfile({...profile, secteurEntreprise: e.target.value})} placeholder="Ex: Technologies de l'information" className="h-12 rounded-xl bg-gray-50 border-none px-4" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Téléphone</Label>
                    <Input value={profile.telephone || ''} onChange={e => setProfile({...profile, telephone: e.target.value})} placeholder="Ex: 77 000 00 00" className="h-12 rounded-xl bg-gray-50 border-none px-4" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Site Web</Label>
                    <Input value={profile.siteWeb || ''} onChange={e => setProfile({...profile, siteWeb: e.target.value})} placeholder="Ex: https://liggeybi.com" className="h-12 rounded-xl bg-gray-50 border-none px-4" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Description de l'Entreprise (Bio)</Label>
                    <Textarea value={profile.bio || ''} onChange={e => setProfile({...profile, bio: e.target.value})} placeholder="Présentation de l'entreprise..." className="h-32 rounded-xl bg-gray-50 border-none px-4 py-3 resize-none" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" className="bg-blue-700 hover:bg-blue-800 h-14 px-12 rounded-2xl font-black uppercase">Mettre à jour le profil</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offres">
           <div className="space-y-6">
             <div className="grid gap-4">
               {offres.length === 0 ? (
                 <div className="p-20 text-center border-2 border-dashed border-gray-100 rounded-[2.5rem]">
                   <Briefcase className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                   <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Vous n'avez pas encore publié d'offre.</p>
                 </div>
               ) : (
                 offres.map(offre => (
                   <Card key={offre.id} className="rounded-3xl border-gray-100 shadow-sm transition-all hover:shadow-md group">
                     <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                           <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center">
                              <Briefcase className="h-6 w-6 text-blue-700" />
                           </div>
                           <div>
                              <h3 className="font-black uppercase tracking-tight text-gray-900">{offre.titre}</h3>
                              <div className="flex items-center space-x-3 mt-1">
                                 <span className="text-xs font-bold text-gray-400 flex items-center"><Clock className="mr-1 h-3 w-3" /> {new Date(offre.createdAt).toLocaleDateString()}</span>
                                 <span className="text-xs font-black uppercase tracking-widest text-blue-700">{offre.categorie}</span>
                              </div>
                           </div>
                        </div>
                        <div className="flex items-center space-x-4 self-end md:self-center">
                           <div className={`flex items-center space-x-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                             offre.statut === 'approuve' ? 'bg-green-100 text-green-700' :
                             offre.statut === 'en_attente' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                           }`}>
                             {offre.statut === 'approuve' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                             {offre.statut.replace('_', ' ')}
                           </div>
                           <Button 
                             onClick={() => {
                               setFormData({
                                 titre: offre.titre || '',
                                 categorie: offre.categorie || 'offre-demploi',
                                 description: offre.description || '',
                                 lieu: offre.lieu || '',
                                 modeTravail: offre.modeTravail || 'Sur site',
                                 salaire: offre.salaire || '',
                                 experience: offre.experience || '',
                                 niveauEtude: offre.niveauEtude || '',
                                 typeContrat: offre.typeContrat || 'CDI',
                                 modeCandidature: offre.modeCandidature || 'interne',
                                 emailContact: offre.emailContact || '',
                                 lienExterne: offre.lienExterne || '',
                                 dateExpiration: offre.dateExpiration ? new Date(offre.dateExpiration).toISOString().split('T')[0] : '',
                                 logoUrl: offre.logoUrl || '',
                                 imageUrl: offre.imageUrl || '',
                                 tags: offre.tags || '',
                                 seoDescription: offre.seoDescription || ''
                               });
                               setEditingId(offre.id);
                               setShowForm(true);
                               window.scrollTo({ top: 0, behavior: 'smooth' });
                             }}
                             size="sm" 
                             className="rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200"
                           >
                             Modifier
                           </Button>
                           <Button 
                             onClick={async () => {
                               if(!confirm("Voulez-vous vraiment supprimer cette offre ?")) return;
                               try {
                                 const res = await fetch(`/api/offres/${offre.id}`, {
                                   method: 'DELETE',
                                   headers: { 'Authorization': `Bearer ${token}` }
                                 });
                                 if(res.ok) {
                                   setOffres(offres.filter(o => o.id !== offre.id));
                                 }
                               } catch(err) { console.error(err); }
                             }}
                             size="sm" 
                             className="rounded-xl font-bold bg-red-50 text-red-600 hover:bg-red-100 ml-2"
                           >
                             <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                           </Button>
                        </div>
                     </div>
                   </Card>
                 ))
               )}
             </div>
           </div>
        </TabsContent>

        <TabsContent value="candidates">
          <div className="grid gap-4">
            {candidatures.length === 0 ? (
               <div className="p-20 text-center border-2 border-dashed border-gray-100 rounded-[2.5rem]">
                 <Users className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                 <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Aucune candidature reçue pour le moment.</p>
               </div>
            ) : (
              candidatures.map((candidate, i) => (
                <Card key={i} className="rounded-3xl border-gray-100 shadow-sm">
                   <div className="p-6 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                         <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-black">
                            {candidate.nomComplet?.charAt(0)}
                         </div>
                         <div>
                            <h3 className="font-black uppercase text-gray-900">{candidate.nomComplet}</h3>
                            <p className="text-xs font-bold text-blue-600">Poste : {candidate.articleTitre}</p>
                            <p className="text-[10px] text-gray-400 font-medium">{candidate.email} • {candidate.telephone}</p>
                         </div>
                      </div>
                      <div className="flex items-center space-x-2">
                         {candidate.cvUrl && (
                           <Button variant="outline" size="sm" className="rounded-xl font-bold" onClick={() => setSelectedCv(candidate.cvUrl)}>
                              Voir CV
                           </Button>
                         )}
                         <Button onClick={() => window.location.href = `mailto:${candidate.email}`} size="sm" className="rounded-xl font-bold bg-gray-900">Contacter</Button>
                      </div>
                   </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* PDF Preview Modal */}
      <Dialog open={!!selectedCv} onOpenChange={(open) => !open && setSelectedCv(null)}>
        <DialogContent className="max-w-4xl w-full h-[90vh] p-0 overflow-hidden flex flex-col rounded-3xl">
          <DialogHeader className="p-4 border-b bg-white">
            <div className="flex items-center justify-between">
               <DialogTitle className="text-xl font-black">Aperçu du CV</DialogTitle>
               <a 
                 href={selectedCv!}
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
