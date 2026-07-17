import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  FileText,
  Settings,
  LogOut,
  Clock,
  Bookmark,
  ChevronRight,
  MapPin,
  Upload,
  Loader2,
  Link as LinkIcon,
  Zap,
  Check,
} from "lucide-react";
import { motion } from "motion/react";

export function CandidateDashboard() {
  const { user, logout, token, isLoading: isLoadingAuth } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("candidatures");
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
        // Force reload to let AuthContext pick it up
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
      // Check for success parameter after purchase
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("success") === "true") {
        alert(
          "Félicitations ! Votre paiement a réussi. Vous pouvez maintenant importer votre CV.",
        );
        setActiveTab("parametres");
        setTimeout(() => {
          if (cvInputRef.current) cvInputRef.current.click();
        }, 500);
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (urlParams.get("action") === "importer_cv") {
        setActiveTab("parametres");
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
          fetch("/api/candidatures/my", {
            headers: { Authorization: `Bearer ${token}` },
          }),
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

    // Validate Premium or DEPOT pack requirement for upload
    const now = new Date();
    const hasPremiumCv =
      profile?.isPremium &&
      profile?.premiumUntil &&
      new Date(profile.premiumUntil) > now;
    const hasBaseCvAccess = profile?.canUploadCv;

    if (!hasPremiumCv && !hasBaseCvAccess) {
      setShowPackModal(true);
      e.target.value = ""; // reset file input
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
          body: JSON.stringify({
            fileName: file.name,
            fileData: base64Data,
          }),
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
    return (
      <div className="p-20 text-center font-bold">
        Accès réservé aux candidats.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Menu Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="rounded-[2.5rem] border-gray-100 shadow-xl overflow-hidden">
            <div className="bg-blue-700 p-8 text-center text-white">
              <div className="h-20 w-20 rounded-full bg-white/20 mx-auto mb-4 flex items-center justify-center border-2 border-white/20 overflow-hidden">
                {user?.image ? (
                  <img
                    src={user.image}
                    className="h-full w-full object-cover object-center"
                  />
                ) : (
                  <User className="h-10 w-10" />
                )}
              </div>
              <h3 className="text-xl font-black uppercase text-white truncate">
                {user?.name}
              </h3>
              <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest mt-1">
                Niveau Or
              </p>
            </div>
            <CardContent className="p-4 space-y-2">
              <Button
                onClick={() => setActiveTab("candidatures")}
                variant={activeTab === "candidatures" ? "secondary" : "ghost"}
                className={`w-full justify-start rounded-xl font-bold h-12 ${activeTab === "candidatures" ? "bg-blue-50 text-blue-700" : "hover:bg-blue-50 hover:text-blue-700"}`}
              >
                <FileText className="mr-3 h-5 w-5" /> Mes Candidatures
              </Button>
              <Button
                onClick={() => setActiveTab("parametres")}
                variant={activeTab === "parametres" ? "secondary" : "ghost"}
                className={`w-full justify-start rounded-xl font-bold h-12 ${activeTab === "parametres" ? "bg-blue-50 text-blue-700" : "hover:bg-blue-50 hover:text-blue-700"}`}
              >
                <Settings className="mr-3 h-5 w-5" /> Mon Profil
              </Button>
              <Button
                onClick={() => setActiveTab("promotion")}
                variant={activeTab === "promotion" ? "secondary" : "ghost"}
                className={`w-full justify-start rounded-xl font-bold h-12 ${activeTab === "promotion" ? "bg-[#006837] text-white" : "hover:bg-[#006837]/10 hover:text-[#006837] text-indigo-900"}`}
              >
                <Zap className="mr-3 h-5 w-5" /> Pack Visibilité CV
              </Button>
              <hr className="my-2 border-gray-50" />
              <Button
                onClick={logout}
                variant="ghost"
                className="w-full justify-start rounded-xl font-bold h-12 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="mr-3 h-5 w-5" /> Déconnexion
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-8">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                label: "Offres Postulées",
                value: candidatures.length.toString(),
                color: "bg-blue-500 text-white",
              },
              {
                label: "Vues Profil",
                value: "0",
                color: "bg-purple-500 text-white",
              },
              {
                label: "Réponses",
                value: "0",
                color: "bg-green-500 text-white",
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">
                    {stat.label}
                  </div>
                  <div className="text-3xl font-black">{stat.value}</div>
                </div>
                <div
                  className={`h-12 w-12 rounded-2xl ${stat.color} flex items-center justify-center shadow-lg shadow-${stat.color.split(" ")[0].replace("bg-", "")}/20`}
                >
                  <FileText className="h-6 w-6" />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {activeTab === "parametres" && (
              <Card className="rounded-[2.5rem] border-gray-100 shadow-sm p-4 col-span-2">
                <CardHeader>
                  <CardTitle className="text-xl font-black uppercase">
                    Mes Infos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {saveSuccess && (
                    <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800">
                      <Check className="h-5 w-5" />
                      <span className="font-bold">
                        Profil enregistré avec succès !
                      </span>
                    </div>
                  )}
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-gray-400">
                          Prénom
                        </Label>
                        <Input
                          value={profile.prenom || ""}
                          onChange={(e) =>
                            setProfile({ ...profile, prenom: e.target.value })
                          }
                          placeholder="Ex: Jean"
                          className="h-12 rounded-xl bg-gray-50 border-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-gray-400">
                          Nom
                        </Label>
                        <Input
                          value={profile.nom || ""}
                          onChange={(e) =>
                            setProfile({ ...profile, nom: e.target.value })
                          }
                          placeholder="Ex: Dupont"
                          className="h-12 rounded-xl bg-gray-50 border-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-gray-400">
                          Titre Professionnel
                        </Label>
                        <Input
                          value={profile.titre || ""}
                          onChange={(e) =>
                            setProfile({ ...profile, titre: e.target.value })
                          }
                          placeholder="Ex: Comptable Senior"
                          className="h-12 rounded-xl bg-gray-50 border-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-gray-400">
                          Téléphone
                        </Label>
                        <Input
                          value={profile.telephone || ""}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              telephone: e.target.value,
                            })
                          }
                          placeholder="Ex: 77 000 00 00"
                          className="h-12 rounded-xl bg-gray-50 border-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-gray-400">
                          Ville
                        </Label>
                        <Input
                          value={profile.ville || ""}
                          onChange={(e) =>
                            setProfile({ ...profile, ville: e.target.value })
                          }
                          placeholder="Ex: Dakar"
                          className="h-12 rounded-xl bg-gray-50 border-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-gray-400">
                          Pays
                        </Label>
                        <Input
                          value={profile.pays || ""}
                          onChange={(e) =>
                            setProfile({ ...profile, pays: e.target.value })
                          }
                          placeholder="Ex: Sénégal"
                          className="h-12 rounded-xl bg-gray-50 border-none"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-gray-400">
                          Secteurs d'activité
                        </Label>
                        <Input
                          value={profile.secteurs || ""}
                          onChange={(e) =>
                            setProfile({ ...profile, secteurs: e.target.value })
                          }
                          placeholder="Ex: Informatique, Management..."
                          className="h-12 rounded-xl bg-gray-50 border-none"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-gray-400">
                          Bio (À propos de moi)
                        </Label>
                        <textarea
                          value={profile.bio || ""}
                          onChange={(e) =>
                            setProfile({ ...profile, bio: e.target.value })
                          }
                          placeholder="Parlez-nous un peu de vous..."
                          className="w-full h-24 rounded-xl bg-gray-50 border-none p-4"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-gray-400">
                          Compétences clés
                        </Label>
                        <Input
                          value={profile.competences || ""}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              competences: e.target.value,
                            })
                          }
                          placeholder="React, Node.js, Vente..."
                          className="h-12 rounded-xl bg-gray-50 border-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <Label className="text-xs font-black uppercase tracking-widest text-gray-400">
                        Mon CV (PDF uniquement, 20Mo max)
                      </Label>
                      <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                          <Input
                            ref={cvInputRef}
                            type="file"
                            accept="application/pdf"
                            onClick={handleCVClick}
                            onChange={handleCVUpload}
                            disabled={uploadingCV}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div
                            className={`h-12 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 text-sm font-bold transition-colors ${uploadingCV ? "border-gray-200 text-gray-400 bg-gray-50 animate-pulse" : profile.cvUrl ? "border-emerald-200 text-emerald-600 bg-emerald-50 hover:border-emerald-300" : "border-blue-200 text-blue-600 bg-blue-50 hover:border-blue-300"}`}
                          >
                            {uploadingCV ? (
                              <>
                                <Loader2 className="h-5 w-5 animate-spin" />{" "}
                                Importation...
                              </>
                            ) : (
                              <>
                                <Upload className="h-5 w-5" />{" "}
                                {profile.cvUrl
                                  ? "Mettre à jour le CV"
                                  : "Importer mon CV"}
                              </>
                            )}
                          </div>
                        </div>
                        {profile.cvUrl && (
                          <a
                            href={profile.cvUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0"
                          >
                            <Button
                              type="button"
                              variant="outline"
                              className="h-12 px-4 rounded-xl border-2 border-slate-200 hover:border-slate-300"
                            >
                              <LinkIcon className="h-4 w-4 mr-2" /> Voir
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end border-t border-gray-100 pt-6">
                      <Button
                        type="submit"
                        className="bg-blue-700 hover:bg-blue-800 h-14 px-10 rounded-2xl font-black uppercase text-sm"
                      >
                        Enregistrer les modifications
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {activeTab === "candidatures" && (
              <div className="space-y-6 col-span-2">
                {/* Quick Actions / Notices */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Premium Upsell or Status */}
                  {profile.isPremium &&
                  new Date(profile.premiumUntil) > new Date() ? (
                    <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-3xl flex flex-col justify-center relative overflow-hidden">
                      <Check className="h-8 w-8 text-emerald-500 mb-2" />
                      <h4 className="font-black text-emerald-900 text-lg uppercase">
                        Pack CV actif
                      </h4>
                      <p className="text-emerald-700 text-sm font-medium mt-1">
                        Vous pouvez importer votre CV. Votre quota de jours
                        restants est valide jusqu'au{" "}
                        <span className="font-bold">
                          {new Date(profile.premiumUntil).toLocaleDateString()}
                        </span>{" "}
                        (
                        {Math.ceil(
                          (new Date(profile.premiumUntil).getTime() -
                            new Date().getTime()) /
                            (1000 * 3600 * 24),
                        )}{" "}
                        jours restants).
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-6 rounded-3xl flex flex-col justify-center relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Zap className="h-24 w-24 text-amber-500" />
                      </div>
                      <div className="relative z-10 space-y-2">
                        <h4 className="font-black text-amber-900 text-lg uppercase tracking-tight">
                          Boostez votre CV
                        </h4>
                        <p className="text-amber-800/80 text-sm font-medium max-w-[200px]">
                          Multipliez vos chances. Mettez votre profil en
                          évidence pour les recruteurs.
                        </p>
                        <Button
                          onClick={() => setActiveTab("promotion")}
                          size="sm"
                          className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold uppercase text-[10px] h-10 px-6 mt-2"
                        >
                          Découvrir les packs
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Quick CV Upload */}
                  {!profile.cvUrl ? (
                    <div className="bg-blue-50 border border-blue-200 p-6 rounded-3xl flex flex-col justify-center relative">
                      <div className="space-y-2">
                        <h4 className="font-black text-blue-900 text-lg uppercase">
                          Finalisez votre profil
                        </h4>
                        <p className="text-blue-800/80 text-sm font-medium">
                          Vous n'avez pas encore importé votre CV. Faites-le
                          maintenant pour postuler instantanément.
                        </p>
                        <div className="relative inline-block mt-2">
                          <Input
                            type="file"
                            accept="application/pdf"
                            onClick={handleCVClick}
                            onChange={handleCVUpload}
                            disabled={uploadingCV}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <Button
                            disabled={uploadingCV}
                            size="sm"
                            className="bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold uppercase text-[10px] h-10 px-6 relative z-0"
                          >
                            {uploadingCV ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />{" "}
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" /> Importer un
                                CV
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl flex flex-col justify-center">
                      <FileText className="h-8 w-8 text-slate-400 mb-2" />
                      <h4 className="font-black text-slate-900 text-lg uppercase">
                        CV En ligne
                      </h4>
                      <p className="text-slate-600 text-sm font-medium mt-1 mb-3">
                        Votre CV est prêt pour postuler.
                      </p>
                      <div className="flex gap-2 relative">
                        <a
                          href={profile.cvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-xl border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
                          >
                            Consulter
                          </Button>
                        </a>
                        <div className="relative">
                          <Input
                            type="file"
                            accept="application/pdf"
                            onClick={handleCVClick}
                            onChange={handleCVUpload}
                            disabled={uploadingCV}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <Button
                            disabled={uploadingCV}
                            size="sm"
                            variant="outline"
                            className="rounded-xl border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
                          >
                            Remplacer
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-black uppercase flex items-center mt-8">
                  <Clock className="mr-3 h-6 w-6 text-blue-700" /> Historique de
                  candidatures
                </h3>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-20 bg-gray-50 rounded-2xl animate-pulse"
                        />
                      ))}
                    </div>
                  ) : candidatures.length === 0 ? (
                    <div className="p-12 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                        Aucune candidature pour le moment.
                      </p>
                    </div>
                  ) : (
                    candidatures.map((cand, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:border-blue-200 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="text-sm font-bold truncate">
                              {cand.articleTitre}
                            </div>
                            <div className="text-[10px] font-medium text-gray-400 flex items-center">
                              <Clock className="mr-1 h-3 w-3" />{" "}
                              {new Date(cand.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                          En cours
                        </span>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "promotion" && (
              <div className="space-y-6 col-span-2">
                <h3 className="text-xl font-black uppercase flex items-center">
                  <Zap className="mr-3 h-6 w-6 text-yellow-500" /> Booster mon
                  profil
                </h3>
                <p className="text-gray-500 font-medium text-sm">
                  Sortez du lot ! Mettez votre CV en avant et multipliez vos
                  chances d'être contacté par les meilleurs recruteurs.
                </p>

                {profile.isPremium &&
                  new Date(profile.premiumUntil) > new Date() && (
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3">
                      <Check className="h-6 w-6 text-emerald-600" />
                      <div>
                        <p className="font-bold text-emerald-900">
                          Votre profil est actuellement mis en avant !
                        </p>
                        <p className="text-sm text-emerald-700">
                          Valable jusqu'au{" "}
                          {new Date(profile.premiumUntil).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6"
                >
                  {cvPackages.filter(pkg => !(pkg.type === 'DEPOT' && (profile?.canUploadCv || profile?.isPremium))).map((pkg, i) => {
                    const isDepot = pkg.type === 'DEPOT';
                    return (
                    <motion.div
                      key={pkg.id}
                      whileHover={{ y: -5, scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className={`relative overflow-hidden border rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-all ${
                        isDepot 
                          ? 'bg-gradient-to-br from-white to-amber-50 border-amber-200 shadow-amber-900/5' 
                          : 'bg-gradient-to-br from-white to-emerald-50 border-[#006837]/20 shadow-emerald-900/5'
                      }`}
                    >
                      {/* Decorative elements */}
                      <div className={`absolute -right-12 -top-12 w-32 h-32 rounded-full blur-3xl opacity-30 ${isDepot ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                           <h4 className={`font-black text-2xl ${isDepot ? 'text-amber-900' : 'text-emerald-900'}`}>{pkg.nom}</h4>
                           {isDepot ? (
                             <span className="bg-amber-200 text-amber-900 text-[10px] uppercase font-black px-3 py-1.5 rounded-full shadow-sm">Dépôt CV</span>
                           ) : (
                             <span className="bg-emerald-200 text-[#006837] text-[10px] uppercase font-black px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1"><Zap className="w-3 h-3"/> Boost</span>
                           )}
                        </div>
                        <p className="text-sm font-medium text-gray-600 mb-6 bg-white/50 p-3 rounded-xl backdrop-blur-sm border border-black/5">
                          {pkg.description}
                        </p>
                        <ul className="space-y-3 mb-8">
                          {(pkg.options || "")
                            .split(",")
                            .map((opt: string, idx: number) => (
                              <li
                                key={idx}
                                className="flex items-start text-sm font-bold text-gray-700"
                              >
                                <Check className={`h-5 w-5 mr-3 shrink-0 ${isDepot ? 'text-amber-500' : 'text-[#006837]'}`} />{" "}
                                <span className="pt-0.5">{opt.trim()}</span>
                              </li>
                            ))}
                        </ul>
                      </div>
                      <div className="relative z-10 mt-auto pt-6 border-t border-black/5">
                        <div className={`text-3xl font-black mb-6 ${isDepot ? 'text-amber-600' : 'text-[#006837]'}`}>
                          {pkg.prix === 0 ? "Gratuit" : `${pkg.prix} FCFA`}
                          <span className="text-[11px] text-gray-500 block font-bold uppercase tracking-widest mt-1">
                            {pkg.dureeJours >= 99999 ? 'Accès à vie' : `Valable ${pkg.dureeJours} jours`}
                          </span>
                        </div>
                        <Button
                          onClick={() => handleCheckoutPackage(pkg.id)}
                          className={`w-full font-black h-14 rounded-2xl uppercase text-[11px] tracking-widest shadow-lg hover:shadow-xl transition-all ${
                            isDepot 
                              ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25 text-white' 
                              : 'bg-gradient-to-r from-[#006837] to-emerald-600 hover:from-[#004d29] hover:to-emerald-700 shadow-emerald-600/25 text-white'
                          }`}
                        >
                          {pkg.prix === 0 ? "Activer maintenant" : "Sélectionner ce pack"}
                        </Button>
                      </div>
                    </motion.div>
                    );
                  })}
                  {cvPackages.length === 0 && (
                    <div className="md:col-span-2 text-center p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                      Aucun pack disponible pour le moment.
                    </div>
                  )}
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Dialog open={showPackModal} onOpenChange={setShowPackModal}>
        <DialogContent className="sm:max-w-md bg-white rounded-[2rem] border-transparent shadow-2xl p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 border-b border-amber-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm text-amber-500 flex items-center justify-center mb-4">
               <Upload className="w-8 h-8" />
            </div>
            <DialogTitle className="text-xl font-black text-amber-950 uppercase tracking-wide">
              Pack d'importation CV
            </DialogTitle>
            <DialogDescription className="font-medium text-amber-700/80 mt-2 text-sm">
              Débloquez la possibilité d'importer votre CV pour postuler en un clic et être visible par les recruteurs.
            </DialogDescription>
          </div>
          <div className="p-6">
             <div className="space-y-4">
               {cvPackages.filter(pkg => pkg.type === 'DEPOT' || pkg.type === 'VISIBILITE').map((pkg) => (
                 <div key={pkg.id} className="border border-slate-200 rounded-2xl p-4 flex flex-col gap-3 hover:border-amber-300 hover:bg-amber-50/50 transition-colors cursor-pointer" onClick={() => handleCheckoutPackage(pkg.id)}>
                    <div className="flex justify-between items-start">
                       <div>
                         <h4 className="font-black text-slate-800 text-lg uppercase leading-tight">{pkg.nom}</h4>
                         <p className="text-xs font-bold text-slate-400 mt-0.5">{pkg.prix === 0 ? "Gratuit" : `${pkg.prix} FCFA`} <span className="font-medium text-[10px]">/ {pkg.dureeJours >= 99999 ? 'À vie' : `${pkg.dureeJours} Jours`}</span></p>
                       </div>
                       <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white rounded-full px-4 h-8 text-[10px] font-black uppercase tracking-wider">{pkg.prix === 0 ? 'Activer' : 'Acheter'}</Button>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{pkg.description}</p>
                 </div>
               ))}
               {cvPackages.filter(pkg => pkg.type === 'DEPOT' || pkg.type === 'VISIBILITE').length === 0 && (
                 <div className="text-center text-sm font-bold text-slate-400 py-4">Aucun pack disponible.</div>
               )}
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
