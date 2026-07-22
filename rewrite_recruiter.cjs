const fs = require('fs');

const content = `import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Briefcase, Send, Plus, List as ListIcon, Clock, CheckCircle, Users, LayoutDashboard, User, Trash2, Zap, Download, LogOut, Search, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HIGH_CPC_TITLES = [
  "Directeur Administratif et Financier (DAF)",
  "Chef de Projet Informatique Senior",
  "Expert Comptable / Auditeur Interne",
  "Ingénieur DevOps / Cloud (Remote)",
  "Consultant Expert en Stratégie d'Entreprise"
];

export function RecruiterDashboard() {
  const { token, user, refreshUser, logout } = useAuth();
  const [offres, setOffres] = useState<any[]>([]);
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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
          headers: { 'Authorization': \`Bearer \${token}\` }
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
          headers: { 'Authorization': \`Bearer \${token}\` }
        });
        if (res.ok) {
          const data = await res.json();
          setCandidatures(data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (token) {
      fetchOffres();
      fetchCandidatures();
    }
  }, [token]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'imageUrl') => {
    let file = e.target.files?.[0];
    if (file) {
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
          'Authorization': \`Bearer \${token}\`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profile)
      });
      if (res.ok) alert("Profil mis à jour !");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
        const res = await fetch('/api/offres', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': \`Bearer \${token}\`
          },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
           alert("Offre publiée avec succès ! Elle sera visible après validation.");
           setShowForm(false);
           setFormData({
             titre: '', categorie: 'offre-demploi', description: '', lieu: '', modeTravail: 'Sur site', 
             salaire: '', experience: '', niveauEtude: '', typeContrat: 'CDI', modeCandidature: 'interne', 
             emailContact: '', lienExterne: '', dateExpiration: defaultDateStr, logoUrl: '', imageUrl: '', tags: '', seoDescription: ''
           });
        } else {
           const err = await res.json();
           alert(err.error || "Erreur lors de la publication.");
        }
      } else {
        const res = await fetch(\`/api/offres/\${editingId}\`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': \`Bearer \${token}\`
          },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
           alert("Offre modifiée avec succès !");
           setShowForm(false);
           setEditingId(null);
        } else {
           const err = await res.json();
           alert(err.error || "Erreur lors de la modification.");
        }
      }
      
      // Refresh offres
      refreshUser?.();
      const resOffres = await fetch('/api/my-offres', {
        headers: { 'Authorization': \`Bearer \${token}\` }
      });
      if (resOffres.ok) {
        const data = await resOffres.json();
        setOffres(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.role !== 'RECRUTEUR') return <div className="p-20 text-center font-bold">Accès réservé aux recruteurs.</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Custom Recruiter Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Link to="/" className="flex items-center gap-2 group">
               <div className="bg-[#006837] text-white p-1.5 sm:p-2 rounded-lg group-hover:bg-[#004d29] transition-colors">
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
               </div>
               <span className="font-black text-lg sm:text-xl tracking-tighter hidden sm:block">Retour au site</span>
             </Link>
             <div className="h-6 w-px bg-slate-700 hidden sm:block mx-2"></div>
             <div className="flex items-center gap-2 text-emerald-400">
               <LayoutDashboard className="h-5 w-5 sm:h-6 sm:w-6" />
               <span className="font-black text-lg sm:text-xl tracking-tighter uppercase">Recruteur</span>
             </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-6">
             <div className="hidden md:flex items-center gap-3">
               <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                 {user?.image ? <img src={user.image} alt={user.name} className="h-full w-full object-cover" /> : <User className="h-5 w-5 text-slate-400" />}
               </div>
               <div className="flex flex-col">
                 <span className="font-bold text-sm leading-tight truncate max-w-[150px]">{user?.name}</span>
                 <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{profile.entreprise || 'Entreprise'}</span>
               </div>
             </div>
             <Button onClick={logout} variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl px-3 h-10">
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline font-bold uppercase text-xs tracking-widest">Déconnexion</span>
             </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-64 shrink-0 space-y-2">
            <Button 
               onClick={() => { setShowForm(true); setEditingId(null); setActiveTab('offres'); }} 
               className="w-full h-14 bg-[#006837] hover:bg-[#004d29] text-white rounded-2xl font-black uppercase tracking-widest mb-6 shadow-lg shadow-emerald-900/20"
            >
               <Plus className="mr-2 h-5 w-5" /> Publier une offre
            </Button>
            
            <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 no-scrollbar">
              <button 
                 onClick={() => { setActiveTab('offres'); setShowForm(false); }}
                 className={\`flex items-center justify-center lg:justify-start gap-3 px-4 h-12 rounded-xl font-bold uppercase text-xs tracking-widest transition-all min-w-[140px] lg:min-w-0 \${activeTab === 'offres' && !showForm ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-700'}\`}
              >
                 <ListIcon className="h-4 w-4" /> Mes Annonces
              </button>
              <button 
                 onClick={() => { setActiveTab('candidates'); setShowForm(false); }}
                 className={\`flex items-center justify-center lg:justify-start gap-3 px-4 h-12 rounded-xl font-bold uppercase text-xs tracking-widest transition-all min-w-[140px] lg:min-w-0 \${activeTab === 'candidates' && !showForm ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-700'}\`}
              >
                 <Users className="h-4 w-4" /> Candidatures
                 {candidatures.length > 0 && <span className="ml-auto bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-[10px]">{candidatures.length}</span>}
              </button>
              <button 
                 onClick={() => window.open('/cvtheque', '_blank')}
                 className="flex items-center justify-center lg:justify-start gap-3 px-4 h-12 rounded-xl font-bold uppercase text-xs tracking-widest transition-all min-w-[140px] lg:min-w-0 text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-100"
              >
                 <Search className="h-4 w-4" /> CVthèque
              </button>
              <button 
                 onClick={() => { setActiveTab('profile'); setShowForm(false); }}
                 className={\`flex items-center justify-center lg:justify-start gap-3 px-4 h-12 rounded-xl font-bold uppercase text-xs tracking-widest transition-all min-w-[140px] lg:min-w-0 \${activeTab === 'profile' && !showForm ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-700'}\`}
              >
                 <User className="h-4 w-4" /> Mon Profil
              </button>
            </nav>
          </aside>
          
          {/* Main Workspace */}
          <div className="flex-1 min-w-0">
             
             {/* Stats Row */}
             {!showForm && (
               <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
                   <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                      <div>
                         <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Offres</div>
                         <div className="text-2xl sm:text-3xl font-black text-slate-900">{offres.length}</div>
                      </div>
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                         <Briefcase className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                   </div>
                   <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                      <div>
                         <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Candidatures</div>
                         <div className="text-2xl sm:text-3xl font-black text-slate-900">{candidatures.length}</div>
                      </div>
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                         <Users className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                   </div>
                   <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                      <div>
                         <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Offres Premium</div>
                         <div className="text-2xl sm:text-3xl font-black text-slate-900">{offres.filter(o => o.visibilite === 'premium').length}</div>
                      </div>
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                         <Zap className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                   </div>
                   <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                      <div>
                         <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Offres Urgentes</div>
                         <div className="text-2xl sm:text-3xl font-black text-slate-900">{offres.filter(o => o.visibilite === 'urgent').length}</div>
                      </div>
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                         <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                   </div>
               </div>
             )}

             <AnimatePresence mode="wait">
                {showForm ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
                  >
                    <div className="bg-slate-900 p-6 flex items-center justify-between text-white">
                      <div>
                         <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">{editingId ? 'Modifier l\\'Offre' : 'Publier une Nouvelle Offre'}</h2>
                         <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1">Diffusez votre offre gratuitement avec l'option de mise en avant.</p>
                      </div>
                      <Button onClick={() => setShowForm(false)} variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl">
                         Fermer
                      </Button>
                    </div>
                    
                    <div className="p-6 sm:p-8">
                       <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Titre de l'Offre</Label>
                            <Input required value={formData.titre} onChange={e => setFormData({...formData, titre: e.target.value})} placeholder="Ex: Développeur React Senior" className="h-12 rounded-xl bg-slate-50 border-slate-200 px-4" />
                            {formData.categorie === 'offre-demploi' && (
                              <div className="pt-2">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-2">💡 Suggestions de titres optimisés :</p>
                                <div className="flex flex-wrap gap-2">
                                  {HIGH_CPC_TITLES.map((title, idx) => (
                                    <button 
                                      key={idx} 
                                      type="button" 
                                      onClick={() => setFormData({...formData, titre: title})}
                                      className="text-xs font-bold px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-100"
                                    >
                                      {title}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Catégorie</Label>
                            <select 
                              value={formData.categorie} 
                              onChange={e => setFormData({...formData, categorie: e.target.value})}
                              className="w-full h-12 rounded-xl bg-slate-50 border-slate-200 border px-4 text-sm font-bold focus:ring-2 focus:ring-[#006837] outline-none"
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
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Logo de l'Entreprise</Label>
                            <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'logoUrl')} className="h-12 rounded-xl bg-slate-50 border-slate-200 px-4 py-3" />
                            {formData.logoUrl && <img src={formData.logoUrl} className="h-12 mt-2 object-contain bg-white p-1 rounded border border-slate-200" alt="Preview" />}
                          </div>
                          
                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Image de Couverture</Label>
                            <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'imageUrl')} className="h-12 rounded-xl bg-slate-50 border-slate-200 px-4 py-3" />
                            {formData.imageUrl && <img src={formData.imageUrl} className="h-20 mt-2 object-cover rounded border border-slate-200" alt="Preview" />}
                          </div>
                          
                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Tags / Mots-clés (séparés par des virgules)</Label>
                            <Input value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} placeholder="Ex: Informatique, Full Remote, React" className="h-12 rounded-xl bg-slate-50 border-slate-200 px-4" />
                          </div>
                          
                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Description SEO (Méta description)</Label>
                            <Textarea value={formData.seoDescription} onChange={e => setFormData({...formData, seoDescription: e.target.value})} placeholder="Ex: Devenez notre prochain développeur React..." className="h-20 rounded-xl bg-slate-50 border-slate-200 px-4 py-3 resize-none" />
                          </div>
                          
                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Description détaillée</Label>
                            <RichTextEditor value={formData.description} onChange={(val) => setFormData({...formData, description: val})} />
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Lieu</Label>
                            <select required value={formData.lieu} onChange={e => setFormData({...formData, lieu: e.target.value})} className="w-full h-12 rounded-xl bg-slate-50 border-slate-200 border px-4 text-sm font-bold focus:ring-2 focus:ring-[#006837] outline-none">
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
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Mode de Travail</Label>
                            <select value={formData.modeTravail} onChange={e => setFormData({...formData, modeTravail: e.target.value})} className="w-full h-12 rounded-xl bg-slate-50 border-slate-200 border px-4 text-sm font-bold focus:ring-2 focus:ring-[#006837] outline-none">
                              <option value="Sur site">Sur site</option>
                              <option value="Hybride">Hybride</option>
                              <option value="Télétravail">Télétravail (Remote)</option>
                            </select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Salaire (Optionnel)</Label>
                            <Input value={formData.salaire} onChange={e => setFormData({...formData, salaire: e.target.value})} placeholder="Ex: 500k - 800k FCFA" className="h-12 rounded-xl bg-slate-50 border-slate-200 px-4" />
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Expérience requise</Label>
                            <select value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} className="w-full h-12 rounded-xl bg-slate-50 border-slate-200 border px-4 text-sm font-bold focus:ring-2 focus:ring-[#006837] outline-none">
                              <option value="">Non spécifié</option>
                              <option value="0-1 an">0-1 an (Junior)</option>
                              <option value="1-3 ans">1-3 ans</option>
                              <option value="3-5 ans">3-5 ans (Confirmé)</option>
                              <option value="5+ ans">5+ ans (Senior)</option>
                            </select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Niveau d'étude</Label>
                            <select value={formData.niveauEtude} onChange={e => setFormData({...formData, niveauEtude: e.target.value})} className="w-full h-12 rounded-xl bg-slate-50 border-slate-200 border px-4 text-sm font-bold focus:ring-2 focus:ring-[#006837] outline-none">
                              <option value="">Non spécifié</option>
                              <option value="Bac">Bac</option>
                              <option value="Bac+2">Bac+2 (BTS/DUT)</option>
                              <option value="Bac+3">Bac+3 (Licence)</option>
                              <option value="Bac+5">Bac+5 (Master/Ingénieur)</option>
                              <option value="Doctorat">Doctorat</option>
                            </select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Type de contrat</Label>
                            <select value={formData.typeContrat} onChange={e => setFormData({...formData, typeContrat: e.target.value})} className="w-full h-12 rounded-xl bg-slate-50 border-slate-200 border px-4 text-sm font-bold focus:ring-2 focus:ring-[#006837] outline-none">
                              <option value="CDI">CDI</option>
                              <option value="CDD">CDD</option>
                              <option value="Stage">Stage</option>
                              <option value="Freelance">Freelance / Consultant</option>
                              <option value="Intérim">Intérim</option>
                              <option value="Autre">Autre</option>
                            </select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Date d'Expiration</Label>
                            <Input type="date" value={formData.dateExpiration} onChange={e => setFormData({...formData, dateExpiration: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-slate-200 px-4" />
                          </div>
                          
                          <div className="space-y-2 md:col-span-2 pt-4 border-t border-slate-200">
                             <h4 className="text-sm font-black uppercase tracking-widest mb-4 text-slate-900">Méthode de Candidature</h4>
                             <div className="grid sm:grid-cols-2 gap-4">
                                <label className={\`border-2 rounded-2xl p-4 cursor-pointer transition-all flex flex-col gap-2 \${formData.modeCandidature === 'interne' ? 'border-[#006837] bg-emerald-50' : 'border-slate-200 hover:border-emerald-200'}\`}>
                                   <div className="flex items-center gap-2">
                                     <input type="radio" name="modeCandidature" value="interne" checked={formData.modeCandidature === 'interne'} onChange={() => setFormData({...formData, modeCandidature: 'interne'})} className="text-[#006837]" />
                                     <span className="font-bold text-sm">Candidature Interne (Via SunuCV)</span>
                                   </div>
                                   <p className="text-xs text-slate-500 pl-6">Recevez les CV directement dans cet espace recruteur.</p>
                                   {formData.modeCandidature === 'interne' && (
                                     <div className="pl-6 mt-2">
                                        <Input type="email" value={formData.emailContact} onChange={e => setFormData({...formData, emailContact: e.target.value})} placeholder="Email de notification (optionnel)" className="h-10 rounded-lg bg-white border-slate-200 text-xs" />
                                     </div>
                                   )}
                                </label>
                                <label className={\`border-2 rounded-2xl p-4 cursor-pointer transition-all flex flex-col gap-2 \${formData.modeCandidature === 'externe' ? 'border-[#006837] bg-emerald-50' : 'border-slate-200 hover:border-emerald-200'}\`}>
                                   <div className="flex items-center gap-2">
                                     <input type="radio" name="modeCandidature" value="externe" checked={formData.modeCandidature === 'externe'} onChange={() => setFormData({...formData, modeCandidature: 'externe'})} className="text-[#006837]" />
                                     <span className="font-bold text-sm">Candidature Externe (Votre site)</span>
                                   </div>
                                   <p className="text-xs text-slate-500 pl-6">Redirigez les candidats vers votre propre formulaire.</p>
                                   {formData.modeCandidature === 'externe' && (
                                     <div className="pl-6 mt-2">
                                        <Input type="url" required value={formData.lienExterne} onChange={e => setFormData({...formData, lienExterne: e.target.value})} placeholder="https://votre-site.com/carrieres" className="h-10 rounded-lg bg-white border-slate-200 text-xs" />
                                     </div>
                                   )}
                                </label>
                             </div>
                          </div>

                          {!editingId && (
                            <div className="space-y-4 md:col-span-2 pt-4 border-t border-slate-200">
                               <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">Mise en Avant (100% Gratuit)</h4>
                               <div className="grid md:grid-cols-3 gap-4">
                                  <label className={\`border-2 rounded-2xl p-4 cursor-pointer transition-all relative overflow-hidden flex flex-col items-center text-center \${visibilite === 'standard' ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-300'}\`}>
                                     <input type="radio" name="visibilite" className="hidden" checked={visibilite === 'standard'} onChange={() => setVisibilite('standard')} />
                                     <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center mb-2">
                                        <Briefcase className="h-5 w-5 text-slate-600" />
                                     </div>
                                     <span className="font-black text-sm uppercase">Standard</span>
                                     <span className="text-[10px] text-slate-500 font-bold mt-1">Affichage classique</span>
                                  </label>
                                  <label className={\`border-2 rounded-2xl p-4 cursor-pointer transition-all relative overflow-hidden flex flex-col items-center text-center \${visibilite === 'urgent' ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-orange-200'}\`}>
                                     <input type="radio" name="visibilite" className="hidden" checked={visibilite === 'urgent'} onChange={() => setVisibilite('urgent')} />
                                     <div className="absolute top-0 right-0 bg-orange-500 text-white text-[8px] font-black uppercase px-2 py-1 rounded-bl-lg">Gratuit</div>
                                     <div className="h-10 w-10 rounded-full bg-orange-200 flex items-center justify-center mb-2 text-orange-600">
                                        <Clock className="h-5 w-5" />
                                     </div>
                                     <span className="font-black text-sm uppercase text-orange-700">Urgent</span>
                                     <span className="text-[10px] text-orange-600/80 font-bold mt-1">Badge Urgent en rouge</span>
                                  </label>
                                  <label className={\`border-2 rounded-2xl p-4 cursor-pointer transition-all relative overflow-hidden flex flex-col items-center text-center \${visibilite === 'premium' ? 'border-purple-500 bg-purple-50' : 'border-slate-200 hover:border-purple-200'}\`}>
                                     <input type="radio" name="visibilite" className="hidden" checked={visibilite === 'premium'} onChange={() => setVisibilite('premium')} />
                                     <div className="absolute top-0 right-0 bg-purple-500 text-white text-[8px] font-black uppercase px-2 py-1 rounded-bl-lg">Gratuit</div>
                                     <div className="h-10 w-10 rounded-full bg-purple-200 flex items-center justify-center mb-2 text-purple-600">
                                        <Zap className="h-5 w-5" />
                                     </div>
                                     <span className="font-black text-sm uppercase text-purple-700">Premium</span>
                                     <span className="text-[10px] text-purple-600/80 font-bold mt-1">En tête de liste + Accueil</span>
                                  </label>
                               </div>
                            </div>
                          )}

                          <div className="md:col-span-2 pt-6">
                            <Button disabled={isLoading} className="w-full h-14 rounded-xl bg-[#006837] hover:bg-[#004d29] text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-emerald-900/20">
                              {isLoading ? 'Publication en cours...' : editingId ? 'Enregistrer les modifications' : 'Publier l\\'Offre Maintenant'}
                            </Button>
                          </div>
                       </form>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                     {activeTab === 'offres' && (
                        <div className="space-y-4">
                          <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-6">Vos Annonces Publiées</h2>
                          {offres.length === 0 ? (
                            <div className="p-16 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                              <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Vous n'avez pas encore publié d'offre.</p>
                              <Button onClick={() => setShowForm(true)} className="mt-4 bg-[#006837] hover:bg-[#004d29] text-white rounded-xl">Commencer</Button>
                            </div>
                          ) : (
                            <div className="grid gap-4">
                              {offres.map(offre => (
                                <Card key={offre.id} className="rounded-2xl border-slate-200 shadow-sm transition-all hover:shadow-md group overflow-hidden">
                                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                     <div className="flex items-center space-x-4">
                                        <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                                           {offre.logoUrl ? <img src={offre.logoUrl} className="h-8 w-8 object-contain" /> : <Briefcase className="h-6 w-6 text-slate-500" />}
                                        </div>
                                        <div>
                                           <h3 className="font-black tracking-tight text-slate-900 text-lg leading-tight">{offre.titre}</h3>
                                           <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                              <span className="text-[10px] font-bold text-slate-500 flex items-center"><Clock className="mr-1 h-3 w-3" /> {new Date(offre.createdAt).toLocaleDateString()}</span>
                                              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">{offre.categorie}</span>
                                              {offre.visibilite === 'urgent' && <span className="text-[10px] font-black uppercase tracking-widest text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">Urgent</span>}
                                              {offre.visibilite === 'premium' && <span className="text-[10px] font-black uppercase tracking-widest text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">Premium</span>}
                                           </div>
                                        </div>
                                     </div>
                                     <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-slate-100">
                                        <div className={\`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border \${
                                          offre.statut === 'approuve' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                                          offre.statut === 'en_attente' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                                        }\`}>
                                          {offre.statut === 'approuve' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                          <span className="hidden sm:inline">{offre.statut.replace('_', ' ')}</span>
                                        </div>
                                        <div className="flex gap-2">
                                          <Button 
                                             onClick={() => {
                                               setFormData({
                                                 titre: offre.titre || '', categorie: offre.categorie || 'offre-demploi', description: offre.description || '', lieu: offre.lieu || '',
                                                 modeTravail: offre.modeTravail || 'Sur site', salaire: offre.salaire || '', experience: offre.experience || '', niveauEtude: offre.niveauEtude || '',
                                                 typeContrat: offre.typeContrat || 'CDI', modeCandidature: offre.modeCandidature || 'interne', emailContact: offre.emailContact || '',
                                                 lienExterne: offre.lienExterne || '', dateExpiration: offre.dateExpiration ? new Date(offre.dateExpiration).toISOString().split('T')[0] : '',
                                                 logoUrl: offre.logoUrl || '', imageUrl: offre.imageUrl || '', tags: offre.tags || '', seoDescription: offre.seoDescription || ''
                                               });
                                               setEditingId(offre.id);
                                               setShowForm(true);
                                               window.scrollTo({ top: 0, behavior: 'smooth' });
                                             }}
                                             size="sm" 
                                             variant="outline"
                                             className="rounded-xl font-bold h-9 border-slate-200"
                                          >
                                            Modifier
                                          </Button>
                                          <Button 
                                             onClick={async () => {
                                               if(!confirm("Voulez-vous vraiment supprimer cette offre ?")) return;
                                               try {
                                                 const res = await fetch(\`/api/offres/\${offre.id}\`, { method: 'DELETE', headers: { 'Authorization': \`Bearer \${token}\` } });
                                                 if(res.ok) { setOffres(offres.filter(o => o.id !== offre.id)); }
                                               } catch(err) { console.error(err); }
                                             }}
                                             size="sm" 
                                             variant="ghost"
                                             className="rounded-xl font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 h-9 px-2"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                     </div>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          )}
                        </div>
                     )}

                     {activeTab === 'candidates' && (
                        <div className="space-y-4">
                          <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-6">Candidatures Reçues</h2>
                          {candidatures.length === 0 ? (
                             <div className="p-16 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                               <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                               <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Aucune candidature reçue pour le moment.</p>
                             </div>
                          ) : (
                            <div className="grid gap-4">
                              {candidatures.map((candidate, i) => (
                                <Card key={i} className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
                                   <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                      <div className="flex items-start sm:items-center space-x-4">
                                         <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-black shrink-0 border border-blue-200">
                                            {candidate.nomComplet?.charAt(0)}
                                         </div>
                                         <div>
                                            <h3 className="font-black tracking-tight text-slate-900 leading-tight">{candidate.nomComplet}</h3>
                                            <p className="text-[11px] font-bold text-emerald-700 mt-0.5">Poste : {candidate.articleTitre}</p>
                                            <p className="text-[10px] text-slate-500 font-medium mt-1">{candidate.email} • {candidate.telephone}</p>
                                         </div>
                                      </div>
                                      <div className="flex items-center space-x-2 sm:self-center self-end w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-slate-100">
                                         {candidate.cvUrl && (
                                           <Button variant="outline" size="sm" className="rounded-xl font-bold border-slate-200 h-9 flex-1 sm:flex-none" onClick={() => setSelectedCv(candidate.cvUrl)}>
                                              Voir CV
                                           </Button>
                                         )}
                                         <Button onClick={() => window.location.href = \`mailto:\${candidate.email}\`} size="sm" className="rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white h-9 flex-1 sm:flex-none">
                                            Contacter
                                         </Button>
                                      </div>
                                   </div>
                                </Card>
                              ))}
                            </div>
                          )}
                        </div>
                     )}

                     {activeTab === 'profile' && (
                        <div className="space-y-4 max-w-2xl">
                          <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-6">Mon Profil Entreprise</h2>
                          <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden">
                            <div className="bg-slate-900 p-8 text-center text-white relative overflow-hidden">
                              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-900"></div>
                              <div className="relative z-10">
                                <div className="h-24 w-24 rounded-full bg-white/10 mx-auto mb-4 flex items-center justify-center border-4 border-slate-700 overflow-hidden shadow-xl">
                                  {user?.image ? <img src={user.image} className="h-full w-full object-cover object-center" alt="Profile" /> : <User className="h-10 w-10 text-slate-400" />}
                                </div>
                                <h3 className="text-xl font-black uppercase text-white truncate px-4">{user?.name}</h3>
                                <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mt-1">Compte Recruteur</p>
                              </div>
                            </div>
                            <CardContent className="p-6 sm:p-8">
                              <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Nom de l'Entreprise</Label>
                                    <Input value={profile.entreprise || ''} onChange={e => setProfile({...profile, entreprise: e.target.value})} placeholder="Ex: Liggeybi SA" className="h-12 rounded-xl bg-slate-50 border-slate-200 px-4" />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Secteur d'Activité</Label>
                                    <Input value={profile.secteurEntreprise || ''} onChange={e => setProfile({...profile, secteurEntreprise: e.target.value})} placeholder="Ex: Technologies de l'information" className="h-12 rounded-xl bg-slate-50 border-slate-200 px-4" />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Site Web</Label>
                                    <Input value={profile.siteWeb || ''} onChange={e => setProfile({...profile, siteWeb: e.target.value})} placeholder="https://votre-site.com" className="h-12 rounded-xl bg-slate-50 border-slate-200 px-4" />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Téléphone de Contact</Label>
                                    <Input value={profile.telephone || ''} onChange={e => setProfile({...profile, telephone: e.target.value})} placeholder="+221 77 123 45 67" className="h-12 rounded-xl bg-slate-50 border-slate-200 px-4" />
                                  </div>
                                  <div className="space-y-2 md:col-span-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Brève Description de l'Entreprise</Label>
                                    <Textarea value={profile.descriptionEntreprise || ''} onChange={e => setProfile({...profile, descriptionEntreprise: e.target.value})} placeholder="Qui êtes-vous ?" className="h-24 rounded-xl bg-slate-50 border-slate-200 px-4 py-3 resize-none" />
                                  </div>
                                </div>
                                <Button type="submit" className="w-full sm:w-auto h-12 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-xs">
                                  Enregistrer les modifications
                                </Button>
                              </form>
                            </CardContent>
                          </Card>
                        </div>
                     )}
                  </motion.div>
                )}
             </AnimatePresence>

          </div>
        </div>
      </main>

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
                 className="flex items-center justify-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm"
               >
                 <Download className="h-4 w-4 mr-2" />
                 Télécharger le PDF
               </a>
            </div>
          </DialogHeader>
          <div className="flex-1 bg-slate-100 relative">
            {selectedCv && (
               <iframe 
                 src={\`\${selectedCv}#toolbar=0\`}
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
`;

fs.writeFileSync('src/pages/RecruiterDashboard.tsx', content);
console.log("Rewrite completed");
