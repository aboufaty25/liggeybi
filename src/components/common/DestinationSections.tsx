import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe2, Plane, GraduationCap, Briefcase, MapPin, ExternalLink, ArrowRight, Landmark, FileText, CheckCircle2, Building2, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { slugify } from '@/lib/utils';

const EUROPE_TAGS = [
  { name: "Étudier en Europe", icon: <GraduationCap className="w-5 h-5" /> },
  { name: "Bourses européennes", icon: <Landmark className="w-5 h-5" /> },
  { name: "Visa étudiant", icon: <FileText className="w-5 h-5" /> },
  { name: "Universités européennes", icon: <Building2 className="w-5 h-5" /> }
];

const CANADA_TAGS = [
  { name: "Entrée Express", icon: <CheckCircle2 className="w-5 h-5" /> },
  { name: "Permis d'études", icon: <GraduationCap className="w-5 h-5" /> },
  { name: "Permis de travail", icon: <Briefcase className="w-5 h-5" /> },
  { name: "PNP Canada", icon: <MapPin className="w-5 h-5" /> }
];

export function DestinationSections() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-10 space-y-12">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Europe Section */}
        <motion.section 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          aria-labelledby="europe-heading"
          className="order-2 lg:order-1 bg-white rounded-[2rem] p-6 sm:p-8 md:p-10 border border-gray-100 relative overflow-hidden shadow-2xl shadow-indigo-900/5 group"
        >
          {/* Subtle Background Accent */}
          <div aria-hidden="true" className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-1000">
             <motion.div
               animate={{ rotate: 360 }}
               transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
             >
                <Globe2 className="w-64 h-64 text-indigo-900" />
             </motion.div>
          </div>
          <div aria-hidden="true" className="absolute -left-20 -bottom-20 w-64 h-64 bg-indigo-50 blur-3xl rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col h-full">
            <div className="inline-flex items-center self-start space-x-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full text-indigo-800 font-bold text-xs uppercase tracking-widest mb-6">
              <span aria-hidden="true" className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span>Destination Europe</span>
            </div>

            <motion.h2 
               id="europe-heading"
               initial={{ opacity: 0, y: 10 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-none mb-4"
            >
              Votre avenir en <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Europe</span>
            </motion.h2>

            <motion.p 
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               transition={{ delay: 0.3 }}
               className="text-gray-600 font-medium mb-8 max-w-md text-base leading-relaxed"
            >
              Découvrez toutes les bourses et les démarches essentielles pour réussir votre projet universitaire et d'immigration en Europe.
            </motion.p>

            <motion.div 
               variants={{
                 hidden: { opacity: 0 },
                 show: { opacity: 1, transition: { staggerChildren: 0.1 } }
               }}
               initial="hidden"
               whileInView="show"
               viewport={{ once: true }}
               className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8"
               aria-label="Catégories d'opportunités en Europe"
            >
              {EUROPE_TAGS.map((tag, idx) => (
                <motion.div key={idx} variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}>
                  <Link 
                    to={`/destination/europe/${slugify(tag.name)}`}
                    title={`Voir les opportunités pour ${tag.name}`}
                    className="flex items-center gap-3 bg-white hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 text-sm font-bold text-gray-800 px-4 py-3 rounded-2xl transition-all shadow-sm hover:shadow-md"
                  >
                    <span aria-hidden="true" className="text-indigo-500 bg-indigo-50 p-2 rounded-xl">
                      {tag.icon}
                    </span>
                    {tag.name}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Canada Section */}
        <motion.section 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          aria-labelledby="canada-heading"
          className="order-1 lg:order-2 bg-white rounded-[2rem] p-6 sm:p-8 md:p-10 border border-gray-100 relative overflow-hidden shadow-2xl shadow-red-900/5 group"
        >
          <div aria-hidden="true" className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-1000">
             <motion.div
               animate={{ translateY: [-10, 10, -10] }}
               transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
             >
               <Plane className="w-64 h-64 text-red-900" />
             </motion.div>
          </div>
          <div aria-hidden="true" className="absolute -right-20 -bottom-20 w-64 h-64 bg-red-50 blur-3xl rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col h-full">
            <div className="inline-flex items-center self-start space-x-2 bg-red-50 border border-red-100 px-4 py-2 rounded-full text-red-800 font-bold text-xs uppercase tracking-widest mb-6">
              <span aria-hidden="true" className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>Destination Canada</span>
            </div>

            <motion.h2 
               id="canada-heading"
               initial={{ opacity: 0, y: 10 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-none mb-4"
            >
              Immigration <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-500">Canada</span>
            </motion.h2>

            <motion.p 
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               transition={{ delay: 0.3 }}
               className="text-gray-600 font-medium mb-8 max-w-md text-base leading-relaxed"
            >
              Programmes de travailleurs qualifiés, entrée express et permis d'études. Tout ce dont vous avez besoin pour le rêve canadien d'immigration.
            </motion.p>

            <motion.div 
               variants={{
                 hidden: { opacity: 0 },
                 show: { opacity: 1, transition: { staggerChildren: 0.1 } }
               }}
               initial="hidden"
               whileInView="show"
               viewport={{ once: true }}
               className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8"
               aria-label="Programmes et opportunités au Canada"
            >
              {CANADA_TAGS.map((tag, idx) => (
                <motion.div key={idx} variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}>
                  <Link 
                    to={`/destination/canada/${slugify(tag.name)}`}
                    title={`Découvrir le programme : ${tag.name}`}
                    className="flex items-center gap-3 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 text-sm font-bold text-gray-800 px-4 py-3 rounded-2xl transition-all shadow-sm hover:shadow-md"
                  >
                    <span aria-hidden="true" className="text-red-500 bg-red-50 p-2 rounded-xl">
                      {tag.icon}
                    </span>
                    {tag.name}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

