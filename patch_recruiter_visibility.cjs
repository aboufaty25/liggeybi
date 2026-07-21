const fs = require('fs');
let content = fs.readFileSync('src/pages/RecruiterDashboard.tsx', 'utf8');

const regex = /<div className="grid sm:grid-cols-3 gap-4">([\s\S]*?)<\/div>\s*<\/div>\s*\)\}\s*<div className="space-y-2 md:col-span-2 flex justify-end mt-4">/g;
const match = regex.exec(content);
if (!match) {
    console.log("Not found visibility grid");
    process.exit(1);
}

let newReplacement = `<div className="grid grid-cols-3 gap-2 md:gap-4">
                        {[
                          { id: 'standard', name: 'Standard', desc: 'Publication normale', cost: 0, color: 'border-yellow-200 bg-white hover:border-yellow-300' },
                          { id: 'urgent', name: 'Urgent', desc: 'Logo "Urgent" et mis en avant', cost: 2, color: 'border-orange-200 bg-orange-50 hover:border-orange-400' },
                          { id: 'premium', name: 'Premium', desc: 'En tête de liste (7 jours)', cost: 3, color: 'border-primary/50 bg-primary/5 hover:border-primary' },
                        ].map((v) => (
                          <label key={v.id} className={\`cursor-pointer border-2 rounded-xl p-2 md:p-4 flex flex-col justify-between transition-all \${visibilite === v.id ? 'ring-2 ring-primary ring-offset-2 scale-[1.02] ' + v.color : v.color}\`}>
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-1 md:gap-4 text-center md:text-left">
                              <input type="radio" value={v.id} checked={visibilite === v.id} onChange={() => setVisibilite(v.id as any)} className="mt-1 md:mt-0" />
                              <div className="flex-1 w-full">
                                <h4 className="font-bold text-[10px] md:text-base text-gray-900 leading-tight">{v.name}</h4>
                                <p className="text-[8px] md:text-[10px] text-gray-500 mt-1 hidden md:block">{v.desc}</p>
                              </div>
                            </div>
                            <div className="mt-2 md:mt-4 pt-2 md:pt-4 border-t border-black/5 flex flex-col md:flex-row items-center md:items-end justify-center md:justify-between font-black text-gray-900">
                              <span className="flex items-center gap-1 text-[9px] md:text-sm text-center">
                                 <Coins className="h-3 w-3 md:h-4 md:w-4 text-yellow-500" /> 
                                 {v.cost === 0 ? 'Gratuit' : <>\${v.cost} <span className="hidden md:inline">\${v.cost > 1 ? 'Crédits' : 'Crédit'}</span></>}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="space-y-2 md:col-span-2 flex justify-end mt-4">`;

content = content.replace(regex, newReplacement);
fs.writeFileSync('src/pages/RecruiterDashboard.tsx', content);
console.log("Recruiter visibility grid patched");
