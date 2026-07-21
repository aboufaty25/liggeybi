const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const regex = /<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-16">([\s\S]*?)<\/div>\s*<div className="grid grid-cols-1/g;
const match = regex.exec(content);
if (match) {
    let newReplacement = `<div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6 mb-16">
           <Link to="/offre-demploi" className="relative overflow-hidden bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl shadow-indigo-100/30 hover:shadow-2xl hover:shadow-indigo-200/50 border border-slate-100 hover:border-indigo-200 transition-all duration-300 group flex flex-col items-center text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-xl md:rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 md:mb-6 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
              </div>
              <h3 className="relative font-black text-sm sm:text-lg md:text-xl xl:text-2xl text-slate-900 group-hover:text-indigo-700 transition-colors">Emplois</h3>
              <p className="relative text-[10px] sm:text-xs md:text-sm font-medium text-slate-500 mt-1 sm:mt-2">Secteur privé & public</p>
           </Link>
           <Link to="/bourses" className="relative overflow-hidden bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl shadow-emerald-100/30 hover:shadow-2xl hover:shadow-emerald-200/50 border border-slate-100 hover:border-emerald-200 transition-all duration-300 group flex flex-col items-center text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-xl md:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 md:mb-6 group-hover:scale-110 group-hover:-rotate-3 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
                <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
              </div>
              <h3 className="relative font-black text-sm sm:text-lg md:text-xl xl:text-2xl text-slate-900 group-hover:text-emerald-700 transition-colors">Bourses</h3>
              <p className="relative text-[10px] sm:text-xs md:text-sm font-medium text-slate-500 mt-1 sm:mt-2">Études supérieures</p>
           </Link>
           <Link to="/formations" className="relative overflow-hidden bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl shadow-amber-100/30 hover:shadow-2xl hover:shadow-amber-200/50 border border-slate-100 hover:border-amber-200 transition-all duration-300 group flex flex-col items-center text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-xl md:rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-3 md:mb-6 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 shadow-sm">
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
              </div>
              <h3 className="relative font-black text-sm sm:text-lg md:text-xl xl:text-2xl text-slate-900 group-hover:text-amber-600 transition-colors">Se former</h3>
              <p className="relative text-[10px] sm:text-xs md:text-sm font-medium text-slate-500 mt-1 sm:mt-2">Formations & Coaching</p>
           </Link>
           <Link to="/concours" className="relative overflow-hidden bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl shadow-rose-100/30 hover:shadow-2xl hover:shadow-rose-200/50 border border-slate-100 hover:border-rose-200 transition-all duration-300 group flex flex-col items-center text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-xl md:rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-3 md:mb-6 group-hover:scale-110 group-hover:-rotate-3 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300 shadow-sm">
                <Trophy className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
              </div>
              <h3 className="relative font-black text-sm sm:text-lg md:text-xl xl:text-2xl text-slate-900 group-hover:text-rose-700 transition-colors">Concours</h3>
              <p className="relative text-[10px] sm:text-xs md:text-sm font-medium text-slate-500 mt-1 sm:mt-2">Fonction publique</p>
           </Link>
           <Link to="/candidature-spontanee" className="relative overflow-hidden bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl shadow-purple-100/30 hover:shadow-2xl hover:shadow-purple-200/50 border border-slate-100 hover:border-purple-200 transition-all duration-300 group flex flex-col items-center text-center col-span-2 lg:col-span-1">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-xl md:rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 md:mb-6 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-sm">
                <Send className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
              </div>
              <h3 className="relative font-black text-sm sm:text-lg md:text-xl xl:text-2xl text-slate-900 group-hover:text-purple-700 transition-colors">Spontanée</h3>
              <p className="relative text-[10px] sm:text-xs md:text-sm font-medium text-slate-500 mt-1 sm:mt-2">Déposer votre CV</p>
           </Link>
        </div>

        <div className="grid grid-cols-1`;
    content = content.replace(regex, newReplacement);
    
    // Make sure Send is imported from lucide-react
    if (!content.includes("Send,")) {
        content = content.replace("import { ", "import { Send, ");
    }
    
    fs.writeFileSync('src/pages/Home.tsx', content);
    console.log("Home categories patched");
} else {
    console.log("Regex not matched in Home.tsx");
}
