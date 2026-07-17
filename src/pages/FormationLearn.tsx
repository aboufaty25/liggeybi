import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, Circle, PlayCircle, Menu, X, ArrowLeft, Award, Share2, Download, Facebook, Linkedin, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AdBanner } from '@/components/ads/AdBanner';
import { renderMarkdown } from '@/lib/markdown';
import { SafeHtml } from '@/components/SafeHtml';

function ArticlePlayer({ chapter, onComplete }: { chapter: any, onComplete: () => void }) {
  const isYoutube = chapter.videoUrl?.includes('youtube') || chapter.videoUrl?.includes('youtu.be');
  return (
    <div className="bg-white sm:rounded-2xl shadow-none sm:shadow-sm border-t-0 sm:border border-gray-100 p-4 sm:p-8 mt-0 sm:mt-4 w-full">
       {chapter.videoUrl && (
          <div className="relative rounded-none sm:rounded-xl overflow-hidden bg-black aspect-video mb-6 sm:mb-8 -mx-4 sm:mx-0">
             {isYoutube ? (
                <iframe 
                   src={`${chapter.videoUrl.replace('watch?v=', 'embed/').split('&')[0].replace('youtu.be/', 'youtube.com/embed/')}?modestbranding=1&rel=0&controls=1&showinfo=0`} 
                   className="w-full h-full absolute inset-0"
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                   allowFullScreen
                />
             ) : (
                <video src={chapter.videoUrl} controls className="w-full h-full object-contain bg-gray-900" />
             )}
          </div>
       )}
       {!chapter.videoUrl && chapter.imageUrl && (
         <img src={chapter.imageUrl} alt={chapter.titre} className="w-[100vw] sm:w-full max-w-none sm:max-w-full aspect-video md:max-h-96 object-contain bg-gray-900 rounded-none sm:rounded-xl mb-6 sm:mb-8 border-0 sm:border border-gray-100 relative left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto" />
       )}
       <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">{chapter.titre}</h1>
       {chapter.description && chapter.description !== '<p><br></p>' && (
          <SafeHtml html={chapter.description} className="prose sm:prose-lg max-w-none text-gray-700 mb-8 sm:mb-12 w-full break-words prose-img:max-w-full prose-img:h-auto overflow-hidden" />
       )}
       <div className="mt-8 mb-8">
          <AdBanner slot="4567341711" format="fluid" />
       </div>
       <div className="flex justify-end pt-6 border-t border-gray-100">
          <button onClick={onComplete} className="w-full sm:w-auto bg-[#006837] hover:bg-[#004d29] text-white font-bold py-3 sm:py-4 px-4 sm:px-8 rounded-xl shadow-lg transition-colors flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base">
             Marquer comme terminé et continuer <ChevronRight size={20} className="shrink-0" />
          </button>
       </div>
    </div>
  );
}

