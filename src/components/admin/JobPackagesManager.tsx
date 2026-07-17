import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Edit2, Trash2, Plus } from 'lucide-react';

export function JobPackagesManager() {
  const { token } = useAuth();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    nom: '', description: '', prix: '', credits: '1', actif: true
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, [token]);

  const fetchPackages = async () => {
    try {
      if (!token) return;
      const res = await fetch('/api/admin/job-packages', {
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
        ...formData,
        prix: parseFloat(formData.prix) || 0,
        credits: parseInt(formData.credits) || 1
      };
      const url = editingId ? `/api/admin/job-packages/${editingId}` : '/api/admin/job-packages';
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setFormData({ nom: '', description: '', prix: '', credits: '1', actif: true });
        setEditingId(null);
        fetchPackages();
        alert('Pack de crédits ' + (editingId ? 'modifié' : 'ajouté') + ' avec succès !');
      }
    } catch(err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm('Voulez-vous vraiment supprimer ce pack ?')) return;
    await fetch(`/api/admin/job-packages/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
    fetchPackages();
  };

  if(loading) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="font-black uppercase tracking-tight text-lg mb-6">{editingId ? 'Modifier' : 'Ajouter'} un Pack de Crédits</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-xs font-black uppercase text-gray-400">Nom du Pack</Label>
            <Input required value={formData.nom} onChange={e=>setFormData({...formData, nom: e.target.value})} placeholder="Ex: Pack Standard, Pack Urgent..." className="h-12 bg-gray-50 border-none rounded-xl" />
          </div>
          <div>
            <Label className="text-xs font-black uppercase text-gray-400">Description / Options (Séparer par des virgules ou sauts de ligne)</Label>
            <Textarea value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className="h-20 bg-gray-50 border-none rounded-xl resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-black uppercase text-gray-400">Prix (FCFA)</Label>
              <Input type="number" required value={formData.prix} onChange={e=>setFormData({...formData, prix: e.target.value})} className="h-12 bg-gray-50 border-none rounded-xl" />
            </div>
            <div>
              <Label className="text-xs font-black uppercase text-gray-400">Nombre de Crédits</Label>
              <Input type="number" required value={formData.credits} onChange={e=>setFormData({...formData, credits: e.target.value})} className="h-12 bg-gray-50 border-none rounded-xl" />
            </div>
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Switch checked={formData.actif} onCheckedChange={checked=>setFormData({...formData, actif: checked})} />
            <Label className="text-sm font-bold">Pack Actif</Label>
          </div>
          <Button type="submit" className="w-full bg-[#006837] hover:bg-[#004d29] text-white rounded-xl h-12 font-black uppercase">
            {editingId ? 'Mettre à jour' : 'Créer le Pack'}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" className="w-full mt-2 rounded-xl h-12 font-bold" onClick={() => { setEditingId(null); setFormData({ nom: '', description: '', prix: '', credits: '1', actif: true }); }}>
              Annuler
            </Button>
          )}
        </form>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-4">
        <h3 className="font-black uppercase tracking-tight text-lg">Packs de Crédits Existants</h3>
        {packages.map(p => (
           <div key={p.id} className="p-4 border-2 border-gray-50 rounded-2xl flex justify-between items-start">
              <div>
                <h4 className="font-bold text-gray-900">{p.nom} <span className="text-xs font-black px-2 py-0.5 bg-[#006837]/10 text-[#006837] rounded-full">{p.prix === 0 ? 'Gratuit' : p.prix + ' FCFA'}</span></h4>
                <p className="text-xs text-gray-500 mt-1">{p.credits} Crédit(s)</p>
                {!p.actif && <span className="text-xs text-red-500 font-bold">Désactivé</span>}
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="ghost" className="h-8 w-8 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100" onClick={() => { setFormData({ nom: p.nom, description: p.description || '', prix: String(p.prix), credits: String(p.credits), actif: p.actif }); setEditingId(p.id); }}>
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" onClick={() => handleDelete(p.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
           </div>
        ))}
      </div>
    </div>
  );
}
