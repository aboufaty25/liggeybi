import React from 'react';
import { Send, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SpontaneousApplicationWidget() {
  return (
    <div className="mb-16">
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 hover:shadow-md transition-all duration-300">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="h-12 w-12 md:h-16 md:w-16 bg-teal-100 text-teal-600 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
            <Send className="h-6 w-6 md:h-8 md:w-8" />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-black text-slate-900 leading-tight">Candidature Spontanée</h3>
            <p className="text-slate-600 font-medium text-xs md:text-sm mt-1">
              Envoyez votre profil directement aux entreprises de notre réseau et multipliez vos chances.
            </p>
          </div>
        </div>
        <Link to="/candidature-spontanee" className="w-full md:w-auto shrink-0 bg-[#006837] hover:bg-[#004d29] text-white px-6 py-3 md:py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm">
            Voir les offres <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
