import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Package } from 'lucide-react';

export function BoutiqueSuccess() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const orderId = searchParams.get('order');
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetch(`/api/public/orders/${orderId}/status`)
        .then(res => res.json())
        .then(data => {
          setOrderInfo(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [orderId]);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-center">
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 p-8 md:p-10 text-center max-w-md w-full">
        <CheckCircle className="mx-auto h-20 w-20 text-green-500 mb-6" />
        <h2 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Paiement Réussi !</h2>
        <p className="text-gray-600 mb-8 font-medium">
          Votre commande a été traitée avec succès.
        </p>

        {loading ? (
          <div className="flex flex-col items-center gap-2 mb-8">
            <div className="w-8 h-8 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Chargement des détails...</p>
          </div>
        ) : (
          <>
            <div className="bg-gray-50/80 rounded-3xl p-6 mb-8 border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Détails de la commande</p>
              <p className="text-sm font-bold text-gray-900 mb-2">{orderInfo?.product?.titre || 'Commande'}</p>
              <div className="w-full h-px bg-gray-100 my-3" />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">ID Transaction</p>
              <p className="text-[10px] text-gray-500 font-mono break-all">{orderId || 'N/A'}</p>
            </div>

            {orderInfo?.status === 'PAID' && orderInfo?.product?.type === 'DIGITAL' && orderInfo?.product?.fileUrl && (
              <div className="mb-8 p-6 bg-green-50 rounded-[2rem] border border-green-100 space-y-4">
                <Package className="h-8 w-8 text-green-600 mx-auto" />
                <div className="space-y-1">
                  <h3 className="font-black text-green-900 text-sm uppercase tracking-tight">Votre produit est prêt !</h3>
                  <p className="text-xs text-green-700 font-medium">Vous pouvez le télécharger directement ci-dessous.</p>
                </div>
                <a 
                  href={orderInfo.product.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full px-6 py-3 bg-[#F7BE16] hover:bg-[#eab308] text-white font-black rounded-2xl shadow-lg shadow-yellow-100 transition-all hover:scale-105 active:scale-95 text-xs uppercase tracking-widest"
                >
                  Télécharger / Accéder au Fichier
                </a>
              </div>
            )}
          </>
        )}

        <div className="space-y-4">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            Un email de confirmation a également été envoyé{orderInfo?.product?.type === 'DIGITAL' ? ' avec votre lien.' : '.'}
          </p>
          
          <Link to="/boutique" className="inline-flex items-center justify-center w-full px-6 py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition-all active:scale-95 text-xs uppercase tracking-widest">
            Continuer mes achats
          </Link>
        </div>
      </div>
    </div>
  );
}
