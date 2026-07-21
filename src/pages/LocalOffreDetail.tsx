import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import { JobCard } from '@/components/cards/JobCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ChevronRight, MapPin, Briefcase, Calendar, Building2, Banknote, Share2, Mail, ExternalLink, Clock, ArrowRight, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

import { PromoBanner } from '@/components/common/PromoBanner';
import { AdBanner } from '@/components/ads/AdBanner';
import { SunucvBanner } from '@/components/article/SunucvBanner';
import { WhatsappBanner } from '@/components/article/WhatsappBanner';
import { injectJobPostingSchema, removeJobPostingSchema } from '@/lib/seo/jobPosting';
import { SafeHtml } from '@/components/SafeHtml';
import { cachedFetch } from '@/lib/fetchCache';

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black leading-none ${className}`}>
      {children}
    </span>
  );
}

export function LocalOffreDetail() {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();
  const id = searchParams.get('id') || idOrSlug;
  const [job, setJob] = useState<any>(location.state?.post || null);
  const [similarJobs, setSimilarJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(!location.state?.post);

  // Application form state
  const [appForm, setAppForm] = useState({ nom: '', prenom: '', telephone: '', motivation: '' });

  useEffect(() => {
    if (user?.profile) {
      setAppForm(prev => ({
        ...prev,
        nom: user.profile.nom || '',
        prenom: user.profile.prenom || '',
        telephone: user.profile.telephone || ''
      }));
    }
  }, [user]);
  const [isUploading, setIsUploading] = useState(false);
  const [siteConfig, setSiteConfig] = useState<any>(null);

  // For injecting Ads in the content
  const articleWrapperRef = useRef<HTMLDivElement>(null);
  const [adContainers, setAdContainers] = useState<HTMLElement[]>([]);

  useEffect(() => {
    cachedFetch('/api/config/site')
      .then(res => res.json())
      .then(data => setSiteConfig(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!job || !articleWrapperRef.current) return;

    const wrapper = articleWrapperRef.current;
    
    // Clear previous ad containers
    setAdContainers(prev => {
        prev.forEach(el => el.remove());
        return [];
    });

    const paragraphs = Array.from(wrapper.querySelectorAll('.prose > p, .prose > ul, .prose > ol'));
    const newContainers: HTMLElement[] = [];

    paragraphs.forEach((p, index) => {
       if ((index + 1) % 4 === 0) {
          const div = document.createElement('div');
          div.className = "my-8 w-full flex justify-center bg-gray-50/50 rounded-2xl overflow-hidden py-4 border border-gray-100 px-2 not-prose";
          p.insertAdjacentElement('afterend', div);
          newContainers.push(div);
       }
    });
    setAdContainers(newContainers);
    
    return () => {
       setAdContainers(prev => {
           prev.forEach(el => el.remove());
           return [];
       });
    };
  }, [job?.description]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadJob = async () => {
      try {
        const res = await cachedFetch(`/api/public/offres/${id}`);
        if (res.ok) {
          const data = await res.json();
          setJob(data);

          // Fetch similar jobs
          if (data.categorie) {
            if (data.categorie === 'europe' || data.categorie === 'canada') {
                 navigate(`/destination-article/${data.slug || data.id}`, { replace: true });
                 return;
            }
            const similarRes = await cachedFetch(`/api/public/offres?categorie=${data.categorie}&limit=4`);
            if (similarRes.ok) {
               const similarData = await similarRes.json();
               const filteredSimilar = (similarData.data || []).filter((j: any) => j.id !== data.id).slice(0, 3);
               setSimilarJobs(filteredSimilar);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadJob();
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (job) {
      injectJobPostingSchema(job);
    }
    return () => {
      removeJobPostingSchema();
    };
  }, [job]);

  // Application form submission handler
  const handleEmailApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job.emailContact) return;

    const { nom, prenom, telephone, motivation } = appForm;
    const subject = encodeURIComponent(`Candidature: ${job.titre} - ${prenom} ${nom}`);
    
    let cvSection = "";
    if (user?.profile?.cvUrl) {
      const isAbsolute = user.profile.cvUrl.startsWith('http');
      const fullCvUrl = isAbsolute ? user.profile.cvUrl : `https://www.liggeybi.com${user.profile.cvUrl.startsWith('/') ? '' : '/'}${user.profile.cvUrl}`;
      cvSection = `
Mon CV
Veuillez trouver mon CV téléchargeable via le lien suivant :
${fullCvUrl}
`;
    }

    const body = encodeURIComponent(
`Bonjour,

Suite à votre annonce "${job.titre}" publiée sur Liggeybi, je vous soumets ma candidature.

Détails du candidat :
Nom : ${nom}
Prénom : ${prenom}
Téléphone : ${telephone || "Non renseigné"}
${cvSection}
Motivation :
${motivation}

--
Candidature facilitée par Liggeybi.com - Le premier site d'emploi pour tous !
https://www.liggeybi.com`
    );

    window.location.href = `mailto:${job.emailContact}?subject=${subject}&body=${body}`;
  };

  const handleInterneApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) {
      alert("Vous devez être connecté pour postuler.");
      navigate("/connexion");
      return;
    }
    
    setIsUploading(true);
    try {
      const res = await fetch("/api/candidatures", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          articleSlug: job.slug || job.id,
          articleTitre: job.titre,
          articleCategorie: job.categorie,
          type: "interne",
          motivation: appForm.motivation,
          cvUrl: user.profile?.cvUrl || null,
          recruteurEmail: null // In this case, not sending email directly, handled internally or we can leave null
        })
      });
      if (res.ok) {
        alert("Candidature envoyée avec succès !");
        navigate("/candidat");
      } else {
        const err = await res.json();
        alert("Erreur: " + (err.error || "Échec de l'envoi de la candidature"));
      }
    } catch (err: any) {
      alert("Erreur réseau: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!job) {
    return <div className="container mx-auto px-4 py-20 text-center">Offre non trouvée.</div>;
  }

  let metaItems = [];
  if (job.categorie === 'europe' || job.categorie === 'canada') {
    metaItems = [
      { icon: MapPin, label: 'Lieu', value: job.lieu }
    ].filter(item => item.value);
  } else {
    metaItems = [
      { icon: MapPin, label: 'Lieu', value: job.lieu },
      { icon: Briefcase, label: 'Contrat', value: job.typeContrat },
      { icon: Clock, label: 'Expérience', value: job.experience },
      { icon: Building2, label: 'Entreprise', value: job.entreprise || 'Non spécifié' },
      { icon: Banknote, label: 'Salaire', value: job.salaire },
    ].filter(item => item.value);
  }

  const shareOffer = () => {
    if (navigator.share) {
      navigator.share({
        title: job.titre,
        url: window.location.href
      });
    }
  };

  const categoryNameMapping: Record<string, string> = {
    'offre-demploi': "Offre d'emploi",
    'bourses': "Bourses d'études",
    'concours': "Concours",
    'formation': "Formation"
  };

  const categoryName = categoryNameMapping[job.categorie] || "Liggeybi";

  const defaultImage = siteConfig ? (siteConfig[`default_job_image_${job.categorie}`] || siteConfig.default_job_image) : null;
  const rawImg = job.logoUrl || job.imageUrl || defaultImage || 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1200';
  const seoImage = rawImg.startsWith('http') ? rawImg : window.location.origin + (rawImg.startsWith('/') ? rawImg : '/' + rawImg);

  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>{`${job.titre} | Liggeybi`}</title>
        <meta name="description" content={job.seoDescription || job.description?.replace(/<[^>]*>/g, '').slice(0, 160) || ''} />
        <link rel="canonical" href={`https://www.liggeybi.com/offre/${job.slug || job.id}`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://www.liggeybi.com/offre/${job.slug || job.id}`} />
        <meta property="og:title" content={job.titre} />
        <meta property="og:description" content={job.seoDescription || job.description?.replace(/<[^>]*>/g, '').slice(0, 160) || ''} />
        <meta property="og:image" content={seoImage} />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={"https://www.liggeybi.com/offre/" + (job.slug || job.id)} />
        <meta property="twitter:title" content={job.titre} />
        <meta property="twitter:description" content={job.seoDescription || job.description?.replace(/<[^>]*>/g, '').slice(0, 160) || ''} />
        <meta property="twitter:image" content={seoImage} />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-12">
          <Link to="/" className="hover:text-[#006837] transition-colors">Accueil</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to={`/${job.categorie}`} className="hover:text-[#006837] transition-colors">{categoryName}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-900 truncate max-w-[200px]">{job.titre}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-16">
          <div className="flex-1 min-w-0 space-y-12">
            <header className="space-y-8">
               <PromoBanner location="TOP_ARTICLE" className="mb-8" />
               <div className="flex flex-wrap gap-3 items-center">
                <Badge className="bg-[#006837]/10 text-[#006837] uppercase tracking-widest text-[10px] py-1 px-4">{categoryName}</Badge>
                {job.isUrgent && (
                  <Badge className="bg-red-600 text-white uppercase tracking-widest text-[10px] py-1 px-4 shadow-sm animate-pulse">Urgent</Badge>
                )}
                <span className="text-[10px] font-black text-gray-400 flex items-center uppercase tracking-widest">
                   <Clock className="h-3.5 w-3.5 mr-1.5" /> Publié le {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter text-gray-900 leading-[1.1]">{job.titre}</h1>
              
              {(job.categorie === 'europe' || job.categorie === 'canada') && (
                <div className="w-full flex justify-center my-6">
                   <AdBanner slot="article-top" format="horizontal" />
                </div>
              )}
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 shadow-sm transition-all hover:shadow-md">
                 {metaItems.map((item, i) => (
                   item.value && (
                     <div key={i} className="space-y-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center">
                          <item.icon className="h-3.5 w-3.5 mr-2 text-[#F7BE16]" />
                          {item.label}
                        </p>
                        <p className="text-md font-black text-gray-800 leading-tight">{item.value}</p>
                     </div>
                   )
                 ))}
              </div>
            </header>
            
            <div className="py-4 border-y border-gray-50">
               <AdBanner slot="7733655057" />
            </div>

            {rawImg && (
              <div className="rounded-[2rem] overflow-hidden border border-gray-100 shadow-xl relative group max-w-2xl mx-auto bg-gray-900">
                <img 
                  src={rawImg}
                  alt={job.titre} 
                  className="w-full h-auto max-h-[450px] object-contain object-center transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            
            <div className="max-w-[800px] mx-auto space-y-8">
              <PromoBanner location="MIDDLE_ARTICLE" className="w-full my-6" />
              
              {/* Main Content */}
              <div ref={articleWrapperRef} className="bg-white rounded-2xl p-4 sm:p-8 border shadow-sm border-gray-100 overflow-hidden" id="article-content-wrapper">
                <div 
                  className="prose sm:prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:text-gray-600 prose-p:leading-relaxed prose-strong:text-gray-900" 
                  dangerouslySetInnerHTML={{ __html: job.description }} 
                />

                {adContainers.map((container, index) => 
                  createPortal(<AdBanner key={`portal-${index}`} slot="7733655057" format="fluid" />, container)
                )}
              </div>
              
              <PromoBanner location="BOTTOM_ARTICLE" className="w-full my-8" />
            </div>

            {/* Application Section */}
            {(
              (job.modeCandidature === 'email' && job.emailContact) || 
              (job.modeCandidature === 'lien' && job.lienExterne) || 
              job.modeCandidature === 'interne'
            ) && (
              <section className="bg-white rounded-[3rem] p-8 md:p-12 border border-gray-100 shadow-2xl space-y-10 relative overflow-hidden" id="postuler">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-[#006837]/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                 <div className="text-center space-y-3 relative z-10">
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-gray-900">Postuler à cette offre</h2>
                    <p className="text-gray-500 font-medium">Rejoignez l'aventure en quelques clics via notre plateforme.</p>
                 </div>

                 <div className="relative z-10 max-w-xl mx-auto text-left space-y-6">
                   {job.modeCandidature === 'email' && job.emailContact && (
                     <form onSubmit={handleEmailApply} className="space-y-6 bg-gray-50 p-6 sm:p-8 rounded-[2rem] border border-gray-100">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Prénom</Label>
                              <Input required value={appForm.prenom} onChange={e => setAppForm({...appForm, prenom: e.target.value})} placeholder="Votre prénom" className="h-12 rounded-xl bg-white border-none" />
                           </div>
                           <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Nom</Label>
                              <Input required value={appForm.nom} onChange={e => setAppForm({...appForm, nom: e.target.value})} placeholder="Saisir votre nom" className="h-12 rounded-xl bg-white border-none" />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Téléphone</Label>
                           <Input required type="tel" value={appForm.telephone} onChange={e => setAppForm({...appForm, telephone: e.target.value})} placeholder="Votre numéro de téléphone" className="h-12 rounded-xl bg-white border-none" />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Un mot sur votre motivation</Label>
                           <Textarea required value={appForm.motivation} onChange={e => setAppForm({...appForm, motivation: e.target.value})} placeholder="Pourquoi ce poste est fait pour vous ?" className="min-h-[100px] rounded-xl bg-white border-none resize-none" />
                        </div>
                        <div className="text-[10px] text-gray-400 font-bold italic text-center px-4 leading-relaxed">
                           Votre messagerie par défaut s'ouvrira afin que vous puissiez finaliser et valider l'e-mail.
                           <br />
                           {user?.profile?.cvUrl 
                             ? "Le lien vers votre CV pré-enregistré sur Liggeybi a été ajouté dans le corps du message." 
                             : "N'oubliez pas d'ajouter votre CV en pièce jointe depuis votre messagerie avant d'envoyer l'e-mail."}
                        </div>
                        <Button type="submit" disabled={isUploading} className="w-full bg-[#006837] hover:bg-[#004d29] text-white font-black text-lg h-16 rounded-2xl shadow-xl transition-all hover:-translate-y-1 uppercase tracking-tighter">
                          {isUploading ? 'Traitement en cours...' : <><Mail className="mr-3 h-5 w-5" /> Continuer l'envoi</>}
                        </Button>
                     </form>
                   )}
                   {job.modeCandidature === 'lien' && job.lienExterne && (
                     <div className="text-center">
                       <Button nativeButton={false} render={<a href={job.lienExterne} target="_blank" rel="noopener noreferrer" className="block" />} className="w-full sm:w-auto bg-[#006837] hover:bg-[#004d29] text-white font-black text-lg h-16 px-12 rounded-2xl shadow-xl transition-all hover:-translate-y-1 uppercase tracking-tighter">POSTULER SUR LE SITE <ExternalLink className="ml-3 h-5 w-5" /></Button>
                     </div>
                   )}
                   {job.modeCandidature === 'interne' && (
                     <form onSubmit={handleInterneApply} className="space-y-6 bg-gray-50 p-6 sm:p-8 rounded-[2rem] border border-gray-100">
                        <div className="space-y-2">
                           <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Un mot sur votre motivation</Label>
                           <Textarea required value={appForm.motivation} onChange={e => setAppForm({...appForm, motivation: e.target.value})} placeholder="Vendez votre candidature en quelques mots... (Pourquoi ce poste est fait pour vous ?)" className="min-h-[100px] rounded-xl bg-white border-none resize-none" />
                        </div>
                        <div className="text-[10px] text-gray-400 font-bold italic text-center px-4">
                           Votre profil Liggeybi et votre CV seront joint automatiquement s'ils sont renseignés dans votre profil.
                        </div>
                        <Button type="submit" disabled={isUploading || !user} className="w-full bg-[#006837] hover:bg-[#004d29] text-white font-black text-lg h-16 rounded-2xl shadow-xl transition-all hover:-translate-y-1 uppercase tracking-tighter">
                          {isUploading ? 'Envoi en cours...' : !user ? 'Connectez-vous pour postuler' : 'Postuler maintenant'}
                        </Button>
                     </form>
                   )}
                 </div>
              </section>
            )}


            <SunucvBanner />

            <div className="my-6 bg-red-50 border border-red-100 rounded-xl p-4 flex items-start space-x-3 max-w-[800px] mx-auto">
              <div className="bg-red-100 p-2 rounded-full text-red-600 shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-red-900 font-bold text-sm sm:text-base mb-1">⚠️ Avertissement de sécurité</h4>
                <p className="text-red-700 font-medium text-xs sm:text-sm">
                  Attention : Ne payez jamais un recruteur pour un emploi ou un entretien. Aucune demande d’argent n’est légitime.
                </p>
              </div>
            </div>

            <WhatsappBanner />

            {job.tags && job.tags.split(',').filter(Boolean).length > 0 && (
              <div className="flex flex-wrap gap-2 pt-6 mt-8">
                {job.tags.split(',').filter(Boolean).map((tag: string, idx: number) => (
                  <h2 key={idx} className="bg-gray-100 text-gray-700 hover:bg-[#006837] hover:text-white transition-colors duration-300 font-bold uppercase tracking-widest text-[10px] px-3 py-1.5 rounded-xl border border-gray-200 m-0">
                    #{tag.trim()}
                  </h2>
                ))}
              </div>
            )}

            {/* SIMILAR OFFERS */}
            {similarJobs.length > 0 && (
              <section className="space-y-8 pt-10">
                <div className="flex items-center space-x-4">
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-900 leading-none">Similaires</h2>
                  <div className="h-2 flex-1 bg-gray-50 rounded-full" />
                </div>
                <div className="flex flex-col gap-4">
                  {similarJobs.map(r => {
                    // Map local job format to JobCard expected format
                    const similarDefaultImage = siteConfig ? (siteConfig[`default_job_image_${r.categorie}`] || siteConfig.default_job_image) : null;
                    const fallbackImg = 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1200';
                    const mappedPost = {
                       id: r.id,
                       databaseId: parseInt(r.id),
                       title: r.titre,
                       slug: `offre/${r.slug || r.id}`,
                       date: r.createdAt,
                       categories: {
                         nodes: [{ 
                           name: r.categorie === 'offre-demploi' ? "Offre d'emploi" : 
                                 r.categorie === 'bourses' ? "Bourses d'études" : 
                                 r.categorie === 'concours' ? "Concours" : 
                                 r.categorie === 'formation' ? "Formation" :
                                 r.categorie === 'emploi-international' ? "Emploi International" :
                                 r.categorie === 'candidature-spontanee' ? "Candidature Spontanée" :
                                 r.categorie === 'appels-doffres' ? "Appels d'offres" :
                                 r.categorie === 'finance-business' ? "Finance & Business" :
                                 r.categorie === 'stage' ? "Stage" : r.categorie,
                           slug: r.categorie
                         }]
                       },
                       logoUrl: r.logoUrl,
                       imageUrl: r.imageUrl,
                       featuredImage: { node: { sourceUrl: r.logoUrl || r.imageUrl || null } }
                    };

                    return <JobCard key={r.id} post={mappedPost as any} />;
                  })}
                </div>
              </section>
            )}

          </div>
          
          <aside className="w-full lg:w-96 space-y-12">
             <div className="sticky top-24 space-y-12">
               <AdBanner slot="3384697577" />

               <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-xl overflow-hidden relative group">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-slate-100 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-slate-200 transition-all duration-700 opacity-50" />
                  
                  <div className="relative z-10 space-y-8">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-1.5 bg-slate-900 rounded-full" />
                      <h3 className="text-xl font-black uppercase text-gray-900 tracking-tighter">Profil Recruteur</h3>
                    </div>
                    
                    <div className="space-y-8">
                      <div className="flex items-center space-x-6">
                        <div className="h-20 w-20 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[1.8rem] flex items-center justify-center text-white font-black text-3xl shadow-lg shadow-slate-900/20 border-2 border-white overflow-hidden">
                          {(job.imageUrl || job.logoUrl) ? (
                            <img src={job.imageUrl || job.logoUrl} alt={job.entreprise} className="w-full h-full object-cover object-center" />
                          ) : (
                            job.entreprise ? job.entreprise.charAt(0) : 'L'
                          )}
                        </div>
                        <div>
                          <p className="text-xl font-black text-gray-900 tracking-tight leading-none mb-1">{job.entreprise || 'Entreprise'}</p>
                          <div className="flex items-center text-slate-700 bg-slate-100 px-3 py-1 rounded-full w-fit">
                             <Building2 className="h-3 w-3 mr-1.5" />
                             <span className="text-[10px] font-black uppercase tracking-widest">Sénégal</span>
                          </div>
                        </div>
                      </div>

                      <Button nativeButton={false} render={<Link to={`/recherche?q=${job.entreprise || ''}`} />} className="w-full bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 font-black text-xs h-14 rounded-2xl shadow-sm transition-all hover:border-slate-900 hover:text-slate-900 uppercase tracking-tighter group/btn">VOIR TOUTES SES OFFRES <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" /></Button>
                    </div>
                  </div>
               </div>

               {(!siteConfig || siteConfig.share_whatsapp_enabled !== 'false' || siteConfig.share_facebook_enabled !== 'false') && (
                 <div className="bg-gray-50 rounded-[3rem] p-10 space-y-8 border border-gray-100/50">
                    <h3 className="text-2xl font-black uppercase text-slate-900 border-l-[6px] border-amber-500 pl-5 leading-none">Partager</h3>
                    <div className="grid grid-cols-1 gap-4">
                       {(!siteConfig || siteConfig.share_whatsapp_enabled !== 'false') && (
                         <Button className="bg-[#25D366] hover:bg-[#128C7E] text-white font-black rounded-2xl h-14 text-md shadow-lg shadow-green-500/20" onClick={shareOffer}>
                            WHATSAPP
                         </Button>
                       )}
                       {(!siteConfig || siteConfig.share_facebook_enabled !== 'false') && (
                         <Button className="bg-[#1877F2] hover:bg-[#0C5DC7] text-white font-black rounded-2xl h-14 text-md shadow-lg shadow-blue-500/20" onClick={shareOffer}>
                            FACEBOOK
                         </Button>
                       )}
                    </div>
                 </div>
               )}

               <AdBanner slot="5682206784" />
             </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
