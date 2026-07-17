import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Save, Loader2, Globe2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import JoditEditor from 'jodit-react';

const joditConfig = {
  readonly: false,
  height: 400,
  enableDragAndDropFileToEditor: true,
  uploader: { insertImageAsBase64URI: true },
  toolbarSticky: false,
  language: 'fr',
  askBeforePasteHTML: false,
  askBeforePasteFromWord: false,
  iframe: true
};

export default function AdminDestinationEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(id !== 'nouveau');
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    titre: '',
    categorie: 'canada',
    sousCategorie: '',
    description: '',
    imageUrl: '',
    lieu: '',
    tags: '',
    seoDescription: '',
    statut: 'approuve'
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("L'image est trop grande (maximum 5MB).");
        e.target.value = '';
        return;
      }
      try {
        const { default: imageCompression } = await import('browser-image-compression');
        const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1200, useWebWorker: true };
        const compressedFile = await imageCompression(file, options);
        file = compressedFile;
      } catch (error) {
        console.error("Compression failed", error);
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    let hasToken = false;
    try { hasToken = !!localStorage.getItem('token'); } catch {}
    if (!user && !hasToken) {
      navigate('/connexion');
      return;
    }

    if (id !== 'nouveau') {
      fetchArticle();
    }
  }, [id, user, navigate]);

  const fetchArticle = async () => {
    try {
      const res = await fetch(`/api/public/offres/${id}`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          titre: data.titre || '',
          categorie: data.categorie || 'canada',
          sousCategorie: data.sousCategorie || '',
          description: data.description || '',
          imageUrl: data.imageUrl || '',
          lieu: data.lieu || '',
          tags: data.tags || '',
          seoDescription: data.seoDescription || '',
          statut: data.statut || 'approuve'
        });
      } else {
        alert("Article non trouvé");
        navigate('/admin/articles');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.titre || !formData.description) {
      alert("Le titre et la description sont requis !");
      return;
    }

    setSaving(true);
    try {
      const isEditing = id !== 'nouveau';
      const url = isEditing ? `/api/admin/offres/${id}` : '/api/offres';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData, // titre, categorie, description, etc.
          // Fallbacks needed by DB
          modeCandidature: 'interne', 
          typeContrat: null,
          experience: null,
          salaire: null,
          niveauEtude: null,
          dateExpiration: null,
        })
      });

      if (res.ok) {
        // If creating new article as ADMIN, ensure statut is 'approuve'
        // Actually, the server forces 'approuve' for admin!
        alert(isEditing ? 'Article mis à jour' : 'Article créé');
        navigate('/admin/articles');
      } else {
        const errorData = await res.json().catch(() => null);
        alert(`Erreur: ${errorData?.error || 'Échec de la sauvegarde'}`);
      }
    } catch (e) {
      console.error(e);
      alert('Erreur réseau.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Chargement...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto pb-24">
      <button onClick={() => navigate('/admin/articles')} className="flex items-center text-gray-600 mb-6 hover:text-gray-900">
        <ArrowLeft size={20} className="mr-2" /> Retour aux articles
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Globe2 className="text-indigo-600" />
          {id === 'nouveau' ? 'Nouvel Article' : 'Modifier l\'Article'}
        </h1>
        <Button onClick={handleSave} disabled={saving} className="bg-[#cc0000] text-white hover:bg-[#990000] px-8 rounded-xl font-bold">
          {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
          Sauvegarder
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Titre de l'article *</Label>
            <Input 
              value={formData.titre} 
              onChange={e => setFormData({...formData, titre: e.target.value})} 
              placeholder="Ex: Comment immigrer au Canada en 2024" 
              className="h-12 rounded-xl bg-gray-50 border-none px-4" 
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Catégorie</Label>
            <select 
              value={formData.categorie} 
              onChange={e => setFormData({...formData, categorie: e.target.value, sousCategorie: ''})} 
              className="w-full h-12 rounded-xl bg-gray-50 border-none px-4 text-sm font-bold outline-none cursor-pointer"
            >
              <option value="canada">Canada (Programmes & Immigration)</option>
              <option value="europe">Europe (Études & Immigration)</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Sous-catégorie</Label>
            <select 
              value={formData.sousCategorie} 
              onChange={e => setFormData({...formData, sousCategorie: e.target.value})} 
              className="w-full h-12 rounded-xl bg-gray-50 border-none px-4 text-sm font-bold outline-none cursor-pointer"
            >
              <option value="">Par défaut</option>
              {formData.categorie === 'canada' && [
                "Entrée Express", "Permis d'études", "Permis de travail", "PNP Canada"
              ].map(t => <option key={t} value={t}>{t}</option>)}
              {formData.categorie === 'europe' && [
                "Étudier en Europe", "Bourses européennes", "Visa étudiant", "Universités européennes"
              ].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Lieu (Optionnel)</Label>
            <Input 
              value={formData.lieu} 
              onChange={e => setFormData({...formData, lieu: e.target.value})} 
              placeholder="Ex: Québec" 
              className="h-12 rounded-xl bg-gray-50 border-none px-4" 
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Statut de publication</Label>
            <select 
              value={formData.statut} 
              onChange={e => setFormData({...formData, statut: e.target.value})} 
              className="w-full h-12 rounded-xl bg-gray-50 border-none px-4 text-sm font-bold outline-none cursor-pointer"
            >
              <option value="approuve">Publié (Approuvé)</option>
              <option value="en_attente">Brouillon (En attente)</option>
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Description SEO (Méta description courte)</Label>
            <Input 
              value={formData.seoDescription} 
              onChange={e => setFormData({...formData, seoDescription: e.target.value})} 
              placeholder="Résumé de 150 caractères maximum" 
              className="h-12 rounded-xl bg-gray-50 border-none px-4" 
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Tags / Mots-clés (séparés par des virgules)</Label>
            <Input 
              value={formData.tags} 
              onChange={e => setFormData({...formData, tags: e.target.value})} 
              placeholder="Ex: Visa, Etudes, Canada, RP" 
              className="h-12 rounded-xl bg-gray-50 border-none px-4" 
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Image de mise en avant</Label>
            <div className="flex items-center gap-4">
              {formData.imageUrl && (
                <img src={formData.imageUrl} alt="preview" className="h-16 w-16 object-cover rounded-lg border shadow-sm" />
              )}
              <Input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer h-auto" 
              />
            </div>
          </div>
        </div>

        <div className="space-y-2 border-t pt-6 mt-6">
          <div className="flex justify-between items-center mb-1">
            <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Contenu de l'article *</Label>
            <button 
              onClick={() => {
                const isR = (window as any)._isDestRaw || false;
                (window as any)._isDestRaw = !isR;
                // Force re-render
                setFormData(prev => ({...prev}));
              }} 
              className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-700 hover:bg-gray-300 font-semibold"
            >
              {(window as any)._isDestRaw ? "Passer à l'Éditeur Visuel" : "Éditer en HTML brut"}
            </button>
          </div>
          
          {(window as any)._isDestRaw ? (
             <textarea 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                className="w-full h-[500px] p-4 text-sm font-mono bg-gray-900 border-none text-green-400 rounded-xl shadow-inner mb-4 focus:ring-0 focus:outline-none" 
                placeholder="<!-- Votre code HTML ici -->"
             />
          ) : (
            <div className="bg-white border shadow-sm rounded-xl overflow-hidden mt-1">
               <JoditEditor 
                 config={joditConfig} 
                 value={formData.description} 
                 onBlur={(val: string) => setFormData({...formData, description: val})} 
               />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
