import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, GripVertical, Image as ImageIcon, Video, Edit2, Layout, Type } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
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

function VisualChapterEditor({ initialData, onSave, onCancel }: { initialData: any, onSave: (data: any) => void, onCancel: () => void }) {
  const [titre, setTitre] = useState(initialData.titre || '');
  const [isVisual, setIsVisual] = useState(false);
  const [isRawMode, setIsRawMode] = useState(false);
  const [textDescription, setTextDescription] = useState(initialData.description || '');
  const [slides, setSlides] = useState<any[]>([]);

  useEffect(() => {
    try {
      const parsed = JSON.parse(initialData.description || '{}');
      if (parsed.type === 'visual' && Array.isArray(parsed.slides)) {
        setIsVisual(true);
        setSlides(parsed.slides);
      } else {
        setIsVisual(false);
      }
    } catch(e) {
       setIsVisual(false);
    }
  }, [initialData]);

  const save = () => {
     let desc = textDescription;
     if (isVisual) {
       desc = JSON.stringify({ type: 'visual', slides });
     }
     onSave({
       titre,
       description: desc,
       videoUrl: '', // Not used anymore if visual is used, but keeping it empty logic will clear the backend
       imageUrl: ''
     });
  };

  return (
     <div className="p-4 bg-white border-t space-y-4">
        <div>
           <label className="block text-xs font-bold mb-1">Titre du chapitre</label>
           <input value={titre} onChange={(e) => setTitre(e.target.value)} className="w-full p-2 border rounded-lg text-sm" />
        </div>

        <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-lg">
           <button onClick={() => setIsVisual(false)} className={`flex-1 py-1.5 rounded-md text-sm font-bold flex items-center justify-center gap-2 ${!isVisual ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}>
              <Type size={16} /> Mode Texte
           </button>
           <button onClick={() => setIsVisual(true)} className={`flex-1 py-1.5 rounded-md text-sm font-bold flex items-center justify-center gap-2 ${isVisual ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}>
              <Layout size={16} /> Mode Présentation (Diapositives)
           </button>
        </div>

        {!isVisual ? (
           <div>
              <div className="flex justify-between items-center mb-1">
                 <label className="block text-xs font-bold">Description / Contenu texte</label>
                 <button onClick={() => setIsRawMode(!isRawMode)} className="text-[10px] bg-gray-200 px-2 py-1 rounded text-gray-700 hover:bg-gray-300">
                    {isRawMode ? "Passer à l'Éditeur Visuel" : "Éditer en HTML brut"}
                 </button>
              </div>
              
              {isRawMode ? (
                 <textarea 
                    value={textDescription} 
                    onChange={(e) => setTextDescription(e.target.value)} 
                    className="w-full h-48 p-3 text-xs font-mono bg-gray-900 border-none text-green-400 rounded-lg shadow-inner mb-4" 
                    placeholder="<div class='text-center'>...</div>"
                 />
              ) : (
                 <div className="bg-white">
                    <JoditEditor config={joditConfig} value={textDescription} onBlur={(val: string) => setTextDescription(val)} />
                 </div>
              )}
           </div>
        ) : (
           <div className="space-y-4">
              <label className="block text-xs font-bold mb-1">Diapositives (Animations, Infographies, Carrousels, Vidéos)</label>
              <div className="space-y-3">
                 {slides.map((s, i) => (
                    <div key={i} className="border p-3 rounded-lg bg-gray-50 flex flex-col gap-2 relative group">
                       <button onClick={() => { const ns = [...slides]; ns.splice(i, 1); setSlides(ns); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Trash2 size={12} />
                       </button>
                       <div className="flex items-center gap-2 mb-1">
                          <span className="bg-primary/20 text-primary w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold">{i+1}</span>
                          <select value={s.type} onChange={(e) => { const ns = [...slides]; ns[i].type = e.target.value; setSlides(ns); }} className="p-1 text-xs border rounded shadow-sm">
                             <option value="text">Texte seul</option>
                             <option value="image">Image / Infographie</option>
                             <option value="video">Vidéo / Animation</option>
                             <option value="html">Code HTML Brut</option>
                          </select>
                       </div>
                       
                       {s.type !== 'html' && (
                          <input value={s.content || ''} onChange={(e) => { const ns = [...slides]; ns[i].content = e.target.value; setSlides(ns); }} placeholder="Grand Titre de la diapositive" className="w-full font-bold p-2 text-sm border shadow-sm rounded border-gray-200" />
                       )}
                       
                       {(s.type === 'image' || s.type === 'video') && (
                          <input value={s.url || ''} onChange={(e) => { const ns = [...slides]; ns[i].url = e.target.value; setSlides(ns); }} placeholder={s.type === 'image' ? "URL de l'image (https://...)" : "URL de la vidéo (Youtube ou mp4)"} className="w-full text-xs p-2 border shadow-sm rounded border-gray-200" />
                       )}
                       
                       {s.type === 'html' ? (
                          <textarea 
                             value={s.description || ''} 
                             onChange={(e) => { const ns = [...slides]; ns[i].description = e.target.value; setSlides(ns); }} 
                             placeholder="<div className='flex justify-center'>...</div> ou <h1>Mon HTML...</h1>" 
                             className="w-full h-48 p-3 text-xs font-mono bg-gray-900 border-none text-green-400 rounded-lg shadow-inner"
                          />
                       ) : (
                          <div className="bg-white border shadow-sm rounded mt-1">
                             <JoditEditor config={joditConfig} value={s.description || ''} onBlur={(val: string) => { const ns = [...slides]; ns[i].description = val; setSlides(ns); }} />
                          </div>
                       )}
                    </div>
                 ))}
                 <button onClick={() => setSlides([...slides, { type: 'text', content: '', description: '' }])} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-primary hover:border-primary text-sm font-bold flex justify-center items-center gap-2">
                    <Plus size={16} /> Ajouter une diapositive
                 </button>
              </div>
           </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
           <button onClick={onCancel} className="px-4 py-2 text-sm rounded-lg font-bold bg-gray-100 hover:bg-gray-200">Annuler</button>
           <button onClick={save} className="px-4 py-2 text-sm rounded-lg font-bold bg-primary text-white hover:bg-green-700">Enregistrer Chapitre</button>
        </div>
     </div>
  );
}

export default function AdminFormationEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formation, setFormation] = useState<any>(null);
  const [chapitres, setChapitres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [titre, setTitre] = useState('');
  const [categorie, setCategorie] = useState('');
  const [description, setDescription] = useState('');
  const [prix, setPrix] = useState(0);
  const [prixPromo, setPrixPromo] = useState<number | ''>('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [chapterForm, setChapterForm] = useState({ titre: '', description: '', videoUrl: '', imageUrl: '' });

  // Quiz states
  const [quizForm, setQuizForm] = useState<any>({ titre: '', description: '', questions: [] });
  const [showQuizBuilder, setShowQuizBuilder] = useState(false);
  
  // Feedback states
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isSavingQuiz, setIsSavingQuiz] = useState(false);
  const [quizSaveMessage, setQuizSaveMessage] = useState('');

  useEffect(() => {
    let hasToken = false;
    try { hasToken = !!localStorage.getItem('token'); } catch {}
    if (!user && !hasToken) {
      navigate('/connexion');
      return;
    }
    fetchFormation();
  }, [id, user, navigate]);

  const fetchFormation = async () => {
    try {
      const res = await fetch(`/api/admin/formations`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      const found = data.find((f: any) => f.id === id);
      if (found) {
        setFormation(found);
        setTitre(found.titre);
        setCategorie(found.categorie || '');
        setDescription(found.description || '');
        setPrix(found.prix || 0);
        setPrixPromo(found.prixPromo || '');
        setImageUrl(found.imageUrl || '');
        setVideoUrl(found.videoUrl || '');
        setIsPublished(found.isPublished || false);
        
        // Fetch public detailed view to get chapitres
        const detailRes = await fetch(`/api/formations/${found.slug}`);
        if(detailRes.ok) {
           const dData = await detailRes.json();
           setChapitres(dData.chapitres || []);
           
           if(dData.quiz) {
             const qs = (dData.quiz.questions || []).map((q: any) => ({
                ...q, options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
             }));
             setQuizForm({ ...dData.quiz, questions: qs });
           }
        }
      }
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveMessage('');
      await fetch(`/api/admin/formations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
           titre, categorie, description, prix, prixPromo: prixPromo === '' ? null : Number(prixPromo), 
           imageUrl, videoUrl, isPublished 
        })
      });
      setSaveMessage('Formation enregistrée avec succès !');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (e) {
      console.error(e);
      setSaveMessage('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result;
      if (typeof base64 !== 'string') return;
      
      try {
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: file.name, fileData: base64 })
        });
        const data = await response.json();
        if (data.url) setImageUrl(data.url);
      } catch (err) {
        console.error("Upload Error", err);
        alert("Erreur lors de l'upload");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // We can use the same endpoint as it accepts any base64 string
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result;
      if (typeof base64 !== 'string') return;
      
      try {
        const response = await fetch('/api/upload-image', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ fileName: file.name, fileData: base64 })
        });
        const data = await response.json();
        if (data.url) setVideoUrl(data.url);
      } catch (err) {
        console.error(err);
        alert("Erreur lors de l'upload de la vidéo.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleChapterImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result;
      if (typeof base64 !== 'string') return;
      
      try {
        const response = await fetch('/api/upload-image', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ fileName: file.name, fileData: base64 })
        });
        const data = await response.json();
        if (data.url) setChapterForm({...chapterForm, imageUrl: data.url});
      } catch (err) {
        console.error(err);
        alert("Erreur lors de l'upload de l'image.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleChapterVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result;
      if (typeof base64 !== 'string') return;
      
      try {
        const response = await fetch('/api/upload-image', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ fileName: file.name, fileData: base64 })
        });
        const data = await response.json();
        if (data.url) setChapterForm({...chapterForm, videoUrl: data.url});
      } catch (err) {
        console.error(err);
        alert("Erreur lors de l'upload de la vidéo.");
      }
    };
    reader.readAsDataURL(file);
  };

  const [isCreatingChapter, setIsCreatingChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');

  const createChapitre = async () => {
    if (!newChapterTitle) return;
    try {
      await fetch(`/api/admin/formations/${id}/chapitres`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ titre: newChapterTitle, ordre: chapitres.length + 1 })
      });
      fetchFormation();
      setIsCreatingChapter(false);
      setNewChapterTitle('');
    } catch (e) {
      console.error(e);
    }
  };

  const deleteChapitre = async (chapId: string) => {
    if (!window.confirm('Voulez-vous supprimer ce chapitre ?')) return;
    if (editingChapterId === chapId) setEditingChapterId(null);
    try {
      await fetch(`/api/admin/chapitres/${chapId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchFormation();
    } catch (e) {
      console.error(e);
    }
  };

  const saveChapter = async () => {
    if (!editingChapterId) return;
    try {
      await fetch(`/api/admin/chapitres/${editingChapterId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(chapterForm)
      });
      setEditingChapterId(null);
      fetchFormation();
    } catch (e) {
      console.error(e);
    }
  };

  const saveQuiz = async () => {
     try {
       setIsSavingQuiz(true);
       setQuizSaveMessage('');
       await fetch(`/api/admin/formations/${id}/quiz`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(quizForm)
       });
       setQuizSaveMessage('Quiz sauvegardé !');
       setTimeout(() => setQuizSaveMessage(''), 3000);
     } catch (e) {
       console.error(e);
       setQuizSaveMessage('Erreur lors de la sauvegarde du quiz');
     } finally {
       setIsSavingQuiz(false);
     }
  };

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto pb-24">
      <button onClick={() => navigate('/admin/formations')} className="flex items-center text-gray-600 mb-6 hover:text-gray-900">
        <ArrowLeft size={20} className="mr-2" /> Retour aux formations
      </button>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Éditer: {formation?.titre}</h1>
        <div className="flex items-center gap-4">
          {saveMessage && <span className="text-green-600 font-medium text-sm animate-pulse">{saveMessage}</span>}
          <button onClick={handleSave} disabled={isSaving} className="bg-primary hover:bg-green-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors">
            <Save size={20} /> {isSaving ? 'En cours...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border">
            <h2 className="text-xl font-bold mb-4">Informations Générales</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Titre de la formation</label>
                <input value={titre} onChange={(e) => setTitre(e.target.value)} className="w-full p-2 border rounded-lg" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Catégorie</label>
                <input value={categorie} onChange={(e) => setCategorie(e.target.value)} placeholder="Ex: Informatique, Management..." className="w-full p-2 border rounded-lg" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                   <label className="block text-sm font-medium">Description</label>
                   <button onClick={() => {
                        const isR = (window as any)._isMainRaw || false;
                        (window as any)._isMainRaw = !isR;
                        setTitre(titre + ' ');
                        setTimeout(() => setTitre(titre.trim()), 0);
                   }} className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-700 hover:bg-gray-300">
                      {(window as any)._isMainRaw ? "Passer à l'Éditeur Visuel" : "Éditer en HTML brut"}
                   </button>
                </div>
                {(window as any)._isMainRaw ? (
                   <textarea 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)} 
                      className="w-full h-64 p-4 text-sm font-mono bg-gray-900 border-none text-green-400 rounded-xl shadow-inner mb-4" 
                      placeholder="<!-- Votre code HTML ici -->"
                   />
                ) : (
                   <div className="bg-white">
                     <JoditEditor config={joditConfig} value={description} onBlur={(val: string) => setDescription(val)} />
                   </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Prix (FCFA) - 0 pour gratuit</label>
                  <input type="number" value={prix} onChange={(e) => setPrix(Number(e.target.value))} className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Prix de Promotion (FCFA) - Optionnel</label>
                  <input type="number" value={prixPromo} onChange={(e) => setPrixPromo(e.target.value === '' ? '' : Number(e.target.value))} className="w-full p-2 border rounded-lg" placeholder="ex: 15000" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium mb-1">Statut</label>
                  <select value={isPublished ? 'true' : 'false'} onChange={(e) => setIsPublished(e.target.value === 'true')} className="w-full p-2 border rounded-lg">
                    <option value="false">Brouillon</option>
                    <option value="true">Publiée</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Chapitres</h2>
              <button onClick={() => setIsCreatingChapter(true)} className="text-sm bg-gray-100 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-gray-200">
                <Plus size={16} /> Ajouter
              </button>
            </div>
            
            {isCreatingChapter && (
              <div className="bg-gray-50 border p-3 rounded-lg mb-3 flex flex-col gap-2">
                 <input 
                    autoFocus
                    value={newChapterTitle}
                    onChange={(e) => setNewChapterTitle(e.target.value)}
                    placeholder="Titre du nouveau chapitre..."
                    className="w-full border rounded px-3 py-2 text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && createChapitre()}
                 />
                 <div className="flex justify-end gap-2">
                   <button onClick={() => setIsCreatingChapter(false)} className="px-3 py-1.5 text-sm bg-white border rounded">Annuler</button>
                   <button onClick={createChapitre} className="px-3 py-1.5 text-sm bg-primary text-white rounded">Ajouter</button>
                 </div>
              </div>
            )}

            <div className="space-y-3">
              {chapitres.map((chap, i) => (
                <div key={chap.id} className="flex flex-col border rounded-lg bg-gray-50 border-gray-200 overflow-hidden">
                  <div className="flex p-3 items-center">
                    <GripVertical className="text-gray-400 mr-2 cursor-move" size={20} />
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm mr-3">
                      {i + 1}
                    </div>
                    <div className="flex-1 font-medium">{chap.titre}</div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setEditingChapterId(chap.id);
                          setChapterForm({ titre: chap.titre, description: chap.description || '', videoUrl: chap.videoUrl || '', imageUrl: chap.imageUrl || '' });
                        }}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded" 
                        title="Modifier le contenu"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => deleteChapitre(chap.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  {editingChapterId === chap.id && (
                     <VisualChapterEditor 
                        initialData={chap} 
                        onSave={async (data) => {
                           try {
                             await fetch(`/api/admin/chapitres/${chap.id}`, {
                               method: 'PUT',
                               headers: {
                                 'Content-Type': 'application/json',
                                 'Authorization': `Bearer ${localStorage.getItem('token')}`
                               },
                               body: JSON.stringify(data)
                             });
                             setEditingChapterId(null);
                             fetchFormation();
                           } catch (e) {
                             console.error(e);
                           }
                        }}
                        onCancel={() => setEditingChapterId(null)} 
                     />
                  )}
                </div>
              ))}
              {chapitres.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">Aucun chapitre. Commencez à créer le contenu de votre formation.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border">
            <h2 className="text-xl font-bold mb-4">Médias</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Image de mise en avant</label>
              {imageUrl && (
                <img src={imageUrl} alt="preview" className="w-full h-40 object-cover rounded-lg mb-3 border" />
              )}
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-primary text-gray-500 transition-colors">
                 <ImageIcon size={20} />
                 <span>Choisir une image</span>
                 <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Vidéo de présentation (URL optionnelle)</label>
              <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="Lien YouTube, Vimeo, MP4..." className="w-full p-2 border rounded-lg mb-2" />
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-3 cursor-pointer hover:border-primary text-gray-500 transition-colors text-sm">
                 <Video size={16} />
                 <span>Ou importer une vidéo</span>
                 <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
              </label>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border">
            <h2 className="text-xl font-bold mb-4">Quiz & Certification</h2>
            {!showQuizBuilder ? (
               <button onClick={() => setShowQuizBuilder(true)} className="w-full py-2 border rounded-lg text-primary font-bold hover:bg-gray-50">
                 {quizForm.titre ? 'Modifier le Quiz' : 'Créer un Quiz d\'évaluation'}
               </button>
            ) : (
               <div className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium mb-1">Titre du Quiz</label>
                   <input value={quizForm.titre} onChange={(e) => setQuizForm({...quizForm, titre: e.target.value})} className="w-full p-2 border rounded-lg" placeholder="Ex: Évaluation Finale" />
                 </div>
                 
                 <div>
                    <h3 className="font-bold flex justify-between items-center mb-2">
                       Questions ({quizForm.questions.length})
                       <button onClick={() => setQuizForm({...quizForm, questions: [...quizForm.questions, { question: '', options: ['', ''], correctOptionIndex: 0 }]})} className="text-sm bg-gray-100 px-2 py-1 flex items-center gap-1 rounded hover:bg-gray-200">
                          <Plus size={14}/> Ajouter
                       </button>
                    </h3>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                       {quizForm.questions.map((q: any, qi: number) => (
                           <div key={qi} className="border p-3 rounded-lg bg-gray-50 text-sm">
                              <label className="block font-bold mb-1">Question {qi + 1}</label>
                              <input value={q.question} onChange={(e) => { const n = [...quizForm.questions]; n[qi].question = e.target.value; setQuizForm({...quizForm, questions: n}); }} className="w-full p-1.5 border rounded mb-2" placeholder="Votre question" />
                              <label className="block text-xs text-gray-500 mb-1">Cochez le bouton radio pour définir la bonne réponse</label>
                              {q.options.map((opt: string, oi: number) => (
                                 <div key={oi} className="flex items-center gap-2 mb-1">
                                    <input type="radio" title="Marquer comme bonne réponse" className="w-4 h-4 cursor-pointer accent-green-600" name={`correct-${qi}`} checked={q.correctOptionIndex === oi} onChange={() => { const n = [...quizForm.questions]; n[qi].correctOptionIndex = oi; setQuizForm({...quizForm, questions: n}); }} />
                                    <input value={opt} onChange={(e) => { const n = [...quizForm.questions]; n[qi].options[oi] = e.target.value; setQuizForm({...quizForm, questions: n}); }} className={`flex-1 p-1 border rounded ${q.correctOptionIndex === oi ? 'border-green-500 bg-green-50' : ''}`} placeholder={`Option ${oi + 1}`} />
                                    <button onClick={() => { const n = [...quizForm.questions]; n[qi].options.splice(oi, 1); setQuizForm({...quizForm, questions: n})}} className="text-red-500 hover:text-red-700">X</button>
                                 </div>
                              ))}
                              <button onClick={() => { const n = [...quizForm.questions]; n[qi].options.push(''); setQuizForm({...quizForm, questions: n}); }} className="text-xs text-blue-600 mt-1">+ Add Option</button>
                           </div>
                       ))}
                    </div>
                 </div>

                 <div className="flex gap-2 items-center">
                   <button onClick={saveQuiz} disabled={isSavingQuiz} className="flex-1 bg-primary hover:bg-green-700 disabled:opacity-50 text-white py-2 rounded-lg font-bold transition-colors">
                     {isSavingQuiz ? 'En cours...' : 'Enregistrer le Quiz'}
                   </button>
                   <button onClick={() => setShowQuizBuilder(false)} className="px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition-colors">Masquer</button>
                 </div>
                 {quizSaveMessage && <div className="mt-2 text-green-600 font-medium text-sm animate-pulse text-center">{quizSaveMessage}</div>}
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}