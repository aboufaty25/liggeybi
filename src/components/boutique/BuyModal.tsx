import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { XCircle, ShieldCheck, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface Product {
  id: string;
  titre: string;
  prix: number;
  prixPromo: number | null;
  type: string;
  stock: number;
  imageUrl?: string;
  description?: string;
}

interface BuyModalProps {
  product: Product | null;
  onClose: () => void;
}

export function BuyModal({ product, onClose }: BuyModalProps) {
  const [buyForm, setBuyForm] = useState({ name: '', email: '', phone: '', quantity: 1, sendEmail: product?.type === 'DIGITAL' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!product) return null;

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/public/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          customerName: buyForm.name,
          customerEmail: buyForm.email || null,
          customerPhone: buyForm.phone,
          quantity: buyForm.quantity
        })
      });
      const data = await res.json();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        alert(data.error || 'Erreur lors du paiement');
        setIsSubmitting(false);
      }
    } catch(err) {
      alert('Erreur réseau');
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gray-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
      >
         <motion.div 
           initial={{ scale: 0.9, y: 20 }}
           animate={{ scale: 1, y: 0 }}
           exit={{ scale: 0.9, y: 20 }}
           className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full p-8 md:p-10 relative overflow-y-auto max-h-[92vh] border border-gray-100 flex flex-col md:flex-row gap-8"
         >
           <button onClick={onClose} className="absolute top-6 right-6 h-10 w-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors z-20">
              <XCircle className="h-6 w-6 text-gray-400" />
           </button>
           
           <div className="flex-1 space-y-6">
             <div className="h-48 md:h-64 object-cover rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center relative">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.titre} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-gray-300 font-bold uppercase">Sans image</div>
                )}
                {product.prixPromo && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white font-black uppercase tracking-widest text-[10px] px-3 py-1 rounded-full shadow-lg animate-pulse">
                    Promo
                  </div>
                )}
             </div>
             <div>
                <Badge className="bg-green-50 text-green-700 border-none uppercase font-black text-[10px] tracking-widest px-3 mb-3">Paiement Sécurisé</Badge>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-gray-900 leading-tight mb-2">{product.titre}</h2>
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-black text-3xl text-[#006837] tracking-tighter">
                    {(product.prixPromo || product.prix).toLocaleString()} CFA
                  </span>
                  {product.prixPromo && (
                    <span className="text-sm text-gray-400 font-bold line-through">
                      {product.prix.toLocaleString()} CFA
                    </span>
                  )}
                </div>
                {product.description && (
                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
                    {product.description}
                  </p>
                )}
             </div>
           </div>

           <div className="flex-1 space-y-6 md:border-l md:border-gray-100 md:pl-8">
             <div className="bg-gray-50/80 p-5 rounded-3xl flex justify-between items-center border border-gray-100 mt-2 md:mt-0 mb-6">
                <span className="font-black uppercase text-[10px] text-gray-400 tracking-widest">Total</span>
                <span className="font-black text-2xl text-gray-900 tracking-tighter">
                  {((product.prixPromo || product.prix) * buyForm.quantity).toLocaleString()} CFA
                </span>
             </div>

             <form onSubmit={handleBuy} className="space-y-4">
               <div className="grid gap-4">
                 <div className="space-y-1.5">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Nom Complet</Label>
                   <Input required value={buyForm.name} onChange={e => setBuyForm({...buyForm, name: e.target.value})} className="h-12 rounded-[1.2rem] bg-gray-50 border border-gray-100 px-5 font-bold focus:bg-white focus:ring-2 focus:ring-[#006837]/20 focus:border-[#006837]" placeholder="Votre nom" />
                 </div>

                 <div className="space-y-1.5">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Numéro de Téléphone</Label>
                   <Input type="tel" required value={buyForm.phone} onChange={e => setBuyForm({...buyForm, phone: e.target.value})} className="h-12 rounded-[1.2rem] bg-gray-50 border border-gray-100 px-5 font-bold focus:bg-white focus:ring-2 focus:ring-[#006837]/20 focus:border-[#006837]" placeholder="77 000 00 00" />
                 </div>

                 <div className="flex items-center gap-3 p-4 bg-gray-50/50 hover:bg-gray-50 rounded-2xl border border-gray-100 transition-colors">
                   <input 
                     type="checkbox" 
                     id="sendEmail"
                     checked={buyForm.sendEmail}
                     onChange={e => setBuyForm({...buyForm, sendEmail: e.target.checked})}
                     className="w-5 h-5 rounded-md border-gray-300 text-[#006837] focus:ring-[#006837]"
                   />
                   <label htmlFor="sendEmail" className="text-[11px] font-black uppercase tracking-wide text-gray-600 cursor-pointer flex items-center gap-2">
                      <Mail className="h-4 w-4 text-[#006837]" />
                      Recevoir par Email
                   </label>
                 </div>

                 <AnimatePresence>
                   {buyForm.sendEmail && (
                     <motion.div 
                       initial={{ opacity: 0, height: 0 }}
                       animate={{ opacity: 1, height: 'auto' }}
                       exit={{ opacity: 0, height: 0 }}
                       className="space-y-1.5 overflow-hidden"
                     >
                       <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Adresse Email</Label>
                       <Input type="email" value={buyForm.email} onChange={e => setBuyForm({...buyForm, email: e.target.value})} className="h-12 rounded-[1.2rem] bg-gray-50 border border-gray-100 px-5 font-bold focus:bg-white focus:ring-2 focus:ring-[#006837]/20 focus:border-[#006837]" placeholder="votre@email.com (Recommandé)" />
                     </motion.div>
                   )}
                 </AnimatePresence>

                 {product.type === 'PHYSICAL' && (
                   <div className="space-y-1.5">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Quantité (Max {product.stock})</Label>
                     <Input type="number" min="1" max={product.stock} required value={buyForm.quantity} onChange={e => setBuyForm({...buyForm, quantity: Number(e.target.value)})} className="h-12 rounded-[1.2rem] bg-gray-50 border border-gray-100 px-5 font-bold focus:bg-white focus:ring-2 focus:ring-[#006837]/20 focus:border-[#006837]" />
                   </div>
                 )}
               </div>
               
               <Button disabled={isSubmitting} type="submit" className="w-full h-14 mt-4 bg-[#006837] hover:bg-[#004d29] text-white rounded-[1.2rem] font-black shadow-xl shadow-[#006837]/10 transition-all active:scale-95 text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                 {isSubmitting ? (
                   <>
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                     Redirection...
                   </>
                 ) : (
                   <><ShieldCheck className="h-6 w-6" /> Acheter {((product.prixPromo || product.prix) * buyForm.quantity).toLocaleString()} CFA</>
                 )}
               </Button>
               <div className="flex items-center justify-center gap-4 text-[9px] font-black uppercase tracking-widest text-gray-300 pt-2">
                  <span>Wave</span>
                  <div className="w-1 h-1 bg-gray-200 rounded-full" />
                  <span>Orange Money</span>
                  <div className="w-1 h-1 bg-gray-200 rounded-full" />
                  <span>Free</span>
               </div>
             </form>
           </div>
         </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
