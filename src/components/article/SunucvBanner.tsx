import { Button } from '@/components/ui/button';
import { ExternalLink, CheckCircle2 } from 'lucide-react';

export function SunucvBanner() {
  return (
    <div className="bg-gradient-to-r from-[#006837] to-[#004d29] rounded-xl p-4 sm:p-6 text-white shadow-lg overflow-hidden relative group my-6">
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-2xl transition-transform group-hover:scale-110" />
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1 space-y-2 text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-black leading-tight tracking-tight">
            Boostez votre candidature !
          </h2>
          <p className="text-blue-50 text-sm sm:text-base">
            Créez un CV professionnel en 5 min sur <a href="https://sunucv.com" target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-white transition-colors">sunucv.com</a>
          </p>
        </div>
        <div className="shrink-0 w-full sm:w-auto">
          <a href="https://sunucv.com" target="_blank" rel="noopener noreferrer" className="block">
            <Button size="sm" className="w-full sm:w-auto bg-white text-[#006837] hover:bg-gray-100 font-bold text-sm sm:text-base px-6 py-4 sm:py-5 shadow-md">
              C'est parti <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
