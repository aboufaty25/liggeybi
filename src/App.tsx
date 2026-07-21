import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Home } from '@/pages/Home';
import { CategoryPage } from '@/pages/CategoryPage';
import { SearchResults } from '@/pages/SearchResults';
import { About } from '@/pages/About';
import { Contact } from '@/pages/Contact';
import { Legal } from '@/pages/Legal';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { Boutique } from '@/pages/Boutique';
import { BoutiqueSuccess } from '@/pages/BoutiqueSuccess';
import { RecruiterDashboard } from '@/pages/RecruiterDashboard';
import { CandidateDashboard } from '@/pages/CandidateDashboard';
import { LocalOffreDetail } from '@/pages/LocalOffreDetail';
import { DestinationTopic } from '@/pages/DestinationTopic';
import { CVtheque } from '@/pages/CVtheque';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { TikTokBrowserGuide } from '@/components/layout/TikTokBrowserGuide';
import { SocialBrowserGuide } from '@/components/layout/SocialBrowserGuide';
import { AuthProvider } from '@/contexts/AuthContext';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OneSignalInit } from '@/components/OneSignalInit';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import { AdSenseUpdater } from '@/components/AdSenseUpdater';
import { motion, AnimatePresence } from 'framer-motion';

import FormationsList from '@/pages/FormationsList';
import FormationDetail from '@/pages/FormationDetail';
import FormationLearn from '@/pages/FormationLearn';
import AdminFormations from '@/pages/AdminFormations';
import AdminFormationEdit from '@/pages/AdminFormationEdit';
import AdminDestinations from '@/pages/AdminDestinations';
import AdminDestinationEdit from '@/pages/AdminDestinationEdit';
import { AdminCandidats } from '@/pages/AdminCandidats';

import { DestinationArticleDetail } from '@/pages/DestinationArticleDetail';

export default function App() {
  const location = useLocation();
  
  return (
    <HelmetProvider>
      <Helmet>
        <meta name="google-site-verification" content="fn-8IXfW3SOTJV7ztrJPppdbUPFBHzPl-S_yVFpAt6s" />
      </Helmet>
      <AuthProvider>
        <OneSignalInit />
        <GoogleAnalytics />
        <AdSenseUpdater />
        <div className="min-h-screen flex flex-col bg-gray-50 selection:bg-blue-100 selection:text-blue-900">
        <TikTokBrowserGuide />
        <SocialBrowserGuide />
        <Header />
        <main className="flex-1 pb-16 md:pb-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/offre-demploi" element={<CategoryPage />} />
            <Route path="/bourses" element={<CategoryPage />} />
            <Route path="/concours" element={<CategoryPage />} />
            <Route path="/formations" element={<FormationsList />} />
            <Route path="/formations/:slug" element={<FormationDetail />} />
            <Route path="/formations/:slug/learn" element={<FormationLearn />} />
            <Route path="/admin/formations" element={<AdminFormations />} />
            <Route path="/admin/formations/:id" element={<AdminFormationEdit />} />
            <Route path="/admin/articles" element={<AdminDestinations />} />
            <Route path="/admin/articles/:id" element={<AdminDestinationEdit />} />
            <Route path="/admin/candidats" element={<AdminCandidats />} />
            <Route path="/emploi-international" element={<CategoryPage />} />
            <Route path="/destination/:region/:topicSlug" element={<DestinationTopic />} />
            <Route path="/candidature-spontanee" element={<CategoryPage />} />
            <Route path="/appels-doffres" element={<CategoryPage />} />
            <Route path="/finance-business" element={<CategoryPage />} />
            <Route path="/stage" element={<CategoryPage />} />
            
            <Route path="/a-propos" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/mentions-legales" element={<Legal />} />
            
            <Route path="/recherche" element={<SearchResults />} />
            <Route path="/boutique" element={<Boutique />} />
            <Route path="/boutique/success" element={<BoutiqueSuccess />} />
            <Route path="/connexion" element={<Login />} />
            <Route path="/inscription" element={<Register />} />
            
            {/* Private Dashboards */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/recruteur" element={<RecruiterDashboard />} />
            <Route path="/candidat" element={<CandidateDashboard />} />
            <Route path="/cvtheque" element={<CVtheque />} />
            
            <Route path="/offre/:idOrSlug" element={<LocalOffreDetail />} />
            <Route path="/offre/:idOrSlug/:title" element={<LocalOffreDetail />} />
            <Route path="/:idOrSlug" element={<LocalOffreDetail />} />
            <Route path="/article/:idOrSlug" element={<LocalOffreDetail />} />
            <Route path="/destination-article/:idOrSlug" element={<DestinationArticleDetail />} />
          </Routes>
        </main>
        <Footer />
      </div>
      </AuthProvider>
    </HelmetProvider>
  );
}
