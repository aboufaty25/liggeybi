import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Download,
  Star,
  Award,
  MapPin,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function PremiumCvSlider() {
  const [cvs, setCvs] = useState<any[]>([]);
  const [selectedCv, setSelectedCv] = useState<string | null>(null);
  const { user } = useAuth();
  const isRecruiter = user?.role === "RECRUTEUR" || user?.role === "ADMIN";
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/profiles/premium")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCvs(data);
        }
      })
      .catch(console.error);
  }, []);

  const scrollLeft = () => {
    if (scrollRef.current)
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    if (scrollRef.current)
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };

  return (
    <div className="mb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full uppercase tracking-wider mb-3">
            <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> Profils
            d'Exception
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight">
            Candidats Premium
          </h2>
          <p className="text-gray-500 mt-2 font-medium max-w-2xl">
            Découvrez nos meilleurs talents qui ont mis en avant leur profil.
          </p>
          {!isRecruiter && (
            <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-center justify-between gap-4 max-w-2xl">
              <div>
                <h4 className="font-bold text-amber-900 text-sm">
                  Envie d'apparaître ici ?
                </h4>
                <p className="text-amber-700 text-xs mt-1">
                  Souscrivez à un Pack CV Premium pour mettre votre profil en
                  avant auprès des recruteurs.
                </p>
              </div>
              <a
                href="/candidat"
                className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] uppercase tracking-wider py-2 px-4 rounded-lg transition-colors"
              >
                Promouvoir mon CV
              </a>
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <button
            onClick={scrollLeft}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={scrollRight}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {cvs.length === 0 ? (
        <div className="bg-amber-50/50 border border-amber-100 border-dashed rounded-3xl p-10 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-amber-50">
            <Star className="h-8 w-8 text-amber-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Soyez le premier à briller !
          </h3>
          <p className="text-gray-500 max-w-md font-medium text-sm mb-6">
            Il n'y a pas encore de CV premium mis en avant. Profitez de cette
            opportunité pour capter toute l'attention des recruteurs.
          </p>
          {!isRecruiter && (
            <Button nativeButton={false} render={<Link to="/candidat" />} className="bg-amber-500 hover:bg-amber-600 text-white font-bold h-12 px-8 rounded-xl">Promouvoir mon CV maintenant</Button>
          )}
        </div>
      ) : (
        <motion.div
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 md:gap-6 pb-6 px-1 -mx-1 snap-x snap-mandatory hide-scrollbar"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          <AnimatePresence>
            {cvs.map((cv, index) => (
              <motion.div
                key={cv.id}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="flex-none w-[220px] md:w-[320px] snap-start bg-white rounded-xl md:rounded-[2rem] border border-amber-200 shadow-xl shadow-amber-900/10 p-4 md:p-6 flex flex-col relative overflow-hidden group cursor-pointer"
              >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-100 to-orange-100 rounded-bl-full -z-0 transition-transform duration-500 group-hover:scale-125 opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-amber-50 to-transparent rounded-tr-full -z-0 transition-transform duration-500 group-hover:scale-150 opacity-70"></div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5">
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                      className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500 text-white flex items-center justify-center text-2xl md:text-3xl font-black shadow-lg shadow-orange-500/40 border-[3px] md:border-4 border-white transform -rotate-3 group-hover:rotate-0 transition-all duration-300"
                    >
                      {cv.prenom?.[0] || cv.user?.name?.[0] || "C"}
                    </motion.div>
                    <div className="bg-gradient-to-r from-amber-100 to-orange-100 text-orange-600 p-2.5 rounded-xl shadow-inner border border-amber-50">
                      <Award className="h-5 w-5" />
                    </div>
                  </div>

                  <h3 className="font-black text-gray-900 text-base md:text-xl line-clamp-1 mb-1 group-hover:text-amber-700 transition-colors">
                    {cv.prenom || cv.user?.name || "Anonyme"} {cv.nom || ""}
                  </h3>
                  <p className="text-sm font-bold text-amber-600 mb-4 line-clamp-1">
                    {cv.titre || "Candidat qualifié"}
                  </p>

                  {/* PDF Preview */}
                  {cv.cvUrl && (
                    <div 
                      className="mb-4 relative w-full h-40 rounded-xl overflow-hidden border border-gray-200 bg-white group/pdf cursor-pointer shadow-sm"
                      onClick={() => isRecruiter && setSelectedCv(cv.cvUrl)}
                    >
                      <iframe 
                        src={`${cv.cvUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                        className="absolute top-0 left-0 w-[200%] h-[200%] border-0 scale-50 origin-top-left pointer-events-none"
                        title="PDF Preview"
                      />
                      <div className="absolute inset-0 bg-transparent group-hover/pdf:bg-gray-900/5 transition-colors flex items-center justify-center">
                         <div className="opacity-0 group-hover/pdf:opacity-100 transition-opacity bg-white/95 text-gray-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 px-4 py-2 rounded-xl shadow-lg border border-gray-100 transform translate-y-2 group-hover/pdf:translate-y-0 duration-200">
                           <Eye className="w-4 h-4" /> Voir le CV complet
                         </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 mb-6">
                    {(cv.ville || cv.pays) && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400 shrink-0" />
                        <span className="line-clamp-1">
                          {cv.ville}
                          {cv.ville && cv.pays ? ", " : ""}
                          {cv.pays}
                        </span>
                      </div>
                    )}
                    {cv.secteurs && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Briefcase className="h-4 w-4 mr-2 text-gray-400 shrink-0" />
                        <span className="line-clamp-1">{cv.secteurs}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-auto relative z-10 flex gap-2">
                  {isRecruiter ? (
                    <>
                      <Button
                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold h-10 rounded-xl text-xs uppercase"
                        onClick={() => setSelectedCv(cv.cvUrl)}
                      >
                        <Eye className="h-4 w-4 mr-1.5" /> Voir
                      </Button>
                      <a
                        href={cv.cvUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 shrink-0 bg-white border border-gray-200 text-gray-600 hover:text-amber-600 hover:border-amber-200 rounded-xl flex items-center justify-center transition-colors"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </>
                  ) : (
                    <div className="w-full text-center py-2 px-3 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                      Accès Réservé aux Recruteurs
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

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
