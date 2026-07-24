import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  FileText,
  Settings,
  LogOut,
  Clock,
  MapPin,
  Upload,
  Loader2,
  Zap,
  Check,
  Briefcase,
  Star,
  ChevronRight,
  Home,
  Crown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function CandidateDashboard() {
  const { user, logout, token, isLoading: isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("accueil");
  const [profile, setProfile] = useState<any>(user?.profile || {});
  const [candidatures, setCandidatures] = useState<any[]>([]);
  const [cvPackages, setCvPackages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingCV, setUploadingCV] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPackModal, setShowPackModal] = useState(false);
  const cvInputRef = useRef<HTMLInputElement>(null);

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
    try {
      hasToken = !!localStorage.getItem("token");
    } catch {}

    if (!user && !hasToken && !isLoadingAuth) {
      navigate("/connexion");
    }

    if (user && user.role === "CANDIDAT") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("success") === "true") {
        alert("Félicitations ! Votre paiement a réussi. Vous pouvez maintenant importer votre CV.");
        setActiveTab("profil");
        setTimeout(() => {
          if (cvInputRef.current) cvInputRef.current.click();
        }, 500);
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (urlParams.get("action") === "importer_cv") {
        setActiveTab("profil");
        setTimeout(() => {
          if (cvInputRef.current) cvInputRef.current.click();
        }, 500);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [user, navigate, isLoadingAuth]);

  useEffect(() => {
    if (user?.profile) {
      setProfile(user.profile);
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, pkgRes] = await Promise.all([
          fetch("/api/candidatures/my", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/cv-packages"),
        ]);
        if (cRes.ok) setCandidatures(await cRes.json());
        if (pkgRes.ok) setCvPackages(await pkgRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  const handleCheckoutPackage = async (packageId: string) => {
    try {
      const res = await fetch(`/api/buy-cv-package`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ packageId }),
      });
      const data = await res.json();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCVClick = (e: React.MouseEvent<HTMLInputElement>) => {
    const now = new Date();
    const hasPremiumCv = profile?.isPremium && profile?.premiumUntil && new Date(profile.premiumUntil) > now;
    const hasBaseCvAccess = profile?.canUploadCv;
    if (!hasPremiumCv && !hasBaseCvAccess) {
      e.preventDefault();
      setShowPackModal(true);
    }
  };

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const now = new Date();
    const hasPremiumCv = profile?.isPremium && profile?.premiumUntil && new Date(profile.premiumUntil) > now;
    const hasBaseCvAccess = profile?.canUploadCv;

    if (!hasPremiumCv && !hasBaseCvAccess) {
      setShowPackModal(true);
      e.target.value = "";
      return;
    }

    if (file.type !== "application/pdf") {
      alert("Seuls les fichiers PDF sont acceptés.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      alert("La taille du fichier ne doit pas dépasser 20 Mo.");
      return;
    }

    setUploadingCV(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target?.result as string;
        const res = await fetch("/api/upload-cv", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fileName: file.name, fileData: base64Data }),
        });

        if (!res.ok) {
          setUploadingCV(false);
          alert("Erreur de l'upload");
          return;
        }

        const data = await res.json();
        const updatedProfile = { ...profile, cvUrl: data.url };
        setProfile(updatedProfile);
        
        await fetch("/api/profile", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedProfile),
        });

        alert("CV importé avec succès !");
        setUploadingCV(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      alert("Échec de l'importation du CV.");
      setUploadingCV(false);
    }
  };

  if (user?.role !== "CANDIDAT" && user?.role !== "ADMIN") {
    return <div className="p-20 text-center font-bold">Accès réservé aux candidats.</div>;
  }

  const isPremiumActive = profile?.isPremium && profile?.premiumUntil && new Date(profile.premiumUntil) > new Date();
  const canUpload = profile?.canUploadCv || isPremiumActive;

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-slate-50 font-sans">
      
      {/* Mobile Navigation Tabs */}
      <div className="md:hidden bg-white border-b border-slate-100 z-40 sticky top-16">
        <div className="grid grid-cols-4 gap-1 p-2">
          {[
            { id: "accueil", label: "Tableau", icon: Home },
            { id: "candidatures", label: "Emplois", icon: Briefcase },
            { id: "profil", label: "Profil", icon: User },
            { id: "promotion", label: "Premium", icon: Crown, highlight: true },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl gap-1 transition-all relative overflow-hidden ${
                activeTab === item.id 
                  ? (item.highlight ? "bg-amber-100 text-amber-700 shadow-inner" : "bg-emerald-50 text-emerald-700")
                  : (item.highlight ? "text-amber-600 hover:bg-amber-50" : "text-slate-500 hover:bg-slate-50")
              }`}
            >
              {item.highlight && activeTab !== item.id && (
                <div className="absolute inset-0 bg-amber-50 opacity-50"></div>
              )}
              <item.icon className={`w-5 h-5 relative z-10 ${
                activeTab === item.id 
                  ? (item.highlight ? "text-amber-600" : "text-emerald-600") 
                  : (item.highlight ? "text-amber-500" : "text-slate-400")
              }`} /> 
              <span className="text-[10px] font-bold text-center leading-tight truncate w-full relative z-10">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Sidebar */}{/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-100 h-[calc(100vh-64px)] sticky top-16 z-20 shrink-0">
        <div className="p-6 h-24 flex items-center border-b border-slate-50">
          <Link to="/" className="text-3xl font-black text-[#006837] tracking-tight hover:opacity-80 transition-opacity">
            SunuCV
          </Link>
        </div>
        
        <div className="p-6 pb-2">
           <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                 {profile.prenom ? profile.prenom[0].toUpperCase() : <User className="h-6 w-6" />}
              </div>
              <div className="flex-1 overflow-hidden">
                 <h3 className="font-bold text-slate-900 truncate">{profile.prenom} {profile.nom}</h3>
                 <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
           </div>
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Menu</p>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {[
            { id: "accueil", label: "Mon espace", icon: Home },
            { id: "candidatures", label: "Mes candidatures", icon: Briefcase },
            { id: "profil", label: "Mon Profil & CV", icon: User },
            { id: "promotion", label: "Packs & Visibilité", icon: Crown, highlight: true },
            { id: "parametres", label: "Paramètres", icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all ${
                activeTab === item.id
                  ? item.highlight 
                    ? "bg-amber-50 text-amber-600 shadow-sm"
                    : "bg-emerald-50 text-emerald-700 shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.icon className={`h-5 w-5 ${activeTab === item.id ? (item.highlight ? "text-amber-500" : "text-emerald-600") : "text-slate-400"}`} />
              {item.label}
              {item.highlight && activeTab !== item.id && (
                <div className="ml-auto w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <Link to="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors mb-2">
            <ChevronRight className="h-5 w-5 text-slate-400 rotate-180" />
            Retour au site
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors">
            <LogOut className="h-5 w-5 text-slate-400" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-full pb-12 relative z-10">
        <div className="max-w-5xl mx-auto p-4 md:p-8 lg:p-10 min-h-full">
          
          <AnimatePresence mode="wait">
            {activeTab === "accueil" && (
              <motion.div key="accueil" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                
                <div className="mb-8">
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900">Bonjour, {profile.prenom || "Candidat"} 👋</h1>
                  <p className="text-slate-500 mt-1 font-medium">Voici un résumé de votre activité.</p>
                </div>

                {/* Sales Banner: Push for CV Upload or Premium */}
                {!isPremiumActive ? (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-4 md:p-5 rounded-2xl shadow-sm relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                     <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                           <div className="flex items-center gap-2 mb-1">
                             <Crown className="w-4 h-4 text-amber-600" />
                             <h2 className="text-lg font-black text-amber-950 leading-tight">
                               Décrochez plus d'entretiens !
                             </h2>
                           </div>
                           <p className="text-amber-800/80 font-medium text-xs md:text-sm">
                             Passez Premium et laissez les recruteurs vous contacter directement.
                           </p>
                        </div>
                        <div className="shrink-0">
                           <Button onClick={() => setShowPackModal(true)} className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 font-black h-10 px-6 rounded-xl transition-all hover:scale-105 text-xs">
                             Devenir Premium <Zap className="ml-2 w-3 h-3" />
                           </Button>
                        </div>
                     </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-emerald-600 to-[#006837] text-white p-6 md:p-8 rounded-3xl shadow-xl shadow-emerald-900/20 flex items-center justify-between relative overflow-hidden">
                     <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxwYXRoIGQ9Ik0wIDBoMjB2MjBIMHoiIGZpbGw9Im5vbmUiLz4KPGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMiIgZmlsbD0iI2ZmZmZmZiIgb3BhY2l0eT0iMC4xIi8+Cjwvc3ZnPg==')] opacity-50"></div>
                     <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                          <Check className="w-5 h-5 text-emerald-300" />
                          <h2 className="text-lg md:text-xl font-black">Profil Premium Actif</h2>
                        </div>
                        <p className="text-emerald-100/90 font-medium text-sm">
                           Votre profil est actuellement mis en avant jusqu'au {new Date(profile.premiumUntil).toLocaleDateString()}.
                        </p>
                     </div>
                     <Star className="w-16 h-16 text-emerald-400/30 absolute right-6 -bottom-4 rotate-12" />
                  </div>
                )}

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-4 md:mt-6">
                   <div className="bg-white p-4 md:p-5 rounded-xl md:rounded-2xl border border-slate-100 shadow-sm">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-50 text-blue-600 rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-3">
                        <Briefcase className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <div className="text-2xl md:text-3xl font-black text-slate-900 leading-none">{candidatures.length}</div>
                      <div className="text-[9px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Candidatures</div>
                   </div>
                   <div className="bg-white p-4 md:p-5 rounded-xl md:rounded-2xl border border-slate-100 shadow-sm" onClick={() => setActiveTab("profil")}>
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-50 text-indigo-600 rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-3">
                        <FileText className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <div className="text-2xl md:text-3xl font-black text-slate-900 leading-none flex items-center gap-1.5 md:gap-2">
                        {profile.cvUrl ? "1" : "0"}
                        {profile.cvUrl && <Check className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />}
                      </div>
                      <div className="text-[9px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">CV en ligne</div>
                   </div>
                   <div className="bg-white p-4 md:p-5 rounded-xl md:rounded-2xl border border-slate-100 shadow-sm">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-50 text-emerald-600 rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-3">
                        <MapPin className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <div className="text-xs md:text-sm font-black text-slate-900 truncate mt-1 md:mt-2 leading-none">{profile.ville || "Non défini"}</div>
                      <div className="text-[9px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Localisation</div>
                   </div>
                   <div className="bg-white p-4 md:p-5 rounded-xl md:rounded-2xl border border-slate-100 shadow-sm" onClick={() => setActiveTab("promotion")}>
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-50 text-amber-600 rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-3">
                        <Star className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <div className="text-xs md:text-sm font-black text-slate-900 mt-1 md:mt-2 leading-none">{isPremiumActive ? "Actif" : "Inactif"}</div>
                      <div className="text-[9px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Statut Visibilité</div>
                   </div>
                </div>

                {/* Upload Action on Dashboard */}
                {!profile.cvUrl && (
                  <div className="mt-6 bg-blue-600 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-900/20">
                     <div className="absolute inset-0 bg-blue-700/50 mix-blend-multiply pattern-dots opacity-50"></div>
                     <div className="relative z-10 text-center md:text-left">
                        <h3 className="text-xl font-black mb-2">Vous n'avez pas encore de CV ?</h3>
                        <p className="text-blue-200 text-sm font-medium">Pour postuler aux offres, un CV est indispensable.</p>
                     </div>
                     <div className="relative z-10 w-full md:w-auto">
                        <div className="relative inline-block w-full">
                          <Input
                            type="file"
                            accept="application/pdf"
                            onClick={handleCVClick}
                            onChange={handleCVUpload}
                            disabled={uploadingCV}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <Button disabled={uploadingCV} className="w-full bg-white text-blue-700 hover:bg-blue-50 font-black h-12 rounded-xl transition-all shadow-lg text-sm">
                            {uploadingCV ? <><Loader2 className="w-5 h-5 mr-2 animate-spin"/> Importation...</> : <><Upload className="w-5 h-5 mr-2" /> Importer un CV (PDF)</>}
                          </Button>
                        </div>
                     </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "candidatures" && (
              <motion.div key="candidatures" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="mb-8">
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900">Mes Candidatures</h1>
                  <p className="text-slate-500 mt-1 font-medium">Suivez l'état de vos postulations.</p>
                </div>
                
                {isLoading ? (
                   <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-slate-300" /></div>
                ) : candidatures.length === 0 ? (
                  <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm">
                     <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Briefcase className="w-10 h-10" />
                     </div>
                     <h3 className="text-xl font-black text-slate-800 mb-2">Aucune candidature</h3>
                     <p className="text-slate-500 mb-8 font-medium">Vous n'avez pas encore postulé à une offre.</p>
                     <Button onClick={() => navigate("/offre-demploi")} className="bg-[#006837] hover:bg-[#004d29] text-white font-black h-12 px-8 rounded-xl">
                       Découvrir les offres
                     </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {candidatures.map((c: any) => (
                      <div key={c.id} className="bg-white border border-slate-100 rounded-xl md:rounded-2xl p-3.5 md:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                         <div>
                            <Link to={`/offre/${c.offreId}`} className="text-sm md:text-lg font-black text-slate-900 hover:text-[#006837] transition-colors line-clamp-1">
                              {c.offre?.titre || "Offre indisponible"}
                            </Link>
                            <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1.5 md:mt-2">
                               <span className="text-[10px] md:text-xs font-bold text-slate-500 bg-slate-100 px-2 md:px-3 py-0.5 md:py-1 rounded-full">{c.offre?.entreprise || "Entreprise"}</span>
                               <span className="text-[10px] md:text-xs text-slate-400 flex items-center"><Clock className="w-3 h-3 mr-1"/> {new Date(c.createdAt).toLocaleDateString()}</span>
                            </div>
                         </div>
                         <div className="flex items-center self-start md:self-auto">
                            <span className="px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[9px] md:text-[11px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">Envoyée</span>
                         </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "profil" && (
              <motion.div key="profil" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <div className="mb-4">
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900">Mon Profil & CV</h1>
                  <p className="text-slate-500 mt-1 font-medium">Gérez votre identité professionnelle.</p>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
                   <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 pb-8 border-b border-slate-100">
                      <div className="flex items-center gap-5">
                         <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 shrink-0">
                           <FileText className="w-8 h-8 md:w-10 md:h-10" />
                         </div>
                         <div>
                            <h3 className="text-lg md:text-xl font-black text-slate-900">Curriculum Vitae</h3>
                            <div className="flex items-center gap-2 mt-1">
                               <div className={`w-2 h-2 rounded-full ${profile.cvUrl ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                               <span className="text-sm font-bold text-slate-500">{profile.cvUrl ? 'En ligne' : 'Aucun fichier'}</span>
                            </div>
                         </div>
                      </div>
                      
                      <div className="w-full md:w-auto relative flex gap-3">
                        {profile.cvUrl && (
                           <Button variant="outline" className="flex-1 md:flex-none border-slate-200 text-slate-700 h-12 rounded-xl font-bold" onClick={() => window.open(profile.cvUrl, "_blank")}>
                             Voir
                           </Button>
                        )}
                        <div className="relative flex-1 md:flex-none">
                          <Input
                            type="file"
                            accept="application/pdf"
                            onClick={handleCVClick}
                            onChange={handleCVUpload}
                            disabled={uploadingCV}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <Button disabled={uploadingCV} className="w-full bg-[#006837] hover:bg-[#004d29] text-white font-black h-12 px-6 rounded-xl transition-colors shadow-lg">
                            {uploadingCV ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5 mr-2" />}
                            {profile.cvUrl ? 'Mettre à jour' : 'Importer'}
                          </Button>
                        </div>
                      </div>
                   </div>

                   <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <h3 className="text-lg font-black text-slate-900">Informations Personnelles</h3>
                      <div className="grid md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Prénom</Label>
                          <Input value={profile.prenom || ""} onChange={(e) => setProfile({...profile, prenom: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-slate-200 font-medium px-4" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nom</Label>
                          <Input value={profile.nom || ""} onChange={(e) => setProfile({...profile, nom: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-slate-200 font-medium px-4" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Titre professionnel (ex: Ingénieur DevOps)</Label>
                          <Input value={profile.titre || ""} onChange={(e) => setProfile({...profile, titre: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-slate-200 font-medium px-4" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Ville</Label>
                          <Input value={profile.ville || ""} onChange={(e) => setProfile({...profile, ville: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-slate-200 font-medium px-4" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pays</Label>
                          <Input value={profile.pays || ""} onChange={(e) => setProfile({...profile, pays: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-slate-200 font-medium px-4" />
                        </div>
                      </div>
                      
                      <div className="flex justify-end pt-4 border-t border-slate-100">
                        <Button type="submit" className="bg-[#006837] hover:bg-[#004d29] text-white font-black h-12 px-8 rounded-xl shadow-lg transition-all w-full md:w-auto">
                          {saveSuccess ? <><Check className="w-5 h-5 mr-2" /> Enregistré</> : 'Sauvegarder les modifications'}
                        </Button>
                      </div>
                   </form>
                </div>
              </motion.div>
            )}

            {activeTab === "promotion" && (
              <motion.div key="promotion" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="mb-8">
                  <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                    <Star className="w-3 h-3" /> CVthèque Premium
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">Packs & Visibilité</h1>
                  <p className="text-slate-500 mt-2 font-medium max-w-2xl">Débloquez les fonctionnalités premium et propulsez votre carrière en vous rendant visible auprès de milliers d'entreprises.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
                  {cvPackages.filter(pkg => pkg.type === 'DEPOT' || pkg.type === 'VISIBILITE').sort((a, b) => b.prix - a.prix).map((pkg) => {
                    const isVIP = pkg.prix >= 1400;
                    const isRecommended = pkg.prix >= 900 && pkg.prix < 1400;
                    const isBasic = pkg.prix < 900;
                    
                    const colorClasses = isVIP 
                      ? 'from-indigo-700 to-purple-800 shadow-indigo-900/20 ring-indigo-500' 
                      : isRecommended 
                        ? 'from-amber-500 to-orange-600 shadow-amber-900/20 ring-amber-400'
                        : 'from-slate-700 to-slate-800 shadow-slate-900/20 ring-slate-500';

                    return (
                    <div key={pkg.id} className={`relative overflow-hidden rounded-2xl md:rounded-[2rem] p-2 md:p-8 flex flex-col justify-between items-center md:items-stretch transition-all group hover:-translate-y-1 hover:shadow-2xl text-white bg-gradient-to-br ${colorClasses} ${isRecommended ? 'ring-2 md:ring-4 md:scale-105 z-10' : ''}`}>
                      
                      {isRecommended && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-white text-amber-600 text-[8px] md:text-[10px] font-black uppercase tracking-widest px-2 py-0.5 md:px-4 md:py-1.5 rounded-b-lg md:rounded-b-xl z-20 shadow-sm flex items-center gap-1 w-max">
                          <Star className="w-2 h-2 md:w-3 md:h-3 fill-amber-500 text-amber-500" /> <span className="hidden sm:inline">Choix N°1</span><span className="sm:hidden">Top</span>
                        </div>
                      )}
                      {isVIP && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-white text-indigo-700 text-[8px] md:text-[10px] font-black uppercase tracking-widest px-2 py-0.5 md:px-4 md:py-1.5 rounded-b-lg md:rounded-b-xl z-20 shadow-sm flex items-center gap-1 w-max">
                          <Crown className="w-2 h-2 md:w-3 md:h-3 fill-indigo-600 text-indigo-600" /> <span className="hidden sm:inline">Ultra Rapide</span><span className="sm:hidden">VIP</span>
                        </div>
                      )}
                      
                      <div className="flex flex-col flex-1 text-center md:text-left w-full mt-3 md:mt-0">
                        <div className="flex flex-col md:flex-row items-center gap-1 md:gap-2 mb-1 md:mb-6">
                           <h3 className="text-[11px] md:text-2xl font-black leading-tight uppercase line-clamp-1">{pkg.nom}</h3>
                        </div>
                        
                        {pkg.description && (
                          <div className="text-[8px] md:text-sm font-medium mb-2 md:mb-6 md:p-4 md:rounded-2xl md:bg-white/10 md:border md:border-white/10 opacity-90 md:opacity-100 line-clamp-2 md:line-clamp-none text-center md:text-left">
                            {pkg.description}
                          </div>
                        )}

                        <ul className="hidden md:block space-y-4 mb-8">
                          {(pkg.options || "").split(",").map((opt, idx) => (
                            <li key={idx} className="flex items-start">
                              <Check className="w-5 h-5 shrink-0 mr-3 text-white/80" />
                              <span className="text-sm font-bold pt-0.5 text-white/95">{opt.trim()}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="flex flex-col items-center md:items-stretch shrink-0 md:border-t border-white/20 md:pt-6 w-full mt-auto">
                        <div className="text-center md:text-left mb-2 md:mb-6">
                           <div className="text-base md:text-4xl font-black flex items-baseline gap-1 justify-center md:justify-start">
                             {pkg.prix === 0 ? "Gratuit" : pkg.prix}
                              {pkg.prix !== 0 && <span className="text-[8px] md:text-lg font-bold opacity-80">FCFA</span>}
                           </div>
                           <div className="text-[7px] md:text-[10px] font-bold uppercase tracking-widest mt-0.5 md:mt-1 opacity-70 line-clamp-1">
                             {pkg.dureeJours >= 99999 ? (pkg.nom.toLowerCase().includes('starter') ? '' : 'À vie') : `${pkg.dureeJours} jours`}
                           </div>
                        </div>
                        
                        <Button 
                           onClick={() => handleCheckoutPackage(pkg.id)}
                          className="h-7 md:h-14 px-2 md:px-0 w-full rounded-md md:rounded-2xl font-black text-[9px] md:text-xs uppercase tracking-widest shadow-xl transition-all bg-white text-gray-900 hover:bg-gray-100"
                        >
                          {pkg.prix === 0 ? "Activer" : "Choisir"}
                        </Button>
                      </div>
                    </div>
                    );
                  })}
                  {cvPackages.length === 0 && (
                    <div className="lg:col-span-3 bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400 font-bold">Aucun pack disponible.</div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "parametres" && (
              <motion.div key="parametres" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="mb-8">
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900">Paramètres</h1>
                  <p className="text-slate-500 mt-1 font-medium">Gérez votre compte et vos préférences.</p>
                </div>
                
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                   <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between">
                      <div>
                         <h3 className="text-lg font-black text-slate-900">Compte</h3>
                         <p className="text-sm font-medium text-slate-500 mt-1">{user?.email}</p>
                      </div>
                   </div>
                   <div className="p-6 md:p-8 bg-slate-50/50">
                      <Button variant="outline" className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 font-bold rounded-xl h-12 px-6" onClick={logout}>
                        Déconnexion
                      </Button>
                   </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>



      {/* Upload/Pack Modal */}
      <Dialog open={showPackModal} onOpenChange={setShowPackModal}>
        <DialogContent className="sm:max-w-md bg-white rounded-[2rem] border-transparent shadow-2xl p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 md:p-8 border-b border-amber-100 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm text-amber-500 flex items-center justify-center mb-4 relative z-10">
               <Upload className="w-8 h-8" />
            </div>
            <DialogTitle className="text-xl md:text-2xl font-black text-amber-950 uppercase tracking-tight relative z-10">
              Débloquez l'importation
            </DialogTitle>
            <DialogDescription className="font-medium text-amber-800/80 mt-2 text-sm relative z-10">
              Pour des raisons de qualité, l'importation de CV et la postulation directe nécessitent un pack. Choisissez une option pour continuer.
            </DialogDescription>
          </div>
          <div className="p-6 bg-slate-50/50">
             <div className="space-y-4">
               {cvPackages.filter(pkg => pkg.type === 'DEPOT' || pkg.type === 'VISIBILITE').sort((a, b) => b.prix - a.prix).map((pkg) => {
                 const isVIP = pkg.prix >= 1400;
                 const isRecommended = pkg.prix >= 900 && pkg.prix < 1400;
                 const isBasic = pkg.prix < 900;
                 
                 return (
                 <div key={pkg.id} className={`bg-white border rounded-2xl p-4 md:p-5 flex flex-col gap-3 transition-all cursor-pointer group relative overflow-hidden ${isVIP ? 'border-indigo-500 shadow-xl shadow-indigo-500/20 scale-[1.02] bg-indigo-50/30' : isRecommended ? 'border-amber-400 shadow-lg shadow-amber-500/20 scale-[1.02] bg-amber-50/10' : 'border-slate-200 hover:border-amber-300 hover:shadow-md'}`} onClick={() => handleCheckoutPackage(pkg.id)}>
                    {isRecommended && (
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl z-10 shadow-sm flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-white" /> 🔥 Choix N°1 (70% des candidats)
                      </div>
                    )}
                    {isVIP && (
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl z-10 shadow-sm flex items-center gap-1">
                        <Crown className="w-2.5 h-2.5 fill-white" /> 🚀 Ultra Rapide
                      </div>
                    )}
                    <div className="flex justify-between items-center relative z-10">
                       <div className="flex-1 pr-4">
                         <h4 className={`font-black uppercase tracking-tight transition-colors ${isVIP ? 'text-indigo-800 text-lg' : isRecommended ? 'text-amber-700 text-lg' : 'text-slate-900 text-base group-hover:text-amber-600'}`}>{pkg.nom}</h4>
                         <div className="text-lg font-black text-slate-800 mt-0.5 flex items-baseline gap-1">
                            {pkg.prix === 0 ? "Gratuit" : `${pkg.prix} FCFA`}
                            {pkg.dureeJours >= 99999 && pkg.nom.toLowerCase().includes('starter') ? null : <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">/ {pkg.dureeJours >= 99999 ? 'À vie' : `${pkg.dureeJours} Jours`}</span>}
                         </div>
                         
                         {isVIP && (
                           <div className="text-xs font-medium text-indigo-900/80 mt-2">
                             <div className="mt-1 flex flex-col gap-1">
                               <div className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" /> <span><b>Recommandation directe</b> par notre IA aux recruteurs</span></div>
                               <div className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" /> <span>Badge exclusif <b>Top Candidat</b></span></div>
                               <div className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" /> <span>Tout le contenu du pack Premium</span></div>
                             </div>
                           </div>
                         )}
                         
                         {isRecommended && (
                           <div className="text-xs font-medium text-amber-800/80 mt-2">
                             <div className="mt-1 flex flex-col gap-1">
                               <div className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" /> <span>Candidatures <b>en tête de liste</b></span></div>
                               <div className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" /> <span>Badge <b>Profil Vérifié</b></span></div>
                               <div className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" /> <span><b>Visibilité Premium</b> dans la CVthèque</span></div>
                             </div>
                           </div>
                         )}
                         
                         {isBasic && (
                           <div className="text-[10px] font-medium text-slate-400 mt-2">
                             Import simple, visibilité standard.
                           </div>
                         )}
                       </div>
                       <Button size="sm" className={`shrink-0 text-white rounded-xl px-5 h-10 text-[10px] font-black uppercase tracking-widest ${isVIP ? 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20' : isRecommended ? 'bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20' : 'bg-slate-800 hover:bg-slate-900 shadow-md'}`}>{pkg.prix === 0 ? 'Activer' : (isVIP ? 'Prendre ce pack' : isRecommended ? 'Choisir ce pack' : 'Acheter')}</Button>
                    </div>
                 </div>
                 );
               })}
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
