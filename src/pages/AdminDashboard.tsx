import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Users, 
  Briefcase, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Bell, 
  Image as ImageIcon,
  Radio,
  Clock,
  Send,
  Trash2,
  AlertCircle,
  Share2,
  Search,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/ui/RichTextEditor';

const HIGH_CPC_TITLES = [
  "Directeur Administratif et Financier (DAF)",
  "Chef de Projet Informatique Senior",
  "Expert Comptable / Auditeur Interne",
  "Ingénieur DevOps / Cloud (Remote)",
  "Consultant Expert en Stratégie d'Entreprise"
];

import { BoutiqueManager } from '@/components/admin/BoutiqueManager';
import { JobPackagesManager } from '@/components/admin/JobPackagesManager';
import { CvPackagesManager } from '@/components/admin/CvPackagesManager';

export function AdminDashboard() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let hasToken = false;
    try { hasToken = !!localStorage.getItem('token'); } catch {}
    if (!user && !hasToken) {
      navigate('/connexion');
    }
  }, [user, navigate]);

  const [stats, setStats] = useState({ users: 0, jobs: 0, applications: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);

  const [logoUrl, setLogoUrl] = useState('');
  const [defaultJobImage, setDefaultJobImage] = useState('');
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});
  const [whatsappChannelUrl, setWhatsappChannelUrl] = useState('');
  const [whatsappChannelEnabled, setWhatsappChannelEnabled] = useState(true);

  const [shareWhatsappEnabled, setShareWhatsappEnabled] = useState(true);
  const [shareFacebookEnabled, setShareFacebookEnabled] = useState(true);
  const [socialBrowserGuideEnabled, setSocialBrowserGuideEnabled] = useState(true);
  const [mobileMenuEnabled, setMobileMenuEnabled] = useState(true);
  const [headerSearchEnabled, setHeaderSearchEnabled] = useState(true);
  const [boutiquePromoEnabled, setBoutiquePromoEnabled] = useState(true);
  const [homeSearchEnabled, setHomeSearchEnabled] = useState(true);
  const [homeCvSliderEnabled, setHomeCvSliderEnabled] = useState(true);
  const [googleAuthEnabled, setGoogleAuthEnabled] = useState(true);
  const [appleAuthEnabled, setAppleAuthEnabled] = useState(true);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [notificationTitle, setNotificationTitle] = useState('Nouvelle opportunité !');
  const [emailSubject, setEmailSubject] = useState("Dernières offres d'emploi exclusives !");
  const [emailMessage, setEmailMessage] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobsPage, setJobsPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchJobsQuery, setSearchJobsQuery] = useState('');
  const [filterJobsCategory, setFilterJobsCategory] = useState("ALL");
  const JOBS_PER_PAGE = 20;
  const USERS_PER_PAGE = 20;
  const defaultExpiration = new Date();
  defaultExpiration.setDate(defaultExpiration.getDate() + 30);
  const defaultDateStr = defaultExpiration.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    titre: '', categorie: 'offre-demploi', sousCategorie: '', description: '', lieu: '',
    typeContrat: 'CDI', modeCandidature: 'email', emailContact: '', salaire: '', experience: '', niveauEtude: '',
    lienExterne: '', entreprise: '', logoUrl: '', imageUrl: '', sendOneSignal: false, tags: '', seoDescription: '',
    isPremium: false, premiumUntil: '', isUrgent: false, dateExpiration: defaultDateStr
  });

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

  const handleSiteLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
             setLogoUrl(data.url);
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

  const handleDefaultJobImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
             setDefaultJobImage(data.url);
             handleUpdateConfig('default_job_image', data.url);
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

  const handleCategoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, category: string) => {
    let file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("L'image est trop grande (maximum 5MB).");
        e.target.value = '';
        return;
      }

      try {
        const { default: imageCompression } = await import('browser-image-compression');
        const options = { maxSizeMB: 1, maxWidthOrHeight: 1200, useWebWorker: true };
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
             setCategoryImages(prev => ({ ...prev, [category]: data.url }));
             handleUpdateConfig(`default_job_image_${category}`, data.url);
          } else {
             alert("Erreur lors de l'upload de l'image pour la catégorie.");
          }
        } catch (err) {
          console.error(err);
          alert("Erreur réseau.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: any = { ...formData };
      if (!payload.dateExpiration) {
        payload.dateExpiration = null;
      } else {
        payload.dateExpiration = new Date(payload.dateExpiration).toISOString();
      }
      if (!payload.premiumUntil) {
        payload.premiumUntil = null;
      } else {
        payload.premiumUntil = new Date(payload.premiumUntil).toISOString();
      }
      
      // Remove UI only states
      const sendPush = payload.sendOneSignal;
      delete payload.sendOneSignal;
      
      const url = editingId ? `/api/offres/${editingId}` : '/api/offres';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const publishedJob = await res.json();
        if (sendPush) {
           const pushRes = await fetch('/api/onesignal/send', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
             body: JSON.stringify({ 
               title: 'Nouvelle opportunité !',
               message: `${formData.entreprise ? formData.entreprise + ' recrute : ' : ''}${formData.titre}`,
               url: `https://www.liggeybi.com/offre/${publishedJob?.slug || publishedJob?.id || ''}`
             })
           });
           if (!pushRes.ok) {
             const pushErr = await pushRes.json();
             alert("Offre publiée mais erreur OneSignal : " + (pushErr.error || "Paramètres manquants ou invalides"));
           } else {
             alert(editingId ? "Offre modifiée avec succès!" : "Offre publiée et notification poussée!");
           }
        } else {
           alert(editingId ? "Offre modifiée avec succès!" : "Offre publiée avec succès!");
        }
        setShowForm(false);
        setEditingId(null);
        setFormData({ titre: '', categorie: 'offre-demploi', sousCategorie: '', description: '', lieu: '', typeContrat: 'CDI', modeCandidature: 'email', emailContact: '', salaire: '', experience: '', niveauEtude: '', lienExterne: '', entreprise: '', logoUrl: '', imageUrl: '', sendOneSignal: false, tags: '', seoDescription: '', isPremium: false, premiumUntil: '', isUrgent: false, dateExpiration: '' });
        fetchAdminData();
      } else {
        alert("Erreur lors de la publication de l'offre");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateConfig = async (key: string, value: any) => {
    try {
      await fetch('/api/admin/config/site', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ key, value: String(value) })
      });
      alert('Configuration mise à jour !');
    } catch (err) {
      console.error(err);
    }
  };



  useEffect(() => {
    if (token) {
      fetchAdminData();
    }
  }, [token]);

  const fetchAdminData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [uRes, jRes, aRes, cRes] = await Promise.all([
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/offres', { headers }),
        fetch('/api/admin/candidatures', { headers }),
        fetch('/api/admin/config', { headers })
      ]);

      let uData = [];
      let jData = [];
      let aData = [];

      if (uRes.ok) { uData = await uRes.json(); setUsers(uData); }
      if (jRes.ok) { 
        jData = await jRes.json(); 
        setJobs(jData.filter((j: any) => j.categorie !== 'canada' && j.categorie !== 'europe')); 
      }
      if (aRes.ok) { aData = await aRes.json(); setApplications(aData); }
      if (cRes.ok) {  
        const { siteConfigs } = await cRes.json(); 
        const configMap = siteConfigs.reduce((acc: any, curr: any) => {
          acc[curr.key] = curr.value;
          return acc;
        }, {});
        
        const catImages: Record<string, string> = {};
        Object.keys(configMap).forEach(k => {
          if (k.startsWith('default_job_image_')) {
             catImages[k.replace('default_job_image_', '')] = configMap[k];
          }
        });
        setCategoryImages(catImages);
        
        if (configMap.logoUrl) setLogoUrl(configMap.logoUrl);
        if (configMap.default_job_image) setDefaultJobImage(configMap.default_job_image);
        if (configMap.whatsapp_channel_url) setWhatsappChannelUrl(configMap.whatsapp_channel_url);
        if (configMap.whatsapp_channel_enabled === 'false') setWhatsappChannelEnabled(false);
        if (configMap.share_whatsapp_enabled === 'false') setShareWhatsappEnabled(false);
        if (configMap.share_facebook_enabled === 'false') setShareFacebookEnabled(false);
        if (configMap.social_browser_guide_enabled === 'false') setSocialBrowserGuideEnabled(false);
        if (configMap.mobile_menu_enabled === 'false') setMobileMenuEnabled(false);
        if (configMap.header_search_enabled === 'false') setHeaderSearchEnabled(false);
        if (configMap.boutique_promo_enabled === 'false') setBoutiquePromoEnabled(false);
        if (configMap.home_search_enabled === 'false') setHomeSearchEnabled(false);
        if (configMap.home_cv_slider_enabled === 'false') setHomeCvSliderEnabled(false);
        if (configMap.google_auth_enabled === 'false') setGoogleAuthEnabled(false);
        if (configMap.apple_auth_enabled === 'false') setAppleAuthEnabled(false);
      }
      
      setStats({
        users: uData.length,
        jobs: jData.length,
        applications: aData.length
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadBackup = async () => {
    try {
      const res = await fetch('/api/admin/backup-db', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
         const blob = await res.blob();
         const url = window.URL.createObjectURL(blob);
         const a = document.createElement('a');
         a.href = url;
         a.download = `backup_liggeybi_${new Date().toISOString().split('T')[0]}.db`;
         document.body.appendChild(a);
         a.click();
         a.remove();
      } else {
         alert('Erreur lors du téléchargement de la sauvegarde.');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur de requête.');
    }
  };

  const approveJob = async (id: string) => {
    try {
      await fetch(`/api/admin/offres/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const rejectJob = async (id: string) => {
    try {
      await fetch(`/api/admin/offres/${id}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteJob = async (id: string) => {
    try {
       await fetch(`/api/admin/offres/${id}`, {
         method: 'DELETE',
         headers: { Authorization: `Bearer ${token}` }
       });
       fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const togglePremium = async (id: string, currentPremium: boolean) => {
    try {
      const isPremium = !currentPremium;
      let premiumUntil = null;
      if (isPremium) {
         premiumUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      }
      await fetch(`/api/admin/offres/${id}`, {
         method: 'PUT',
         headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
         body: JSON.stringify({ isPremium, premiumUntil })
      });
      fetchAdminData();
    } catch (err) { console.error(err); }
  };

  const toggleCvPremium = async (userId: string, currentPremium: boolean) => {
    try {
      const isPremium = !currentPremium;
      let premiumUntil = null;
      if (isPremium) {
         premiumUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      }
      await fetch(`/api/admin/users/${userId}/premium`, {
         method: 'PUT',
         headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
         body: JSON.stringify({ isPremium, premiumUntil })
      });
      fetchAdminData();
    } catch (err) { console.error(err); }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cet utilisateur ? Cette action est irréversible.")) return;
    try {
       await fetch(`/api/admin/users/${id}`, {
         method: 'DELETE',
         headers: { Authorization: `Bearer ${token}` }
       });
       fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleJobSelection = (id: string) => {
    setSelectedJobs(prev => prev.includes(id) ? prev.filter(jobId => jobId !== id) : [...prev, id]);
  };

  const toggleUserSelection = (id: string) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(userId => userId !== id) : [...prev, id]);
  };

  const selectAllJobs = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedJobs(jobs.map((j: any) => j.id));
    else setSelectedJobs([]);
  };

  const selectAllUsers = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedUsers(users.map((u: any) => u.id));
    else setSelectedUsers([]);
  };

  const bulkApproveJobs = async () => {
    if (!confirm(`Approuver ${selectedJobs.length} offre(s) ?`)) return;
    try {
      await Promise.all(selectedJobs.map(id => fetch(`/api/admin/offres/${id}/approve`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })));
      setSelectedJobs([]);
      fetchAdminData();
    } catch(err) { console.error(err); }
  };

  const bulkDeleteJobs = async () => {
    if (!confirm(`Supprimer ${selectedJobs.length} offre(s) ?`)) return;
    try {
      await Promise.all(selectedJobs.map(id => fetch(`/api/admin/offres/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })));
      setSelectedJobs([]);
      fetchAdminData();
    } catch(err) { console.error(err); }
  };

  const bulkDeleteUsers = async () => {
    if (!confirm(`Supprimer ${selectedUsers.length} utilisateur(s) ?`)) return;
    try {
      await Promise.all(selectedUsers.map(id => fetch(`/api/admin/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })));
      setSelectedUsers([]);
      fetchAdminData();
    } catch(err) { console.error(err); }
  };

  const sendOneSignalNotification = async () => {
    if (!notificationMsg) return;
    try {
      const res = await fetch('/api/onesignal/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          title: notificationTitle || 'Notification Liggeybi',
          message: notificationMsg,
          url: 'https://www.liggeybi.com'
        })
      });
      if (res.ok) {
        alert('Notification envoyée !');
        setNotificationMsg('');
      } else {
        const errData = await res.json();
        alert("Erreur lors de l'envois: " + (errData.error || "Paramètres invalides"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const sendEmailAlert = async () => {
    if (!confirm("Voulez-vous vraiment envoyer un email à tous les candidats inscrits ?")) return;
    setIsSendingEmail(true);
    try {
      const res = await fetch('/api/admin/send-email-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ subject: emailSubject, customMessage: emailMessage })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Emails envoyés avec succès.');
        setEmailMessage('');
      } else {
        alert("Erreur lors de l'envoi : " + (data.error || 'Erreur inconnue'));
      }
    } catch (err) {
      console.error(err);
      alert('Erreur réseau lors de l\'envoi des emails.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (user?.role !== 'ADMIN') return <div className="p-20 text-center font-bold">ACCÈS REFUSÉ. RÉSERVÉ À L'ADMINISTRATEUR.</div>;

  const filteredJobs = jobs.filter(job => 
    (filterJobsCategory === 'ALL' || job.categorie === filterJobsCategory) &&
    (job.titre.toLowerCase().includes(searchJobsQuery.toLowerCase()) || (job.contactEmail || '').toLowerCase().includes(searchJobsQuery.toLowerCase()) || (job.lieu || '').toLowerCase().includes(searchJobsQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50/50 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tighter">Panel Admin Pro</h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs flex items-center mt-2">
              <Settings className="mr-2 h-4 w-4" /> Administration Centrale • LIGGEYBI
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
             <Button onClick={() => navigate('/admin/articles')} className="bg-[#cc0000] hover:bg-[#990000] text-white rounded-2xl h-12 px-6 font-black uppercase text-[10px] tracking-widest shadow-md">
                ✍️ Gérer Articles (Destinations)
             </Button>
             <Button onClick={() => navigate('/admin/candidats')} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-12 px-6 font-black uppercase text-[10px] tracking-widest shadow-md">
                👥 Gérer Candidats (CVs)
             </Button>
             <Button onClick={() => navigate('/admin/formations')} className="bg-[#006837] hover:bg-[#004d29] text-white rounded-2xl h-12 px-6 font-black uppercase text-[10px] tracking-widest shadow-md">
                🎓 Gérer Formations
             </Button>
             <Button onClick={downloadBackup} className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-12 px-6 font-black uppercase text-[10px] tracking-widest shadow-md">
                📥 Sauvegarder DB
             </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
           {[
             { label: 'Utilisateurs', value: users.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
             { label: 'Offres Totales', value: jobs.length, icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50' },
             { label: 'Candidatures', value: applications.length, icon: Bell, color: 'text-orange-600', bg: 'bg-orange-50' }
           ].map((stat, i) => (
             <motion.div 
               key={i} 
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
               className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between"
             >
                <div>
                   <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
                   <h3 className="text-3xl font-black">{stat.value}</h3>
                </div>
                <div className={`h-14 w-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="h-7 w-7" />
                </div>
             </motion.div>
           ))}
        </div>

        <Tabs defaultValue="offres" className="w-full">
           <TabsList className="bg-white p-1 rounded-2xl border border-gray-100 shadow-sm h-14 mb-8 overflow-x-auto">
             <TabsTrigger value="offres" className="rounded-xl px-6 font-black uppercase text-xs data-[state=active]:bg-gray-900 data-[state=active]:text-white">Offres & Approbation</TabsTrigger>
             <TabsTrigger value="notifs" className="rounded-xl px-6 font-black uppercase text-xs data-[state=active]:bg-gray-900 data-[state=active]:text-white">OneSignal Notifications</TabsTrigger>
             <TabsTrigger value="config" className="rounded-xl px-6 font-black uppercase text-xs data-[state=active]:bg-gray-900 data-[state=active]:text-white">Configuration Site</TabsTrigger>
             <TabsTrigger value="users" className="rounded-xl px-6 font-black uppercase text-xs data-[state=active]:bg-gray-900 data-[state=active]:text-white">Gestion Users</TabsTrigger>
             <TabsTrigger value="packages" className="rounded-xl px-6 font-black uppercase text-xs data-[state=active]:bg-gray-900 data-[state=active]:text-white">Packages Recruteurs</TabsTrigger>
             <TabsTrigger value="boutique" className="rounded-xl px-6 font-black uppercase text-xs data-[state=active]:bg-gray-900 data-[state=active]:text-white">Boutique & Promo</TabsTrigger>
           </TabsList>

           <TabsContent value="offres" className="space-y-6">
              <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                <h2 className="font-black uppercase text-lg">Publier / Gérer les Offres</h2>
                <Button onClick={() => setShowForm(!showForm)} className="bg-blue-700 hover:bg-blue-800 rounded-xl font-bold uppercase text-xs">
                  {showForm ? 'Fermer le formulaire' : 'Publier une Offre'}
                </Button>
              </div>

              <AnimatePresence>
                {showForm && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <Card className="rounded-[2.5rem] border-blue-100 shadow-2xl shadow-blue-900/5 p-4 mb-8">
                      <CardHeader>
                        <CardTitle className="text-2xl font-black uppercase tracking-tight">Nouvelle Annonce (Admin)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleSubmitOffer} className="grid md:grid-cols-2 gap-6">
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
                            <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Entreprise</Label>
                            <Input value={formData.entreprise} onChange={e => setFormData({...formData, entreprise: e.target.value})} placeholder="Ex: Liggeybi" className="h-12 rounded-xl bg-gray-50 border-none px-4" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Catégorie</Label>
                            <select value={formData.categorie} onChange={e => setFormData({...formData, categorie: e.target.value})} className="w-full h-12 rounded-xl bg-gray-50 border-none px-4 text-sm font-bold outline-none">
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
                          <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Lieu</Label>
                            <select value={formData.lieu} onChange={e => setFormData({...formData, lieu: e.target.value})} className="flex h-12 w-full items-center justify-between rounded-xl bg-gray-50 px-4 py-2 border-none ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 text-sm">
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
                            <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Logo Entreprise (Image)</Label>
                            <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'logoUrl')} className="h-12 rounded-xl bg-gray-50 border-none px-4 py-3" />
                            {formData.logoUrl && <img src={formData.logoUrl} className="h-12 mt-2 object-contain bg-white p-1 rounded" alt="Preview" />}
                            {Array.from(new Set(jobs.map((o: any) => o.logoUrl).filter(Boolean))).length > 0 && (
                              <div className="mt-2">
                                <Label className="text-[10px] text-gray-400 uppercase font-bold mb-1">Historique :</Label>
                                <div className="flex gap-2 flex-wrap">
                                  {Array.from(new Set(jobs.map((o: any) => o.logoUrl).filter(Boolean))).slice(0, 8).map((url, idx) => (
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
                          <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Image Couverture (Optionnel)</Label>
                            <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'imageUrl')} className="h-12 rounded-xl bg-gray-50 border-none px-4 py-3" />
                            {formData.imageUrl && <img src={formData.imageUrl} className="h-12 mt-2 object-cover rounded" alt="Preview" />}
                            {Array.from(new Set(jobs.map((o: any) => o.imageUrl).filter(Boolean))).length > 0 && (
                              <div className="mt-2">
                                <Label className="text-[10px] text-gray-400 uppercase font-bold mb-1">Historique :</Label>
                                <div className="flex gap-2 flex-wrap">
                                  {Array.from(new Set(jobs.map((o: any) => o.imageUrl).filter(Boolean))).slice(0, 8).map((url, idx) => (
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
                            <Input value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} placeholder="Ex: React, Node.js, Remote, CDI" className="h-12 rounded-xl bg-gray-50 border-none px-4" />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Description SEO (Méta description courte)</Label>
                            <Textarea value={formData.seoDescription} onChange={e => setFormData({...formData, seoDescription: e.target.value})} placeholder="Ex: Opportunité de développeur React chez..." className="h-20 rounded-xl bg-gray-50 border-none px-4 py-3 resize-none" />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Description détaillée</Label>
                            <RichTextEditor value={formData.description} onChange={(val) => setFormData({...formData, description: val})} />
                          </div>
                          {formData.categorie === 'offre-demploi' && (
                            <>
                              <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Type de Contrat</Label>
                                <select value={formData.typeContrat} onChange={e => setFormData({...formData, typeContrat: e.target.value})} className="w-full h-12 rounded-xl bg-gray-50 border-none px-4 text-sm font-bold outline-none">
                                  <option>CDI</option><option>CDD</option><option>Stage</option><option>Freelance</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Expérience</Label>
                                <Input value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} placeholder="Ex: 2 ans" className="h-12 rounded-xl bg-gray-50 border-none px-4" />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Niveau d'étude</Label>
                                <Input value={formData.niveauEtude} onChange={e => setFormData({...formData, niveauEtude: e.target.value})} placeholder="Ex: Bac+3" className="h-12 rounded-xl bg-gray-50 border-none px-4" />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Date Limite de dépôt *</Label>
                                <Input required type="date" value={formData.dateExpiration} onChange={e => setFormData({...formData, dateExpiration: e.target.value})} className="h-12 rounded-xl bg-gray-50 border-none px-4" />
                              </div>
                            </>
                          )}
                          <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Salaire / Montant</Label>
                            <Input value={formData.salaire} onChange={e => setFormData({...formData, salaire: e.target.value})} placeholder="Ex: 500 000 FCFA ou À débattre" className="h-12 rounded-xl bg-gray-50 border-none px-4" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Type de Candidature</Label>
                            <select value={formData.modeCandidature} onChange={e => setFormData({...formData, modeCandidature: e.target.value})} className="w-full h-12 rounded-xl bg-gray-50 border-none px-4 text-sm font-bold outline-none">
                              <option value="email">Par Email</option><option value="lien">Lien Externe</option><option value="interne">Sur le site</option>
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

                          <div className="space-y-2 md:col-span-2 flex items-center bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                            <input type="checkbox" id="sendPush" checked={formData.sendOneSignal} onChange={e => setFormData({...formData, sendOneSignal: e.target.checked})} className="mr-3 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                            <Label htmlFor="sendPush" className="text-sm font-black uppercase tracking-widest text-blue-900 cursor-pointer">Envoyer une notification Push OneSignal</Label>
                          </div>
                          
                          <div className="space-y-2 md:col-span-2 flex items-center bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                            <input type="checkbox" id="isPremium" checked={formData.isPremium} onChange={e => setFormData({...formData, isPremium: e.target.checked})} className="mr-3 h-5 w-5 rounded border-gray-300 text-amber-600 focus:ring-amber-600" />
                            <Label htmlFor="isPremium" className="text-sm font-black uppercase tracking-widest text-amber-900 cursor-pointer">Offre Premium (Slider Haut de page)</Label>
                          </div>
                          
                          {formData.isPremium && (
                            <div className="space-y-2 md:col-span-2">
                               <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Premium Jusqu'au (Optionnel)</Label>
                               <Input type="date" value={formData.premiumUntil} onChange={e => setFormData({...formData, premiumUntil: e.target.value})} className="h-12 rounded-xl bg-gray-50 border-none px-4" />
                            </div>
                          )}

                          <div className="space-y-2 md:col-span-2 flex items-center bg-red-50/50 p-4 rounded-xl border border-red-100">
                            <input type="checkbox" id="isUrgent" checked={formData.isUrgent} onChange={e => setFormData({...formData, isUrgent: e.target.checked})} className="mr-3 h-5 w-5 rounded border-gray-300 text-red-600 focus:ring-red-600" />
                            <Label htmlFor="isUrgent" className="text-sm font-black uppercase tracking-widest text-red-900 cursor-pointer">Badge Urgent</Label>
                          </div>

                          <div className="space-y-2 md:col-span-2 flex justify-end mt-4">
                             <Button type="submit" disabled={isSubmitting} className="h-14 px-12 bg-gray-900 hover:bg-black rounded-2xl font-black uppercase shadow-xl transition-transform active:scale-95">
                                {isSubmitting ? 'Publication...' : <><Send className="mr-2 h-5 w-5" /> Publier l'offre</>}
                             </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {selectedJobs.length > 0 && (
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-4 z-10 shadow-lg shadow-blue-900/5">
                  <span className="text-sm font-black text-blue-900 flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5" /> {selectedJobs.length} offre(s) sélectionnée(s)
                  </span>
                  <div className="flex gap-2">
                    <Button onClick={bulkApproveJobs} size="sm" className="bg-green-600 hover:bg-green-700 font-bold uppercase text-[10px] rounded-xl px-4 py-2 h-auto shadow-sm">
                      Approuver
                    </Button>
                    <Button onClick={bulkDeleteJobs} size="sm" className="bg-red-500 hover:bg-red-600 text-white font-bold uppercase text-[10px] rounded-xl px-4 py-2 h-auto shadow-sm">
                      Supprimer
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4 bg-gray-50 px-6 py-4 rounded-3xl border border-gray-100 mt-4">
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="selectAllJobsCheckbox" onChange={selectAllJobs} checked={filteredJobs.length > 0 && selectedJobs.length === filteredJobs.length} className="w-5 h-5 rounded-md border-gray-300 text-[#006837] focus:ring-[#006837] cursor-pointer" />
                  <Label htmlFor="selectAllJobsCheckbox" className="text-xs font-black uppercase tracking-widest text-gray-500 cursor-pointer">Tout sélectionner</Label>
                </div>
                
                <div className="flex items-center w-full md:w-auto gap-4">
                  <Input 
                    placeholder="Rechercher une offre..." 
                    className="h-10 rounded-xl bg-white border-gray-200"
                    value={searchJobsQuery}
                    onChange={e => setSearchJobsQuery(e.target.value)}
                  />
                  <select 
                    className="h-10 rounded-xl bg-white border border-gray-200 px-4 text-sm font-bold outline-none"
                    value={filterJobsCategory}
                    onChange={e => setFilterJobsCategory(e.target.value)}
                  >
                    <option value="ALL">Toutes les offres</option>
                    <option value="offre-demploi">Offres d'Emploi</option>
                    <option value="bourses">Bourse d'études</option>
                    <option value="concours">Concours</option>
                    <option value="formation">Formation</option>
                    <option value="stage">Stage</option>
                    <option value="candidature-spontanee">Candidature spontanée</option><option value="europe">Europe (Études & Immigration)</option><option value="canada">Canada (Programmes & Immigration)</option>
                    <option value="finance-business">Finance & Business</option>
                    <option value="emploi-international">Emploi international</option>
                    <option value="appels-doffres">Appels d'offres</option>
                  </select>
                </div>
                <span className="text-xs font-bold text-gray-400 whitespace-nowrap">{filteredJobs.length} Offres</span>
              </div>

              <div className="grid gap-4">
                 {filteredJobs.slice((jobsPage - 1) * JOBS_PER_PAGE, jobsPage * JOBS_PER_PAGE).map((job, i) => (
                    <motion.div 
                       key={job.id} 
                       initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                       className={`bg-white p-6 rounded-3xl border ${selectedJobs.includes(job.id) ? 'border-blue-300 bg-blue-50/10 shadow-md' : 'border-gray-100 shadow-sm'} flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all`}
                    >
                       <div className="flex items-center space-x-4">
                          <input type="checkbox" checked={selectedJobs.includes(job.id)} onChange={() => toggleJobSelection(job.id)} className="w-5 h-5 rounded-md border-gray-300 text-[#006837] focus:ring-[#006837] cursor-pointer" />
                          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${job.statut === 'approuve' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                             {job.statut === 'approuve' ? <CheckCircle className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                          </div>
                          <div className="min-w-0">
                             <h3 className="font-black uppercase text-gray-900 truncate">{job.titre}</h3>
                             <p className="text-xs font-bold text-blue-600 truncate">{job.lieu} • {job.categorie}</p>
                             <p className="text-[10px] text-gray-400 font-medium truncate">Posté par: {job.contactEmail || 'Anonyme'}</p>
                          </div>
                       </div>
                       <div className="flex flex-wrap md:flex-nowrap items-center gap-2">
                           <Button onClick={() => {
                              setFormData({
                                 titre: job.titre || '', categorie: job.categorie || 'offre-demploi', sousCategorie: job.sousCategorie || '', description: job.description || '', lieu: job.lieu || '',
                                 typeContrat: job.typeContrat || 'CDI', modeCandidature: job.modeCandidature || 'interne', emailContact: job.emailContact || '',
                                 salaire: job.salaire || '', experience: job.experience || '', niveauEtude: job.niveauEtude || '',
                                 lienExterne: job.lienExterne || '', entreprise: job.entreprise || '', logoUrl: job.logoUrl || '', imageUrl: job.imageUrl || '', sendOneSignal: false, tags: job.tags || '', seoDescription: job.seoDescription || '',
                                 isPremium: job.isPremium || false, premiumUntil: job.premiumUntil ? new Date(job.premiumUntil).toISOString().split('T')[0] : '', isUrgent: job.isUrgent || false,
                                 dateExpiration: job.dateExpiration ? new Date(job.dateExpiration).toISOString().split('T')[0] : ''
                              });
                              setEditingId(job.id);
                              setShowForm(true);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                           }} size="sm" className="bg-blue-100 text-blue-700 hover:bg-blue-200 font-bold uppercase text-[10px] rounded-xl px-4">Modifier</Button>
                           {job.statut !== 'approuve' && (
                             <Button onClick={() => approveJob(job.id)} size="sm" className="bg-green-600 hover:bg-green-700 font-bold uppercase text-[10px] rounded-xl px-4">Approuver</Button>
                           )}
                           <Button onClick={() => togglePremium(job.id, job.isPremium)} size="sm" className={`${job.isPremium ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} font-bold uppercase text-[10px] rounded-xl px-4`}>
                              Premium
                           </Button>
                           <Button onClick={() => rejectJob(job.id)} variant="outline" size="sm" className="text-amber-600 border-amber-100 hover:bg-amber-50 font-bold uppercase text-[10px] rounded-xl px-4">Rejeter</Button>
                           <Button onClick={() => deleteJob(job.id)} variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 rounded-xl"><Trash2 className="h-4 w-4" /></Button>
                       </div>
                    </motion.div>
                 ))}
              </div>

              {filteredJobs.length > JOBS_PER_PAGE && (
                <div className="flex items-center justify-center space-x-4 mt-8">
                  <Button 
                    variant="outline" 
                    onClick={() => setJobsPage(p => Math.max(1, p - 1))}
                    disabled={jobsPage === 1}
                    className="rounded-xl font-bold uppercase text-xs"
                  >
                    Précédent
                  </Button>
                  <span className="text-sm font-bold text-gray-500">
                    Page {jobsPage} sur {Math.ceil(filteredJobs.length / JOBS_PER_PAGE)}
                  </span>
                  <Button 
                    variant="outline" 
                    onClick={() => setJobsPage(p => Math.min(Math.ceil(filteredJobs.length / JOBS_PER_PAGE), p + 1))}
                    disabled={jobsPage >= Math.ceil(filteredJobs.length / JOBS_PER_PAGE)}
                    className="rounded-xl font-bold uppercase text-xs"
                  >
                    Suivant
                  </Button>
                </div>
              )}
           </TabsContent>

           <TabsContent value="notifs">
              <Card className="rounded-[2.5rem] border-gray-100 shadow-sm p-8">
                 <div className="max-w-2xl mx-auto space-y-6">
                    <div className="text-center">
                       <Radio className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                       <h2 className="text-2xl font-black uppercase">OneSignal Broadcast</h2>
                       <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Envoyez un message direct à tous vos abonnés Push</p>
                    </div>
                    <div className="space-y-4 pt-6">
                       <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Titre de la notification</Label>
                       <Input 
                          value={notificationTitle}
                          onChange={e => setNotificationTitle(e.target.value)}
                          placeholder="Ex: Alerte Emploi !"
                          className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold"
                       />
                       <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Message de la notification</Label>
                       <Textarea 
                          value={notificationMsg}
                          onChange={e => setNotificationMsg(e.target.value)}
                          placeholder="Entrez votre message ici..."
                          className="min-h-[120px] rounded-2xl bg-gray-50 border-none p-6 font-bold text-lg"
                       />
                       <Button 
                         onClick={sendOneSignalNotification}
                         className="w-full h-16 bg-blue-700 hover:bg-blue-800 rounded-3xl font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-700/20"
                       >
                          Diffuser la notification <Send className="ml-3 h-5 w-5" />
                       </Button>
                    </div>
                 </div>
              </Card>

              <Card className="rounded-[2.5rem] border-gray-100 shadow-sm p-8 mt-8">
                 <div className="max-w-2xl mx-auto space-y-6">
                    <div className="text-center">
                       <Send className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                       <h2 className="text-2xl font-black uppercase">Newsletter (Alerte Emplois)</h2>
                       <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Envoyez un e-mail à tous vos candidats</p>
                    </div>
                    <div className="space-y-4 pt-6">
                       <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Sujet de l'email</Label>
                       <Input 
                          value={emailSubject}
                          onChange={e => setEmailSubject(e.target.value)}
                          className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold"
                       />
                       <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Message Personnalisé (Optionnel)</Label>
                       <Textarea 
                          value={emailMessage}
                          onChange={e => setEmailMessage(e.target.value)}
                          placeholder="Bonjour chers candidats..."
                          className="min-h-[120px] rounded-2xl bg-gray-50 border-none p-6 font-bold text-lg"
                       />
                       <div className="p-4 bg-indigo-50 text-indigo-800 rounded-xl text-xs font-bold mb-4 border border-indigo-100">
                         ℹ️ Le système attachera automatiquement la liste des 5 dernières offres validées au bas de ce message.
                       </div>
                       <Button 
                         onClick={sendEmailAlert}
                         disabled={isSendingEmail}
                         className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 rounded-3xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-indigo-600/20 text-white flex items-center justify-center"
                       >
                          {isSendingEmail ? 'Envoi en cours...' : <><Send className="mr-3 h-5 w-5" /> Envoyer Email Groupé</>}
                       </Button>
                    </div>
                 </div>
              </Card>
           </TabsContent>

           <TabsContent value="config">
              <div className="grid md:grid-cols-2 gap-8">
                 <Card className="rounded-[2.5rem] border-gray-100 shadow-sm p-8">
                    <h3 className="text-xl font-black uppercase mb-6 flex items-center"><ImageIcon className="mr-3 h-6 w-6" /> Logo & Branding</h3>
                    <div className="space-y-4">
                       <Label className="text-xs font-black uppercase tracking-widest text-gray-400">URL ou Image Logo du site</Label>
                       <div className="flex flex-col space-y-2">
                         <Input type="file" accept="image/*" onChange={handleSiteLogoUpload} className="h-12 rounded-xl bg-gray-50 border-none px-4 py-3" />
                         <div className="flex items-center text-xs font-bold text-gray-400">ou via URL :</div>
                         <Input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://..." className="h-14 rounded-2xl bg-gray-50 border-none px-6" />
                       </div>
                       {logoUrl && <img src={logoUrl} className="h-16 mt-2 object-contain" alt="Logo preview" />}
                       <Button onClick={() => handleUpdateConfig('logoUrl', logoUrl)} className="w-full h-12 rounded-xl bg-gray-900 font-black uppercase text-xs text-white">Mettre à jour le logo</Button>
                    </div>
                 </Card>

                 <Card className="rounded-[2.5rem] border-gray-100 shadow-sm p-8">
                    <h3 className="text-xl font-black uppercase mb-6 flex items-center"><ImageIcon className="mr-3 h-6 w-6" /> Image Par Défaut (Globale)</h3>
                    <div className="space-y-4">
                       <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Image pour les offres sans illustration</Label>
                       <div className="flex flex-col space-y-2">
                         <Input type="file" accept="image/*" onChange={handleDefaultJobImageUpload} className="h-12 rounded-xl bg-gray-50 border-none px-4 py-3" />
                         <div className="flex items-center text-xs font-bold text-gray-400">ou via URL :</div>
                         <Input value={defaultJobImage} onChange={e => setDefaultJobImage(e.target.value)} placeholder="https://..." className="h-14 rounded-2xl bg-gray-50 border-none px-6" />
                       </div>
                       {defaultJobImage && <img src={defaultJobImage} className="h-32 mt-2 object-cover rounded-xl" alt="Default Job preview" />}
                       <Button onClick={() => handleUpdateConfig('default_job_image', defaultJobImage)} className="w-full h-12 rounded-xl bg-gray-900 font-black uppercase text-xs text-white">Mettre à jour l'image</Button>
                    </div>
                 </Card>

                 <Card className="rounded-[2.5rem] border-gray-100 shadow-sm p-8 md:col-span-2">
                    <h3 className="text-xl font-black uppercase mb-6 flex items-center"><ImageIcon className="mr-3 h-6 w-6" /> Images par défaut par catégorie</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {Object.entries({
                         'offre-demploi': "Offre d'emploi",
                         'bourses': "Bourses d'études",
                         'concours': "Concours",
                         'formation': "Formation",
                         'emploi-international': "Emploi International",
                         'candidature-spontanee': "Candidature Spontanée",
                         'appels-doffres': "Appels d'Offres",
                         'finance-business': "Finance & Business",
                         'stage': "Stage"
                       }).map(([cat, label]) => (
                         <div key={cat} className="space-y-3 border border-gray-100 p-4 rounded-2xl bg-gray-50/50">
                           <Label className="text-xs font-black uppercase tracking-widest text-gray-700">{label}</Label>
                           <Input type="file" accept="image/*" onChange={e => handleCategoryImageUpload(e, cat)} className="h-10 rounded-xl bg-white border-gray-200 px-3 py-2 text-xs" />
                           <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-gray-400">ou URL:</span>
                           </div>
                           <Input value={categoryImages[cat] || ''} onChange={e => setCategoryImages(prev => ({...prev, [cat]: e.target.value}))} placeholder="https://..." className="h-10 rounded-xl bg-white border-gray-200 px-3 text-xs" />
                           {categoryImages[cat] && <img src={categoryImages[cat]} className="h-20 w-full object-cover rounded-lg mt-2" alt={`${label} preview`} />}
                           <Button onClick={() => handleUpdateConfig(`default_job_image_${cat}`, categoryImages[cat] || "")} className="w-full h-10 rounded-xl bg-emerald-700 hover:bg-emerald-800 font-bold uppercase text-[10px] text-white mt-2">Sauvegarder</Button>
                         </div>
                       ))}
                    </div>
                 </Card>
                 <Card className="rounded-[2.5rem] border-gray-100 shadow-sm p-8 md:col-span-2">
                    <h3 className="text-xl font-black uppercase mb-6 flex items-center"><Send className="mr-3 h-6 w-6" /> Canal WhatsApp</h3>
                    <div className="space-y-6">
                       <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                          <div>
                             <p className="font-black uppercase text-xs">Bannière Canal WhatsApp</p>
                             <p className="text-[10px] text-gray-400 font-bold">Afficher ou masquer la bannière sur les articles</p>
                          </div>
                          <Button 
                             onClick={() => {
                               const newState = !whatsappChannelEnabled;
                               setWhatsappChannelEnabled(newState);
                               handleUpdateConfig('whatsapp_channel_enabled', newState);
                             }}
                             className={`h-10 px-6 rounded-xl font-black uppercase text-[10px] ${whatsappChannelEnabled ? 'bg-green-600' : 'bg-red-600'}`}
                          >
                             {whatsappChannelEnabled ? 'Activé' : 'Désactivé'}
                          </Button>
                       </div>
                       
                       <div className="space-y-4">
                          <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Lien du canal WhatsApp</Label>
                          <Input 
                            value={whatsappChannelUrl} 
                            onChange={e => setWhatsappChannelUrl(e.target.value)} 
                            placeholder="https://whatsapp.com/channel/..." 
                            className="h-14 rounded-2xl bg-gray-50 border-none px-6" 
                          />
                          <Button onClick={() => handleUpdateConfig('whatsapp_channel_url', whatsappChannelUrl)} className="w-full h-12 rounded-xl bg-gray-900 font-black uppercase text-xs text-white">Mettre à jour le lien WhatsApp</Button>
                       </div>
                    </div>
                 </Card>

                 <Card className="rounded-[2.5rem] border-gray-100 shadow-sm p-8 md:col-span-2">
                    <h3 className="text-xl font-black uppercase mb-6 flex items-center"><Share2 className="mr-3 h-6 w-6" /> Boutons de Partage</h3>
                    <div className="space-y-6">
                       <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                          <div>
                             <p className="font-black uppercase text-xs">Partage WhatsApp</p>
                             <p className="text-[10px] text-gray-400 font-bold">Afficher le bouton de partage WhatsApp</p>
                          </div>
                          <Button 
                             onClick={() => {
                               const newState = !shareWhatsappEnabled;
                               setShareWhatsappEnabled(newState);
                               handleUpdateConfig('share_whatsapp_enabled', newState);
                             }}
                             className={`h-10 px-6 rounded-xl font-black uppercase text-[10px] ${shareWhatsappEnabled ? 'bg-green-600' : 'bg-red-600'}`}
                          >
                             {shareWhatsappEnabled ? 'Activé' : 'Désactivé'}
                          </Button>
                       </div>

                       <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                          <div>
                             <p className="font-black uppercase text-xs">Partage Facebook</p>
                             <p className="text-[10px] text-gray-400 font-bold">Afficher le bouton de partage Facebook</p>
                          </div>
                          <Button 
                             onClick={() => {
                               const newState = !shareFacebookEnabled;
                               setShareFacebookEnabled(newState);
                               handleUpdateConfig('share_facebook_enabled', newState);
                             }}
                             className={`h-10 px-6 rounded-xl font-black uppercase text-[10px] ${shareFacebookEnabled ? 'bg-green-600' : 'bg-red-600'}`}
                          >
                             {shareFacebookEnabled ? 'Activé' : 'Désactivé'}
                          </Button>
                       </div>

                       <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                          <div>
                             <p className="font-black uppercase text-xs">Pop-up Navigateur Sociaux</p>
                             <p className="text-[10px] text-gray-400 font-bold">Encourager à ouvrir dans un navigateur externe depuis FB/WA/Insta</p>
                          </div>
                          <Button 
                             onClick={() => {
                               const newState = !socialBrowserGuideEnabled;
                               setSocialBrowserGuideEnabled(newState);
                               handleUpdateConfig('social_browser_guide_enabled', newState);
                             }}
                             className={`h-10 px-6 rounded-xl font-black uppercase text-[10px] ${socialBrowserGuideEnabled ? 'bg-green-600' : 'bg-red-600'}`}
                          >
                             {socialBrowserGuideEnabled ? 'Activé' : 'Désactivé'}
                          </Button>
                       </div>
                    </div>
                 </Card>

                 <Card className="rounded-[2.5rem] border-gray-100 shadow-sm p-8 md:col-span-2">
                    <h3 className="text-xl font-black uppercase mb-6 flex items-center"><Search className="mr-3 h-6 w-6" /> Authentification</h3>
                    <div className="space-y-6">
                       <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                          <div>
                             <p className="font-black uppercase text-xs">Connexion Google</p>
                             <p className="text-[10px] text-gray-400 font-bold">Activer le bouton de connexion via Google</p>
                          </div>
                          <Button 
                             onClick={() => {
                               const newState = !googleAuthEnabled;
                               setGoogleAuthEnabled(newState);
                               handleUpdateConfig('google_auth_enabled', newState);
                             }}
                             className={`h-10 px-6 rounded-xl font-black uppercase text-[10px] ${googleAuthEnabled ? 'bg-green-600' : 'bg-red-600'}`}
                          >
                             {googleAuthEnabled ? 'Activé' : 'Désactivé'}
                          </Button>
                       </div>

                       <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                          <div>
                             <p className="font-black uppercase text-xs">Connexion Apple</p>
                             <p className="text-[10px] text-gray-400 font-bold">Activer le bouton de connexion via Apple</p>
                          </div>
                          <Button 
                             onClick={() => {
                               const newState = !appleAuthEnabled;
                               setAppleAuthEnabled(newState);
                               handleUpdateConfig('apple_auth_enabled', newState);
                             }}
                             className={`h-10 px-6 rounded-xl font-black uppercase text-[10px] ${appleAuthEnabled ? 'bg-green-600' : 'bg-red-600'}`}
                          >
                             {appleAuthEnabled ? 'Activé' : 'Désactivé'}
                          </Button>
                       </div>
                    </div>
                 </Card>

                 <Card className="rounded-[2.5rem] border-gray-100 shadow-sm p-8 md:col-span-2">
                    <h3 className="text-xl font-black uppercase mb-6 flex items-center"><Search className="mr-3 h-6 w-6" /> Interface & Navigation</h3>
                    <div className="space-y-6">
                       <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                          <div>
                             <p className="font-black uppercase text-xs">Menu Mobile Inférieur</p>
                             <p className="text-[10px] text-gray-400 font-bold">Afficher le menu de navigation en bas du header sur mobile</p>
                          </div>
                          <Button 
                             onClick={() => {
                               const newState = !mobileMenuEnabled;
                               setMobileMenuEnabled(newState);
                               handleUpdateConfig('mobile_menu_enabled', newState);
                             }}
                             className={`h-10 px-6 rounded-xl font-black uppercase text-[10px] ${mobileMenuEnabled ? 'bg-green-600' : 'bg-red-600'}`}
                          >
                             {mobileMenuEnabled ? 'Activé' : 'Désactivé'}
                          </Button>
                       </div>

                                              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                          <div>
                             <p className="font-black uppercase text-xs">Boutique Promo</p>
                             <p className="text-[10px] text-gray-400 font-bold">Afficher le bouton Boutique Promo dans le header</p>
                          </div>
                          <Button 
                             onClick={() => {
                               const newState = !boutiquePromoEnabled;
                               setBoutiquePromoEnabled(newState);
                               handleUpdateConfig('boutique_promo_enabled', newState);
                             }}
                             className={`h-10 px-6 rounded-xl font-black uppercase text-[10px] ${boutiquePromoEnabled ? 'bg-green-600' : 'bg-red-600'}`}
                          >
                             {boutiquePromoEnabled ? 'Activé' : 'Désactivé'}
                          </Button>
                       </div>
                       <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                          <div>
                             <p className="font-black uppercase text-xs">Barre de recherche du Header</p>
                             <p className="text-[10px] text-gray-400 font-bold">Afficher l'icône et la barre de recherche dans le header</p>
                          </div>
                          <Button 
                             onClick={() => {
                               const newState = !headerSearchEnabled;
                               setHeaderSearchEnabled(newState);
                               handleUpdateConfig('header_search_enabled', newState);
                             }}
                             className={`h-10 px-6 rounded-xl font-black uppercase text-[10px] ${headerSearchEnabled ? 'bg-green-600' : 'bg-red-600'}`}
                          >
                             {headerSearchEnabled ? 'Activé' : 'Désactivé'}
                          </Button>
                       </div>

                       <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                          <div>
                             <p className="font-black uppercase text-xs">Recherche Accueil (Bannière)</p>
                             <p className="text-[10px] text-gray-400 font-bold">Afficher la fine barre de recherche sur la page d'accueil</p>
                          </div>
                          <Button 
                             onClick={() => {
                               const newState = !homeSearchEnabled;
                               setHomeSearchEnabled(newState);
                               handleUpdateConfig('home_search_enabled', newState);
                             }}
                             className={`h-10 px-6 rounded-xl font-black uppercase text-[10px] ${homeSearchEnabled ? 'bg-green-600' : 'bg-red-600'}`}
                          >
                             {homeSearchEnabled ? 'Activé' : 'Désactivé'}
                          </Button>
                       </div>
                       <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                          <div>
                             <p className="font-black uppercase text-xs">Slider CV Accueil</p>
                             <p className="text-[10px] text-gray-400 font-bold">Afficher ou masquer la promotion des CV sur l'accueil</p>
                          </div>
                          <Button 
                             onClick={() => {
                               const newState = !homeCvSliderEnabled;
                               setHomeCvSliderEnabled(newState);
                               handleUpdateConfig('home_cv_slider_enabled', newState);
                             }}
                             className={`h-10 px-6 rounded-xl font-black uppercase text-[10px] ${homeCvSliderEnabled ? 'bg-green-600' : 'bg-red-600'}`}
                          >
                             {homeCvSliderEnabled ? 'Activé' : 'Désactivé'}
                          </Button>
                       </div>
                    </div>
                 </Card>

                 <Card className="rounded-[2.5rem] border-gray-100 shadow-sm p-8 md:col-span-2">
                    <h3 className="text-xl font-black uppercase mb-6 flex items-center"><Search className="mr-3 h-6 w-6" /> Google Indexing API</h3>
                    <div className="space-y-6">
                       <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                          <div>
                             <p className="font-black uppercase text-xs">Test Instant Indexing</p>
                             <p className="text-[10px] text-gray-400 font-bold">Vérifier si l'API Google Indexing est bien configurée</p>
                          </div>
                          <Button 
                             onClick={async () => {
                               try {
                                 const res = await fetch('/api/admin/indexing/test', {
                                   method: 'POST',
                                   headers: {
                                     'Content-Type': 'application/json',
                                     'Authorization': `Bearer ${token}`
                                   },
                                   body: JSON.stringify({ jobId: 'test-ping' })
                                 });
                                 const data = await res.json();
                                 if (data.success) {
                                   alert('Test Google Indexing réussi !');
                                 } else {
                                   alert('Erreur Google Indexing: ' + data.error);
                                 }
                               } catch (err: any) {
                                 alert('Erreur: ' + err.message);
                               }
                             }}
                             className={`h-10 px-6 rounded-xl font-black uppercase text-[10px] bg-blue-600`}
                          >
                             Tester l'API
                          </Button>
                       </div>
                    </div>
                 </Card>

              </div>
           </TabsContent>

           <TabsContent value="users">
              {selectedUsers.length > 0 && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-4 z-10 shadow-lg shadow-red-900/5">
                  <span className="text-sm font-black text-red-900 flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5" /> {selectedUsers.length} utilisateur(s) sélectionné(s)
                  </span>
                  <div className="flex gap-2">
                    <Button onClick={bulkDeleteUsers} size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-[10px] rounded-xl px-4 py-2 h-auto shadow-sm">
                      Supprimer la sélection
                    </Button>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                 <table className="w-full text-left">
                    <thead className="bg-gray-50">
                       <tr>
                          <th className="p-6 w-16">
                            <input type="checkbox" id="selectAllUsersCheckbox" onChange={selectAllUsers} checked={users.length > 0 && selectedUsers.length === users.length} className="w-5 h-5 rounded-md border-gray-300 text-red-600 focus:ring-red-600 cursor-pointer" />
                          </th>
                          <th className="p-6 font-black uppercase text-xs text-gray-400">Utilisateur</th>
                          <th className="p-6 font-black uppercase text-xs text-gray-400">Role</th>
                          <th className="p-6 font-black uppercase text-xs text-gray-400">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                       {users.slice((usersPage - 1) * USERS_PER_PAGE, usersPage * USERS_PER_PAGE).map((u, i) => (
                          <tr key={i} className={`transition-colors ${selectedUsers.includes(u.id) ? 'bg-red-50/20' : 'hover:bg-gray-50/50'}`}>
                             <td className="p-6">
                               <input type="checkbox" checked={selectedUsers.includes(u.id)} onChange={() => toggleUserSelection(u.id)} className="w-5 h-5 rounded-md border-gray-300 text-red-600 focus:ring-red-600 cursor-pointer" />
                             </td>
                             <td className="p-6">
                                <div className="font-bold text-gray-900">{u.name}</div>
                                <div className="text-xs text-gray-400">{u.email}</div>
                             </td>
                             <td className="p-6">
                                <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black uppercase mr-2">{u.role}</span>
                                {u.profile?.isPremium && (
                                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase">Promu</span>
                                )}
                                {u.role === 'CANDIDAT' && u.profile && (
                                  <div className="mt-2 text-xs font-medium text-gray-500 flex items-center gap-2">
                                    CV: {u.profile.cvUrl ? <span className="text-emerald-600 font-bold">Oui</span> : 'Non'}
                                    {u.profile.cvUrl && (
                                      <a href={u.profile.cvUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">Voir</a>
                                    )}
                                  </div>
                                )}
                             </td>
                             <td className="p-6 flex flex-wrap gap-2">
                                {u.role === 'CANDIDAT' && u.profile && (
                                  <Button 
                                    onClick={() => toggleCvPremium(u.id, u.profile?.isPremium || false)} 
                                    size="sm" 
                                    className={`${u.profile?.isPremium ? 'bg-amber-100 hover:bg-amber-200 text-amber-700' : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'} font-bold uppercase text-[10px] rounded-xl px-4`}
                                  >
                                    {u.profile?.isPremium ? 'Retirer la promo' : 'Promouvoir le CV'}
                                  </Button>
                                )}
                                <Button onClick={() => deleteUser(u.id)} variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 rounded-xl">Supprimer</Button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>

              {users.length > USERS_PER_PAGE && (
                <div className="flex items-center justify-center space-x-4 mt-8">
                  <Button 
                    variant="outline" 
                    onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                    disabled={usersPage === 1}
                    className="rounded-xl font-bold uppercase text-xs"
                  >
                    Précédent
                  </Button>
                  <span className="text-sm font-bold text-gray-500">
                    Page {usersPage} sur {Math.ceil(users.length / USERS_PER_PAGE)}
                  </span>
                  <Button 
                    variant="outline" 
                    onClick={() => setUsersPage(p => Math.min(Math.ceil(users.length / USERS_PER_PAGE), p + 1))}
                    disabled={usersPage >= Math.ceil(users.length / USERS_PER_PAGE)}
                    className="rounded-xl font-bold uppercase text-xs"
                  >
                    Suivant
                  </Button>
                </div>
              )}
           </TabsContent>

           <TabsContent value="packages">
             <div className="bg-gray-50 border border-gray-100 p-6 sm:p-8 rounded-[2rem] shadow-sm">
                <JobPackagesManager />
                <div className="my-12 border-t border-gray-200"></div>
                <CvPackagesManager />
             </div>
           </TabsContent>

           <TabsContent value="boutique">
             <div className="bg-gray-50 border border-gray-100 p-6 sm:p-8 rounded-[2rem] shadow-sm">
                <BoutiqueManager />
             </div>
           </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
