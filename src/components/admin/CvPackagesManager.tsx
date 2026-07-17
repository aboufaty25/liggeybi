import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Edit2, Trash2, Plus } from 'lucide-react';

export function CvPackagesManager() {
  const { token } = useAuth();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    nom: '', description: '', prix: '', dureeJours: '30', type: 'BOOST', options: '', actif: true
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, [token]);

  const fetchPackages = async () => {
    try {
      if (!token) return;
      const res = await fetch('/api/admin/cv-packages', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setPackages(await res.json());
      setLoading(false);
    } catch(err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        nom: formData.nom,
        description: formData.description,
        prix: parseFloat(formData.prix),
        dureeJours: parseInt(formData.dureeJours),
        type: formData.type,
        options: formData.options,
        actif: formData.actif
      };
      
      const url = editingId ? `/api/admin/cv-packages/${editingId}` : '/api/admin/cv-packages';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(editingId ? "Pack modifié." : "Pack ajouté.");
        setFormData({ nom: '', description: '', prix: '', dureeJours: '30', type: 'BOOST', options: '', actif: true });
        setEditingId(null);
        fetchPackages();
      } else {
        alert("Erreur");
      }
    } catch(err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Supprimer ce pack ?")) return;
    try {
      await fetch(`/api/admin/cv-packages/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchPackages();
    } catch(err) {
      console.error(err);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-black uppercase text-gray-900">Packages Mise en avant CV</h3>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h4 className="font-bold text-gray-800 mb-4">{editingId ? "Modifier le pack" : "Nouveau pack CV"}</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Type de Pack</Label>
              <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full h-10 px-3 bg-gray-50 rounded-md border-none text-sm outline-none focus:ring-2 focus:ring-[#006837] mb-4">
                <option value="BOOST">Pack de Visibilité (Premium)</option>
                <option value="DEPOT">Pack d'Importation (Dépôt CV)</option>
              </select>
            </div>
            <div>
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Nom du Pack</Label>
              <Input required value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} placeholder="Ex: Pack Premium CV 30j" className="bg-gray-50 border-none" />
            </div>
            <div>
               <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Prix (FCFA)</Label>
               <Input required type="number" min="0" value={formData.prix} onChange={e => setFormData({...formData, prix: e.target.value})} className="bg-gray-50 border-none" />
            </div>
            <div>
               <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Durée de validité du Pack (Jours)</Label>
               <select required value={formData.dureeJours} onChange={e => setFormData({...formData, dureeJours: e.target.value})} className="w-full h-10 px-3 bg-gray-50 rounded-md border-none text-sm outline-none focus:ring-2 focus:ring-[#006837] transition-all">
                 <option value="1">1 Jour (Journalier)</option>
                 <option value="30">30 Jours (Mensuel)</option>
                 <option value="365">365 Jours (Annuel)</option>
                 <option value="99999">Illimité (À vie)</option>
               </select>
            </div>
            <div>
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Description courte</Label>
              <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-gray-50 border-none" />
            </div>
            <div>
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Options (séparées par une virgule)</Label>
              <Textarea value={formData.options} onChange={e => setFormData({...formData, options: e.target.value})} placeholder="En tête de liste, Badge VIP..." className="bg-gray-50 border-none h-20" />
            </div>
            <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
               <Switch checked={formData.actif} onCheckedChange={c => setFormData({...formData, actif: c})} />
               <Label className="font-bold text-sm text-gray-700 cursor-pointer">Pack Actif</Label>
            </div>
            <div className="flex gap-2 mt-4">
               {editingId && (
                 <Button type="button" variant="outline" onClick={() => { setEditingId(null); setFormData({ nom: '', description: '', prix: '', dureeJours: '30', type: 'BOOST', options: '', actif: true }); }} className="flex-1">Annuler</Button>
               )}
               <Button type="submit" className="flex-1 bg-[#006837] hover:bg-[#004d29] text-white font-bold">{editingId ? "Modifier" : "Ajouter"}</Button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
           {packages.map(p => (
             <div key={p.id} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 rounded-2xl border ${p.actif ? 'bg-white border-gray-100 shadow-sm' : 'bg-gray-50 border-dashed border-gray-200 opacity-60'}`}>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                     <span className="bg-amber-50 text-amber-700 py-1 px-3 rounded-lg mr-2 font-black">{p.type === 'DEPOT' ? 'DÉPÔT CV' : 'BOOST'}</span>
                    <h5 className="font-black text-lg text-gray-900">{p.nom}</h5>
                    {!p.actif && <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 font-bold text-[10px] uppercase">Inactif</span>}
                  </div>
                  <p className="text-gray-500 text-sm mb-2 max-w-md">{p.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm font-bold text-gray-700">
                    <span className="bg-emerald-50 text-emerald-700 py-1 px-3 rounded-lg">{p.prix} FCFA</span>
                    <span className="bg-indigo-50 text-indigo-700 py-1 px-3 rounded-lg">{p.dureeJours >= 99999 ? 'Illimité' : `${p.dureeJours} Jours M.E.A`}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 sm:mt-0">
                  <Button variant="outline" size="sm" onClick={() => {
                     setEditingId(p.id);
                     setFormData({ nom: p.nom, description: p.description || '', prix: String(p.prix), dureeJours: String(p.dureeJours), type: p.type || 'BOOST', options: p.options || '', actif: p.actif });
                  }}>
                    <Edit2 className="w-4 h-4 text-blue-600" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(p.id)} className="hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
             </div>
           ))}
           {packages.length === 0 && (
             <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 text-gray-400 font-medium">Aucun pack CV configuré.</div>
           )}
        </div>
      </div>
    </div>
  );
}
