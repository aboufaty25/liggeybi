import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Package, Megaphone, Plus, Trash2, Edit2, CheckCircle, XCircle, Tag, Layout, ShoppingCart, Globe, Upload, Image as ImageIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from 'motion/react';

export function BoutiqueManager() {
  const { token } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [promos, setPromos] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [formations, setFormations] = useState<any[]>([]);
  
  const [prodForm, setProdForm] = useState({ 
    titre: '', description: '', prix: '', prixPromo: '', 
    type: 'PHYSICAL', fileUrl: '', imageUrl: '', 
    stock: '', isPublished: false, categoryId: '' 
  });
  
  const [promoForm, setPromoForm] = useState({ 
    titre: '', description: '', imageUrl: '', 
    linkUrl: '', location: 'HOME', actif: false,
    type: 'AD', productIds: ''
  });

  const [catForm, setCatForm] = useState({ nom: '', description: '' });
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<'PRODUCT' | 'CATEGORY' | 'BANNER' | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      if (!token) return;
      setLoading(true);
      const headers = { 'Authorization': `Bearer ${token}` };
      const [prodRes, catRes, promoRes, ordRes, formRes] = await Promise.all([
        fetch('/api/admin/products', { headers }),
        fetch('/api/admin/product-categories', { headers }),
        fetch('/api/admin/banners', { headers }),
        fetch('/api/admin/orders', { headers }),
        fetch('/api/admin/formations', { headers })
      ]);
      
      setProducts(await prodRes.json());
      setCategories(await catRes.json());
      setPromos(await promoRes.json());
      setOrders(await ordRes.json());
      setFormations(await formRes.json());
      setLoading(false);
    } catch(err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    let file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    
    try {
      const { default: imageCompression } = await import('browser-image-compression');
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1200,
        useWebWorker: true
      };
      file = await imageCompression(file, options);
    } catch (error) {
      console.error("Compression failed", error);
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const res = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ fileName: file!.name, fileData: base64 })
        });
        const data = await res.json();
        if (data.url) setter(data.url);
      } catch (err) {
        console.error(err);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddOrUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId && editingType === 'PRODUCT' ? `/api/admin/products/${editingId}` : '/api/admin/products';
      const method = editingId && editingType === 'PRODUCT' ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
         method,
         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
         body: JSON.stringify(prodForm)
      });
      
      if (res.ok) {
        alert(editingId ? 'Produit mis à jour' : 'Produit ajouté');
        setEditingId(null);
        setEditingType(null);
        setProdForm({ titre: '', description: '', prix: '', prixPromo: '', type: 'PHYSICAL', fileUrl: '', imageUrl: '', stock: '', isPublished: false, categoryId: '' });
        fetchData();
      }
    } catch(err) {}
  };

  const handleAddOrUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId && editingType === 'CATEGORY' ? `/api/admin/product-categories/${editingId}` : '/api/admin/product-categories';
      const method = editingId && editingType === 'CATEGORY' ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
         method,
         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
         body: JSON.stringify(catForm)
      });
      
      if (res.ok) {
        alert(editingId ? 'Catégorie mise à jour' : 'Catégorie ajoutée');
        setEditingId(null);
        setEditingType(null);
        setCatForm({ nom: '', description: '' });
        fetchData();
      }
    } catch(err) {}
  };

  const handleAddOrUpdatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId && editingType === 'BANNER' ? `/api/admin/banners/${editingId}` : '/api/admin/banners';
      const method = editingId && editingType === 'BANNER' ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
         method,
         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
         body: JSON.stringify(promoForm)
      });
      
      if (res.ok) {
        alert(editingId ? 'Bannière mise à jour' : 'Bannière ajoutée');
        setEditingId(null);
        setEditingType(null);
        setPromoForm({ titre: '', description: '', imageUrl: '', linkUrl: '', location: 'HOME', actif: false, type: 'AD', productIds: '' });
        fetchData();
      }
    } catch(err) {}
  };

  const handleDelete = async (type: string, id: string) => {
    if(!confirm('Voulez-vous vraiment supprimer cet élément ?')) return;
    const url = type === 'PRODUCT' ? `/api/admin/products/${id}` : type === 'CATEGORY' ? `/api/admin/product-categories/${id}` : `/api/admin/banners/${id}`;
    await fetch(url, { method:'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
    fetchData();
  };

  if (loading) return <div className="text-center py-10 font-bold animate-pulse">Chargement de la gestion Boutique...</div>;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="products">
         <TabsList className="bg-white p-1 rounded-2xl border border-gray-100 shadow-sm h-12 mb-6 w-full flex justify-start overflow-x-auto">
            <TabsTrigger value="products" className="rounded-xl px-4 font-bold text-xs"><Package className="mr-2 h-4 w-4" /> Produits</TabsTrigger>
            <TabsTrigger value="categories" className="rounded-xl px-4 font-bold text-xs"><Tag className="mr-2 h-4 w-4" /> Catégories</TabsTrigger>
            <TabsTrigger value="promos" className="rounded-xl px-4 font-bold text-xs"><Megaphone className="mr-2 h-4 w-4" /> Bannières</TabsTrigger>
            <TabsTrigger value="orders" className="rounded-xl px-4 font-bold text-xs"><ShoppingCart className="mr-2 h-4 w-4" /> Commandes</TabsTrigger>
         </TabsList>
         
         {/* --- PRODUITS --- */}
         <TabsContent value="products">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                 <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-24">
                  <h3 className="font-black uppercase text-sm mb-6 flex items-center gap-2">
                    {editingId && editingType === 'PRODUCT' ? <Edit2 className="h-4 w-4 text-blue-600" /> : <Plus className="h-4 w-4 text-green-600" />}
                    {editingId && editingType === 'PRODUCT' ? 'Modifier le Produit' : 'Nouveau Produit'}
                  </h3>
                  <form onSubmit={handleAddOrUpdateProduct} className="space-y-4">
                    <div>
                      <Label className="text-[10px] font-black uppercase text-gray-400">Titre</Label>
                      <Input required value={prodForm.titre} onChange={e=>setProdForm({...prodForm, titre: e.target.value})} className="rounded-xl bg-gray-50 border-none px-4" />
                    </div>
                    <div>
                      <Label className="text-[10px] font-black uppercase text-gray-400">Catégorie</Label>
                      <select 
                        className="w-full h-11 rounded-xl bg-gray-50 border-none px-4 text-sm font-bold outline-none"
                        value={prodForm.categoryId}
                        onChange={e => setProdForm({...prodForm, categoryId: e.target.value})}
                      >
                        <option value="">Aucune catégorie</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label className="text-[10px] font-black uppercase text-gray-400">Description</Label>
                      <textarea className="w-full border-none bg-gray-50 p-4 rounded-2xl text-sm min-h-[100px] outline-none" required value={prodForm.description} onChange={e=>setProdForm({...prodForm, description: e.target.value})}></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-[10px] font-black uppercase text-gray-400">Prix (CFA)</Label>
                        <Input type="number" required value={prodForm.prix} onChange={e=>setProdForm({...prodForm, prix: e.target.value})} className="rounded-xl bg-gray-50 border-none px-4" />
                      </div>
                      <div>
                        <Label className="text-[10px] font-black uppercase text-gray-400">Prix Promo</Label>
                        <Input type="number" value={prodForm.prixPromo || ''} onChange={e=>setProdForm({...prodForm, prixPromo: e.target.value})} className="rounded-xl bg-gray-50 border-none px-4" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-[10px] font-black uppercase text-gray-400">Type</Label>
                        <select className="w-full h-11 rounded-xl bg-gray-50 border-none px-4 text-sm font-bold outline-none" value={prodForm.type} onChange={e=>setProdForm({...prodForm, type: e.target.value})}>
                          <option value="PHYSICAL">Physique</option>
                          <option value="DIGITAL">Digital</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-[10px] font-black uppercase text-gray-400">Stock</Label>
                        <Input type="number" required={prodForm.type === 'PHYSICAL'} value={prodForm.stock} onChange={e=>setProdForm({...prodForm, stock: e.target.value})} className="rounded-xl bg-gray-50 border-none px-4" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-[10px] font-black uppercase text-gray-400">Image du Produit</Label>
                      <div className="mt-1 flex items-center gap-4">
                         {prodForm.imageUrl && <img src={prodForm.imageUrl} className="w-12 h-12 rounded-xl object-cover bg-gray-50" />}
                         <label className="flex-1 cursor-pointer">
                            <div className={`h-11 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 text-xs font-bold text-gray-400 hover:border-gray-300 transition-colors ${uploading ? 'animate-pulse' : ''}`}>
                               <Upload className="h-4 w-4" /> {uploading ? 'Upload...' : 'Choisir une image'}
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, (url) => setProdForm({...prodForm, imageUrl: url}))} />
                         </label>
                      </div>
                      <Input type="text" value={prodForm.imageUrl} onChange={e=>setProdForm({...prodForm, imageUrl: e.target.value})} className="mt-2 rounded-xl bg-gray-50 border-none px-4 text-[10px]" placeholder="Ou entrez une URL..." />
                    </div>
                    {prodForm.type === 'DIGITAL' && (
                      <div>
                        <Label className="text-[10px] font-black uppercase text-gray-400">Fichier à télécharger ou URL</Label>
                        <div className="mt-1 flex items-center gap-4">
                           <label className="flex-1 cursor-pointer">
                              <div className={`h-11 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 text-xs font-bold text-gray-400 hover:border-gray-300 transition-colors ${uploading ? 'animate-pulse' : ''}`}>
                                 <Upload className="h-4 w-4" /> {uploading ? 'Upload...' : 'Choisir un fichier'}
                              </div>
                              <input type="file" className="hidden" onChange={e => handleImageUpload(e, (url) => setProdForm({...prodForm, fileUrl: url}))} />
                           </label>
                        </div>
                        <Input type="text" value={prodForm.fileUrl} onChange={e=>setProdForm({...prodForm, fileUrl: e.target.value})} className="mt-2 rounded-xl bg-gray-50 border-none px-4 text-[10px]" placeholder="Ou entrez le lien du fichier..." />
                      </div>
                    )}
                    <div className="flex items-center space-x-2 pt-2">
                      <Switch checked={prodForm.isPublished} onCheckedChange={checked => setProdForm({...prodForm, isPublished: checked})} />
                      <Label className="text-xs font-bold">Publier en ligne</Label>
                    </div>
                    <div className="flex gap-2 pt-4">
                      {editingId && (
                        <Button type="button" variant="outline" className="flex-1 rounded-xl font-black" onClick={() => { setEditingId(null); setEditingType(null); setProdForm({ titre: '', description: '', prix: '', prixPromo: '', type: 'PHYSICAL', fileUrl: '', imageUrl: '', stock: '', isPublished: false, categoryId: '' }); }}>Annuler</Button>
                      )}
                      <Button type="submit" className="flex-1 bg-gray-900 hover:bg-black rounded-xl font-black h-12 shadow-lg shadow-gray-200">
                        {editingId && editingType === 'PRODUCT' ? 'Mettre à jour' : 'Ajouter le produit'}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
              
              <div className="lg:col-span-2 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-center px-2 gap-4">
                  <h3 className="font-black uppercase text-sm flex items-center gap-2"><Layout className="h-4 w-4" /> Produits ({products.length})</h3>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Input 
                      placeholder="Rechercher..." 
                      className="rounded-xl h-10 w-full sm:w-64 bg-white border-gray-200" 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                    <select 
                      className="h-10 rounded-xl bg-white border border-gray-200 px-4 text-sm font-bold outline-none"
                      value={filterCategory}
                      onChange={e => setFilterCategory(e.target.value)}
                    >
                      <option value="ALL">Toutes les catégories</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.filter(p => 
                    (filterCategory === 'ALL' || p.categoryId === filterCategory) &&
                    (p.titre.toLowerCase().includes(searchQuery.toLowerCase()) || (p.category?.nom || '').toLowerCase().includes(searchQuery.toLowerCase()))
                  ).map(p => (
                    <motion.div layout key={p.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
                      <div className="flex gap-4 mb-4">
                        <img src={p.imageUrl || 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1200'} className="w-16 h-16 rounded-2xl object-cover shrink-0 bg-gray-50" alt={p.titre} />
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-900 truncate">{p.titre}</h4>
                          <p className="text-[10px] font-black uppercase text-blue-600 tracking-wider mb-1">{p.category?.nom || 'Sans catégorie'}</p>
                          <div className="flex items-center gap-2">
                             <span className="text-xs font-black">{p.prixPromo || p.prix} CFA</span>
                             <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.isPublished ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}>
                               {p.isPublished ? 'Publie' : 'Privé'}
                             </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 rounded-xl font-bold bg-blue-50 border-blue-100 text-blue-700 hover:bg-blue-100" onClick={() => {
                          setEditingId(p.id);
                          setEditingType('PRODUCT');
                          setProdForm({
                            titre: p.titre, description: p.description, prix: String(p.prix), 
                            prixPromo: p.prixPromo ? String(p.prixPromo) : '', type: p.type, 
                            fileUrl: p.fileUrl || '', imageUrl: p.imageUrl || '', 
                            stock: String(p.stock), isPublished: p.isPublished, categoryId: p.categoryId || ''
                          });
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}><Edit2 className="h-3 w-3 mr-2" /> Modifier</Button>
                        <Button variant="ghost" size="sm" className="bg-red-50 text-red-600 hover:bg-red-100 rounded-xl" onClick={()=>handleDelete('PRODUCT', p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
         </TabsContent>

         {/* --- CATEGORIES --- */}
         <TabsContent value="categories">
            <div className="grid lg:grid-cols-3 gap-8">
               <div className="lg:col-span-1">
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-24">
                     <h3 className="font-black uppercase text-sm mb-6 flex items-center gap-2">
                       <Plus className="h-4 w-4 text-green-600" /> 
                       {editingId && editingType === 'CATEGORY' ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}
                     </h3>
                     <form onSubmit={handleAddOrUpdateCategory} className="space-y-4">
                        <div>
                          <Label className="text-[10px] font-black uppercase text-gray-400">Nom de la catégorie</Label>
                          <Input required value={catForm.nom} onChange={e=>setCatForm({...catForm, nom: e.target.value})} className="rounded-xl bg-gray-50 border-none px-4" />
                        </div>
                        <div>
                          <Label className="text-[10px] font-black uppercase text-gray-400">Description</Label>
                          <textarea className="w-full border-none bg-gray-50 p-4 rounded-2xl text-sm outline-none resize-none" value={catForm.description} onChange={e=>setCatForm({...catForm, description: e.target.value})} placeholder="Courte description..."></textarea>
                        </div>
                        <Button type="submit" className="w-full bg-gray-900 hover:bg-black rounded-xl font-black h-12">Enregistrer</Button>
                     </form>
                  </div>
               </div>
               <div className="lg:col-span-2 space-y-4">
                  <h3 className="font-black uppercase text-sm flex items-center gap-2 px-2"><Tag className="h-4 w-4" /> Catégories ({categories.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categories.map(c => (
                      <div key={c.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                         <div>
                            <p className="font-bold">{c.nom}</p>
                            <p className="text-[10px] font-black uppercase text-gray-400">{c._count?.products || 0} Produits</p>
                         </div>
                         <div className="flex gap-2">
                           <Button variant="ghost" size="sm" className="rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100" onClick={() => {
                             setEditingId(c.id);
                             setEditingType('CATEGORY');
                             setCatForm({ nom: c.nom, description: c.description || '' });
                           }}><Edit2 className="h-3.5 w-3.5" /></Button>
                           <Button variant="ghost" size="sm" className="rounded-xl bg-red-50 text-red-600 hover:bg-red-100" onClick={()=>handleDelete('CATEGORY', c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                         </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
         </TabsContent>

         {/* --- BANNIERES --- */}
         <TabsContent value="promos">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                 <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-24">
                  <h3 className="font-black uppercase text-sm mb-6 flex items-center gap-2"><Megaphone className="h-4 w-4" /> Nouvelle Bannière</h3>
                  <form onSubmit={handleAddOrUpdatePromo} className="space-y-4">
                    <div>
                      <Label className="text-[10px] font-black uppercase text-gray-400">Type de Bannière</Label>
                      <select className="w-full h-11 rounded-xl bg-gray-50 border-none px-4 text-sm font-bold outline-none" value={promoForm.type} onChange={e=>setPromoForm({...promoForm, type: e.target.value, productIds: ''})}>
                        <option value="AD">Publicité (Image + Lien)</option>
                        <option value="PRODUCT">Produit Unique</option>
                        <option value="PRODUCT_GRID">Grille de Produits</option>
                        <option value="FORMATION">Formation Unique</option>
                        <option value="FORMATION_GRID">Grille de Formations</option>
                      </select>
                    </div>

                    {promoForm.type !== 'AD' && (
                      <div>
                        <Label className="text-[10px] font-black uppercase text-gray-400">
                          {promoForm.type.includes('FORMATION') ? 'Sélectionner Formation(s)' : 'Sélectionner Produit(s)'}
                        </Label>
                        <div className="mt-2 space-y-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-xl">
                          {(promoForm.type.includes('FORMATION') ? formations : products).map(item => (
                            <label key={item.id} className="flex items-center gap-2 text-xs font-bold cursor-pointer hover:bg-white p-2 rounded-lg transition-colors">
                              <input 
                                type="checkbox" 
                                checked={promoForm.productIds.split(',').includes(item.id)}
                                onChange={e => {
                                  let ids = promoForm.productIds.split(',').filter(Boolean);
                                  if (e.target.checked) ids.push(item.id);
                                  else ids = ids.filter(id => id !== item.id);
                                  setPromoForm({...promoForm, productIds: ids.join(',')});
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              {item.imageUrl && <img src={item.imageUrl} className="w-6 h-6 rounded object-cover" />}
                              {item.titre}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <Label className="text-[10px] font-black uppercase text-gray-400">Titre Banner</Label>
                      <Input required value={promoForm.titre} onChange={e=>setPromoForm({...promoForm, titre: e.target.value})} className="rounded-xl bg-gray-50 border-none px-4" />
                    </div>

                    {promoForm.type === 'AD' && (
                      <div>
                        <Label className="text-[10px] font-black uppercase text-gray-400">Image (600x200 recommandé)</Label>
                        <div className="mt-1 flex items-center gap-4">
                           {promoForm.imageUrl && <img src={promoForm.imageUrl} className="w-12 h-12 rounded-xl object-cover bg-gray-50" />}
                           <label className="flex-1 cursor-pointer">
                              <div className={`h-11 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 text-xs font-bold text-gray-400 hover:border-gray-300 transition-colors ${uploading ? 'animate-pulse' : ''}`}>
                                 <Upload className="h-4 w-4" /> {uploading ? 'Upload...' : 'Bannière'}
                              </div>
                              <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, (url) => setPromoForm({...promoForm, imageUrl: url}))} />
                           </label>
                        </div>
                        <Input type="text" value={promoForm.imageUrl} onChange={e=>setPromoForm({...promoForm, imageUrl: e.target.value})} className="mt-2 rounded-xl bg-gray-50 border-none px-4 text-[10px]" placeholder="Ou URL..." />
                      </div>
                    )}

                    {promoForm.type === 'AD' && (
                      <div>
                        <Label className="text-[10px] font-black uppercase text-gray-400">Lien de redirection</Label>
                        <Input value={promoForm.linkUrl} onChange={e=>setPromoForm({...promoForm, linkUrl: e.target.value})} className="rounded-xl bg-gray-50 border-none px-4" placeholder="https://..." />
                      </div>
                    )}

                    <div>
                      <Label className="text-[10px] font-black uppercase text-gray-400">Emplacement</Label>
                      <select className="w-full h-11 rounded-xl bg-gray-50 border-none px-4 text-sm font-bold outline-none" value={promoForm.location} onChange={e=>setPromoForm({...promoForm, location: e.target.value})}>
                        <option value="HOME">Accueil (Haut de page)</option>
                        <option value="HOME_GRID_1">Accueil - Après Grille 1</option>
                        <option value="HOME_GRID_2">Accueil - Après Grille 2</option>
                        <option value="HOME_GRID_3">Accueil - Après Grille 3</option>
                        <option value="HOME_GRID_4">Accueil - Après Grille 4</option>
                        <option value="HOME_GRID_5">Accueil - Après Grille 5</option>
                        <option value="BOTTOM_HOME">Accueil (Bas de page)</option>
                        <option value="TOP_ARTICLE">Article (Avant contenu)</option>
                        <option value="MIDDLE_ARTICLE">Article (Milieu contenu)</option>
                        <option value="BOTTOM_ARTICLE">Article (Fin de page)</option>
                        <option value="CATEGORY">Catégorie (Haut)</option>
                        <option value="BOTTOM_CATEGORY">Catégorie (Fin de page)</option>
                        <option value="WIDGET">Widget Général</option>
                        <option value="FORMATIONS">Formations (Haut de page)</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-2 pt-2">
                      <Switch checked={promoForm.actif} onCheckedChange={checked => setPromoForm({...promoForm, actif: checked})} />
                      <Label className="text-xs font-bold">Activer la bannière</Label>
                    </div>
                    <Button type="submit" className="w-full bg-gray-900 hover:bg-black rounded-xl font-black h-12">Enregistrer</Button>
                  </form>
                </div>
              </div>
              <div className="lg:col-span-2 space-y-4">
                 <h3 className="font-black uppercase text-sm flex items-center gap-2 px-2"><Megaphone className="h-4 w-4" /> Toutes les Bannières ({promos.length})</h3>
                 <div className="grid gap-4">
                  {promos.map(b => (
                    <div key={b.id} className="bg-white p-3 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                      {b.imageUrl ? (
                        <img src={b.imageUrl} className="w-32 h-20 object-cover rounded-2xl shrink-0 border border-gray-50" alt="promo" />
                      ) : (
                        <div className="w-32 h-20 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0">
                           <ImageIcon className="h-6 w-6 text-gray-300" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">{b.titre}</p>
                        <div className="flex gap-2 items-center mt-1">
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">{b.location}</span>
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{b.type}</span>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${b.actif ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                            {b.actif ? 'Actif' : 'Désactivé'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="rounded-xl hover:bg-gray-50" onClick={() => {
                          setEditingId(b.id);
                          setEditingType('BANNER');
                          setPromoForm({
                            titre: b.titre, description: b.description || '', imageUrl: b.imageUrl || '',
                            linkUrl: b.linkUrl || '', location: b.location || 'HOME', actif: b.actif,
                            type: b.type || 'AD', productIds: b.productIds || ''
                          });
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}><Edit2 className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" className="bg-red-50 text-red-600 hover:bg-red-100 rounded-xl" onClick={()=>handleDelete('BANNER', b.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
         </TabsContent>

         {/* --- COMMANDES --- */}
         <TabsContent value="orders">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
               <div className="p-6 border-b border-gray-50 bg-gray-50/30">
                 <h3 className="font-black uppercase text-sm">Historique des Ventes</h3>
               </div>
               <div className="overflow-x-auto min-h-[400px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="p-4 text-[10px] font-black uppercase text-gray-400">Date</th>
                      <th className="p-4 text-[10px] font-black uppercase text-gray-400">Client</th>
                      <th className="p-4 text-[10px] font-black uppercase text-gray-400">Produit</th>
                      <th className="p-4 text-[10px] font-black uppercase text-gray-400">Montant</th>
                      <th className="p-4 text-[10px] font-black uppercase text-gray-400">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-gray-400 font-bold">Aucune commande pour le moment</td></tr>}
                    {orders.map(o => (
                      <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 text-xs font-bold text-gray-500 whitespace-nowrap">{new Date(o.createdAt).toLocaleDateString('fr-FR')}</td>
                        <td className="p-4">
                          <p className="text-xs font-black text-gray-900">{o.customerName}</p>
                          <p className="text-[10px] font-medium text-gray-400">{o.customerEmail}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-xs font-bold text-gray-900">{o.product?.titre || 'Inconnu'}</p>
                          <p className="text-[10px] font-medium text-gray-400">Quantité: {o.quantity}</p>
                        </td>
                        <td className="p-4 font-black text-xs">{o.totalAmount.toLocaleString()} CFA</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase border ${
                            o.status==='PAID' 
                              ? 'bg-green-50 text-green-700 border-green-100' 
                              : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {o.status === 'PAID' ? 'Paiement Valide' : 'En Attente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
               </div>
            </div>
         </TabsContent>
      </Tabs>
    </div>
  );
}