// Render ultra-visual slides
function VisualSlidePlayer({ chapter, onComplete }: { chapter: any, onComplete: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Try to parse chapter description as JSON to see if it's a visual format
  let isVisualFormat = false;
  let slides: any[] = [];
  
  try {
    const parsed = JSON.parse(chapter.description || '{}');
    if (parsed.type === 'visual' && Array.isArray(parsed.slides)) {
       isVisualFormat = true;
       slides = parsed.slides;
    }
  } catch(e) {
    // Not valid JSON, fallback to legacy
  }

  // If no visual slides found, but we have media, create default slides
  if (!isVisualFormat) {
     if (chapter.videoUrl) {
       slides.push({ type: 'video', url: chapter.videoUrl, content: chapter.titre, description: chapter.description });
     } else if (chapter.imageUrl) {
       slides.push({ type: 'image', url: chapter.imageUrl, content: chapter.titre, description: chapter.description });
     } else {
       slides.push({ type: 'text', content: chapter.titre, description: chapter.description });
     }
  }

  const nextSlide = () => {
     if (currentSlide < slides.length - 1) {
        setCurrentSlide(prev => prev + 1);
     } else {
        onComplete();
     }
  };

  const prevSlide = () => {
     if (currentSlide > 0) setCurrentSlide(prev => prev - 1);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const slide = slides[currentSlide];

  return (
    <div ref={containerRef} className={`relative flex flex-col items-center justify-center bg-black overflow-hidden ${isFullscreen ? 'w-screen h-screen' : 'w-full h-[85vh] md:h-[700px] rounded-none sm:rounded-3xl shadow-none sm:shadow-2xl'}`}>
      
      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
         <div className="text-white font-bold truncate max-w-[70%] drop-shadow-md">
            {chapter.titre}
         </div>
         <div className="flex items-center gap-3">
            <span className="text-white/80 text-sm font-medium px-3 py-1 bg-white/10 rounded-full backdrop-blur-sm">
               {currentSlide + 1} / {slides.length}
            </span>
            <button onClick={toggleFullscreen} className="text-white p-2 hover:bg-white/20 rounded-full transition">
               {isFullscreen ? <Minimize2 size={20}/> : <Maximize2 size={20}/>}
            </button>
         </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 z-30 flex gap-1 px-1 pt-1 opacity-70">
         {slides.map((_, i) => (
            <div key={i} className="h-full flex-1 bg-white/20 rounded-full overflow-hidden">
               <div className={`h-full bg-white transition-all duration-300 ${i < currentSlide ? 'w-full' : i === currentSlide ? 'w-full origin-left scale-x-100 animate-pulse' : 'w-0'}`}/>
            </div>
         ))}
      </div>

      {/* Content Container */}
      <div className="w-full h-full relative flex items-center justify-center">
         <AnimatePresence mode="wait">
            <motion.div 
               key={currentSlide}
               initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
               animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
               exit={{ opacity: 0, scale: 1.05, filter: "blur(4px)" }}
               transition={{ duration: 0.4, ease: "easeOut" }}
               className="w-full h-full absolute inset-0 flex flex-col items-center justify-center"
            >
               {/* Background Layer relative to media */}
               {slide.type === 'image' && (
                  <div className="absolute inset-0 bg-black">
                     <img src={slide.url} alt="Slide" className="w-full h-full object-cover opacity-60" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  </div>
               )}

               {slide.type === 'video' && slide.url && (
                  <div className="absolute inset-0 bg-black flex items-center justify-center">
                     {slide.url.includes('youtube') || slide.url.includes('youtu.be') ? (
                        <iframe 
                           src={`${slide.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}?autoplay=1&controls=0&mute=1&loop=1&modestbranding=1`}
                           className="w-full h-full object-cover opacity-80 pointer-events-none scale-150"
                           allow="autoplay; encrypted-media"
                        />
                     ) : (
                        <video src={slide.url} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80" />
                     )}
                     <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  </div>
               )}

               {/* Foreground Content */}
               <div className="relative z-10 p-4 sm:p-8 md:p-16 flex flex-col h-full w-full justify-end max-w-4xl mx-auto">
                 <motion.h2 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-tight mb-4 drop-shadow-lg"
                 >
                    {slide.content || chapter.titre}
                 </motion.h2>
                 
                 {slide.description && slide.description !== '<p><br></p>' && (
                    <motion.div 
                       initial={{ y: 20, opacity: 0 }}
                       animate={{ y: 0, opacity: 1 }}
                       transition={{ delay: 0.3 }}
                       className="w-full"
                    >
                       <SafeHtml 
                          html={slide.description}
                          className="text-white/90 text-lg md:text-xl font-medium prose prose-invert prose-lg max-w-none drop-shadow-md whitespace-pre-wrap break-words overflow-y-auto max-h-[60vh] pr-4 custom-scrollbar"
                       />
                    </motion.div>
                 )}
               </div>
            </motion.div>
         </AnimatePresence>
      </div>

      {/* Navigation Controls (Left half / Right half click targets) */}
      <div className="absolute inset-0 z-10 flex">
         <div onClick={prevSlide} className="w-1/3 h-full cursor-w-resize group flex items-center p-4">
            <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-4 group-hover:translate-x-0">
               <ChevronLeft size={24} />
            </div>
         </div>
         <div onClick={nextSlide} className="w-2/3 h-full cursor-e-resize group flex items-center justify-end p-4">
            <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0 shadow-xl">
               <ChevronRight size={24} />
            </div>
         </div>
      </div>
      
      {/* Bottom control bar (mobile friendly) */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-4 pointer-events-none px-6">
         <button onClick={(e) => { e.stopPropagation(); prevSlide(); }} className={`pointer-events-auto p-4 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 transition ${currentSlide === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>
           <ChevronLeft size={24} />
         </button>
         <button onClick={(e) => { e.stopPropagation(); nextSlide(); }} className="pointer-events-auto flex items-center gap-2 group px-8 py-4 rounded-full bg-primary text-white font-black hover:bg-green-500 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-green-900/50">
           {currentSlide < slides.length - 1 ? (
             <>Suivant <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
           ) : (
             <>Terminer le chapitre <CheckCircle size={20} className="group-hover:scale-110 transition-transform" /></>
           )}
         </button>
      </div>

    </div>
  );
}

export default function FormationLearn() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formation, setFormation] = useState<any>(null);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [currentChapter, setCurrentChapter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [quizData, setQuizData] = useState<any>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState<{score: number, passed: boolean} | null>(null);

  const mainContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentChapter, showQuiz]);

  useEffect(() => {
    if (!user) {
      navigate('/connexion');
      return;
    }
    fetchData();
  }, [slug, user]);

  const fetchData = async () => {
    try {
      const formRes = await fetch(`/api/formations/${slug}`);
      if (!formRes.ok) return navigate('/formations');
      const form = await formRes.json();
      setFormation(form);
      if (form.quiz) {
         setQuizData({
            ...form.quiz,
            questions: (form.quiz.questions || []).map((q: any) => ({
                ...q, options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
            }))
         });
         setUserAnswers(new Array(form.quiz.questions?.length || 0).fill(-1));
      }

      const progRes = await fetch(`/api/formations/progress/${form.id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (progRes.ok) {
        const { progress } = await progRes.json();
        setProgressData(progress || []);
        
        // Find first uncompleted chapter
        if (form.chapitres?.length > 0) {
           const completedIds = (progress || []).map((p: any) => p.chapitresId || p.chapitreId);
           let nextChap = form.chapitres.find((c: any) => !completedIds.includes(c.id));
           if (!nextChap) nextChap = form.chapitres[0]; // Or the last one
           setCurrentChapter(nextChap);
        }
      }
      setLoading(false);
    } catch(e) {
      console.error(e);
      setLoading(false);
    }
  };

  const markCompleted = async () => {
    if (!currentChapter) return;
    try {
      const res = await fetch(`/api/formations/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ chapitreId: currentChapter.id })
      });
      if (res.ok) {
        const d = await res.json();
        setProgressData([...progressData, { chapitreId: currentChapter.id, isCompleted: true }]);
        
        // go to next
        const idx = formation.chapitres.findIndex((c:any) => c.id === currentChapter.id);
        if (idx < formation.chapitres.length - 1) {
           setCurrentChapter(formation.chapitres[idx + 1]);
        } else {
           if (quizData) {
               setShowQuiz(true);
               setCurrentChapter(null);
           } else if(d.progression >= 100) {
              await requestCertification(100);
           }
        }
      }
    } catch(e) {
      console.error(e);
    }
  };

  const requestCertification = async (scoreLevel: number) => {
    try {
      const res = await fetch(`/api/formations/${formation.id}/certify`, {
         method: 'POST',
         headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({ score: scoreLevel })
      });
      if(res.ok) {
         // Do not navigate automatically
      }
    } catch(error) {
       console.error(error);
    }
  };

  const submitQuiz = async () => {
     let correctCount = 0;
     quizData.questions.forEach((q: any, i: number) => {
        if (q.correctOptionIndex === userAnswers[i]) correctCount++;
     });
     const score = Math.round((correctCount / Math.max(1, quizData.questions.length)) * 100);
     const passed = score >= 70; // 70% passing grade
     setQuizResult({ score, passed });
     
     if (passed) {
        await requestCertification(score);
     }
  };

  const certificateRef = useRef<HTMLDivElement>(null);

  const downloadCertificate = async () => {
     if (!certificateRef.current) return;
     try {
       const [jsPDFModule, html2canvasModule] = await Promise.all([
         import('jspdf'),
         import('html2canvas')
       ]);
       const JsPDFConstructor: any = jsPDFModule.default || (jsPDFModule as any).jsPDF || jsPDFModule;
       const html2canvasFn: any = html2canvasModule.default || html2canvasModule;
       
       const canvas = await html2canvasFn(certificateRef.current as unknown as HTMLElement, { scale: 2 });
       const imgData = canvas.toDataURL('image/png');
       const pdf = new JsPDFConstructor({
         orientation: 'landscape',
         unit: 'px',
         format: [canvas.width, canvas.height]
       });
       pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
       pdf.save(`Certificat-${formation?.titre || 'Formation'}.pdf`);
     } catch (error) {
       console.error("Erreur lors de la génération du PDF", error);
     }
  };

  const shareToFacebook = () => {
     const url = window.location.href;
     window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const shareToLinkedIn = () => {
     const url = window.location.href;
     window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
  };

  if (loading) return <div className="p-12 text-center flex items-center justify-center min-h-screen">Chargement du module...</div>;

  const getChapStatus = (chapId: string) => {
    return progressData.some(p => p.chapitreId === chapId) ? 'completed' : 'pending';
  };

  return (
    <div className="flex h-screen bg-gray-50 flex-col md:flex-row overflow-hidden">
      {/* Sidebar Mobile Toggle */}
      <div className="md:hidden bg-gray-900 text-white p-4 flex justify-between items-center shrink-0">
        <Link to={`/formations/${slug}`} className="text-white hover:text-gray-300">
           <ArrowLeft size={24} />
        </Link>
        <span className="font-bold truncate px-4">{formation?.titre}</span>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 bg-gray-800 rounded">
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`w-full md:w-80 bg-white border-r flex flex-col shrink-0 transition-all ${sidebarOpen ? 'block absolute z-20 h-full' : 'hidden md:flex'}`}>
        <div className="p-6 border-b bg-gray-50 hidden md:block">
           <Link to={`/formations/${slug}`} className="text-gray-500 hover:text-gray-900 flex items-center gap-2 mb-4 text-sm font-medium">
             <ArrowLeft size={16} /> Quitter le cours
           </Link>
           <h2 className="font-bold leading-tight">{formation?.titre}</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {formation?.chapitres?.map((chap: any, idx: number) => {
             const status = getChapStatus(chap.id);
             const isActive = currentChapter?.id === chap.id;
             return (
               <button 
                 key={chap.id}
                 onClick={() => { setCurrentChapter(chap); setShowQuiz(false); setSidebarOpen(false); }}
                 className={`w-full text-left p-4 border-b flex gap-3 hover:bg-gray-50 transition-colors ${isActive ? 'bg-green-50 border-l-4 border-l-primary' : ''}`}
               >
                 <div className="mt-0.5">
                   {status === 'completed' ? <CheckCircle className="text-primary" size={20} /> : <Circle className="text-gray-300" size={20} />}
                 </div>
                 <div>
                   <p className={`text-sm font-semibold ${isActive ? 'text-primary' : 'text-gray-900'}`}>{idx + 1}. {chap.titre}</p>
                 </div>
               </button>
             );
          })}
          {quizData && (
             <button 
                onClick={() => { setCurrentChapter(null); setShowQuiz(true); setSidebarOpen(false); }}
                className={`w-full text-left p-4 border-b flex gap-3 hover:bg-gray-50 transition-colors ${showQuiz ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''}`}
             >
                <div className="mt-0.5"><Award className={showQuiz ? "text-indigo-600" : "text-gray-400"} size={20}/></div>
                <div><p className={`text-sm font-semibold ${showQuiz ? 'text-indigo-600' : 'text-gray-900'}`}>Évaluation Finale</p></div>
             </button>
          )}
          <div className="p-4 hidden md:block">
             <AdBanner slot="4411002421" format="rectangle" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div ref={mainContentRef} className="flex-1 overflow-y-auto bg-gray-50 relative h-full min-w-0">
         {showQuiz && quizData ? (
             <div className="max-w-3xl w-full mx-auto p-0 sm:p-4 md:p-8 pb-32 min-w-0 overflow-hidden">
                <AdBanner slot="7733655057" />
                <div className="bg-white rounded-none sm:rounded-2xl shadow-none sm:shadow-sm border-t-0 sm:border border-gray-100 p-4 sm:p-8 mt-0 sm:mt-4">
                   <h1 className="text-3xl font-bold mb-2">{quizData.titre}</h1>
                   {quizData.description && <p className="text-gray-600 mb-8">{quizData.description}</p>}
                   
                   {quizResult ? (
                      <div className="space-y-8">
                         <div className={`p-4 sm:p-8 rounded-none sm:rounded-3xl text-center shadow-none sm:shadow-sm border-b sm:border ${quizResult.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="text-6xl font-bold mb-4 flex justify-center">
                               {quizResult.passed ? <Award className="text-green-500 w-24 h-24 drop-shadow-md"/> : <X className="text-red-500 w-24 h-24 drop-shadow-md" />}
                            </div>
                            <h2 className="text-4xl font-black mb-2">{quizResult.score}% ({quizResult.passed ? 'Réussi' : 'Échec'})</h2>
                            <p className="text-lg font-medium text-gray-700">{quizResult.passed ? "Félicitations, vous avez validé cette formation !" : "Vous n'avez pas atteint le score requis de 70%. Veuillez réessayer."}</p>
                            {!quizResult.passed && (
                               <button onClick={() => { setQuizResult(null); setUserAnswers(new Array(quizData.questions.length).fill(-1)); }} className="mt-8 font-black bg-white text-gray-900 border px-4 sm:px-8 py-3 sm:py-4 rounded-2xl shadow-sm hover:bg-gray-50 flex items-center justify-center gap-2 mx-auto text-sm sm:text-base">
                                  Recommencer le Quiz
                               </button>
                            )}
                         </div>

                         {quizResult.passed && (
                            <div className="bg-white border-y sm:border rounded-none sm:rounded-3xl p-4 sm:p-8 shadow-none sm:shadow-sm">
                               <h3 className="text-2xl font-black mb-6 flex items-center justify-center gap-2"><Award className="text-yellow-500" /> Votre Certificat</h3>
                               
                               {/* Invisible / Scaled down container for PDF generation */}
                               <div className="relative rounded-2xl border-4 border-gray-100 bg-gray-50 mb-8 p-4 overflow-x-auto">
                                  <div ref={certificateRef} className="bg-white w-[800px] h-[565px] mx-auto p-12 relative flex flex-col items-center justify-center text-center origin-top shrink-0 min-w-[800px]" style={{ transform: 'scale(1)', background: 'linear-gradient(135deg, #f8fff9 0%, #ffffff 100%)' }}>
                                    <div className="absolute inset-2 border-4 border-double border-green-800/20 rounded-xl" />
                                    <div className="absolute inset-4 border border-green-800/10 rounded-lg" />
                                    
                                    <Award className="w-24 h-24 text-yellow-500 mb-6 drop-shadow-md" />
                                    <h1 className="text-5xl font-black text-gray-900 uppercase tracking-widest mb-2" style={{ fontFamily: 'serif' }}>Certificat de Réussite</h1>
                                    <p className="text-xl text-gray-500 italic mb-10">Décerné à</p>
                                    
                                    <h2 className="text-4xl font-bold text-green-700 mb-8 border-b-2 border-green-200 pb-4 inline-block px-12">
                                      {user?.profile?.prenom ? `${user.profile.prenom} ${user.profile.nom || ''}` : (user?.name || "Participant")}
                                    </h2>
                                    
                                    <p className="text-lg text-gray-600 mb-4">Pour avoir complété avec succès la formation :</p>
                                    <h3 className="text-2xl font-black text-gray-900 mb-12">{formation?.titre}</h3>
                                    
                                    <div className="flex justify-between w-full px-16 mt-auto">
                                      <div className="text-center">
                                         <p className="text-sm font-bold text-gray-800 border-b border-gray-300 pb-2 mb-1 w-32 mx-auto">{new Date().toLocaleDateString('fr-FR')}</p>
                                         <p className="text-xs text-gray-500 uppercase tracking-wider">Date</p>
                                      </div>
                                      <div className="text-center">
                                         <p className="text-sm font-bold text-gray-800 border-b border-gray-300 pb-2 mb-1 w-32 mx-auto font-serif italic text-2xl">Liggeybi</p>
                                         <p className="text-xs text-gray-500 uppercase tracking-wider">Signature Organisateur</p>
                                      </div>
                                    </div>
                                  </div>
                               </div>

                               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                  <button onClick={downloadCertificate} className="flex items-center justify-center gap-2 bg-[#006837] hover:bg-[#004d29] text-white font-black uppercase text-sm py-4 px-6 rounded-2xl shadow-lg transition-transform hover:-translate-y-1">
                                    <Download size={20} /> Télécharger
                                  </button>
                                  <button onClick={shareToFacebook} className="flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#166fe5] text-white font-black uppercase text-sm py-4 px-6 rounded-2xl shadow-lg transition-transform hover:-translate-y-1">
                                    <Facebook size={20} /> Facebook
                                  </button>
                                  <button onClick={shareToLinkedIn} className="flex items-center justify-center gap-2 bg-[#0A66C2] hover:bg-[#0958a6] text-white font-black uppercase text-sm py-4 px-6 rounded-2xl shadow-lg transition-transform hover:-translate-y-1">
                                    <Linkedin size={20} /> LinkedIn
                                  </button>
                               </div>
                            </div>
                         )}

                         <div className="mt-12">
                            <h3 className="font-black text-2xl mb-6">Correction du Quiz</h3>
                            <div className="space-y-6">
                                {quizData.questions.map((q: any, qi: number) => {
                                   const isCorrect = userAnswers[qi] === q.correctOptionIndex;
                                   return (
                                       <div key={qi} className={`border p-6 rounded-2xl ${isCorrect ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'}`}>
                                          <div className="flex gap-4 items-start mb-4">
                                             {isCorrect ? <CheckCircle className="text-green-500 mt-1" /> : <X className="text-red-500 mt-1" />}
                                             <h4 className="font-bold text-lg">{qi + 1}. {q.question}</h4>
                                          </div>
                                          <div className="space-y-2 ml-10">
                                              {q.options.map((opt: string, oi: number) => {
                                                 const isSelected = userAnswers[qi] === oi;
                                                 const isRightOption = q.correctOptionIndex === oi;
                                                 let optClass = 'bg-white border-gray-200 text-gray-500';
                                                 if (isRightOption) optClass = 'bg-green-100 border-green-500 text-green-900 font-bold';
                                                 else if (isSelected && !isRightOption) optClass = 'bg-red-100 border-red-500 text-red-900 font-bold strike';
                                                 return (
                                                     <div key={oi} className={`p-4 border shadow-sm rounded-xl ${optClass} flex items-center justify-between`}>
                                                         <span className={isSelected && !isRightOption ? 'line-through opacity-70' : ''}>{opt}</span>
                                                         {isSelected && !isRightOption && <span className="text-xs font-black uppercase text-red-600 bg-white px-2 py-1 rounded-md">Votre réponse</span>}
                                                         {isRightOption && isSelected && <span className="text-xs font-black uppercase text-green-700 bg-white px-2 py-1 rounded-md">Bonne réponse</span>}
                                                         {isRightOption && !isSelected && <span className="text-xs font-black uppercase text-green-700 bg-white px-2 py-1 rounded-md">La bonne réponse</span>}
                                                     </div>
                                                 );
                                              })}
                                          </div>
                                       </div>
                                   );
                                })}
                            </div>
                         </div>
                      </div>
                   ) : (
                      <div className="space-y-8">
                          {quizData.questions.map((q: any, qi: number) => (
                              <div key={qi} className="border-y sm:border p-4 sm:p-6 rounded-none sm:rounded-xl bg-gray-50">
                                 <h3 className="font-bold text-lg mb-4">{qi + 1}. {q.question}</h3>
                                 <div className="space-y-2">
                                     {q.options.map((opt: string, oi: number) => (
                                        <label key={oi} className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${userAnswers[qi] === oi ? 'bg-indigo-50 border-indigo-200' : 'bg-white hover:bg-gray-100'}`}>
                                            <input type="radio" name={`q-${qi}`} className="w-5 h-5 text-indigo-600" checked={userAnswers[qi] === oi} onChange={() => {
                                                const newAns = [...userAnswers];
                                                newAns[qi] = oi;
                                                setUserAnswers(newAns);
                                            }} />
                                            <span>{opt}</span>
                                        </label>
                                     ))}
                                 </div>
                              </div>
                          ))}
                          <div className="pt-4 border-t">
                              <button onClick={submitQuiz} disabled={userAnswers.includes(-1)} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-indigo-600/30">
                                 Soumettre mes réponses
                              </button>
                          </div>
                      </div>
                   )}
                </div>
             </div>
         ) : currentChapter ? (
            <div className="max-w-5xl w-full mx-auto p-0 sm:p-4 md:p-8 pb-32 min-w-0 overflow-x-hidden">
               <div className="mb-0 sm:mb-6">
                  <AdBanner slot="2905716196" format="rectangle" />
               </div>
               {(() => {
                  let isVisualFormat = false;
                  try {
                    const parsed = JSON.parse(currentChapter.description || '{}');
                    if (parsed.type === 'visual') isVisualFormat = true;
                  } catch(e) {}
                  
                  return isVisualFormat ? (
                    <VisualSlidePlayer chapter={currentChapter} onComplete={markCompleted} />
                  ) : (
                    <ArticlePlayer chapter={currentChapter} onComplete={markCompleted} />
                  );
               })()}
               <div className="mt-8">
                  <AdBanner slot="3384697577" />
               </div>
            </div>
         ) : (
            <div className="flex h-full flex-col justify-center items-center text-gray-500">
               <PlayCircle className="w-16 h-16 opacity-20 mb-4" />
               <p>Sélectionnez un chapitre pour commencer.</p>
            </div>
         )}
      </div>
    </div>
  );
}