import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Globe2, Plane, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function AdminDestinations() {
  const [articles, setArticles] = useState<any[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let hasToken = false;
    try { hasToken = !!localStorage.getItem('token'); } catch {}
    if (!user && !hasToken) {
      navigate('/connexion');
    }
  }, [user, navigate]);

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/offres', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const allJobs = await res.json();
        setArticles(allJobs.filter((job: any) => job.categorie === 'canada' || job.categorie === 'europe'));
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const deleteArticle = async (id: string) => {
    if (!window.confirm('Supprimer cet article ? (Cette action est irréversible)')) return;
    try {
      const res = await fetch(`/api/admin/offres/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        fetchArticles();
      } else {
        alert("Erreur lors de la suppression.");
      }
    } catch (e) {
      console.error(e);
      alert("Erreur réseau ou serveur.");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto pb-24">
      <button onClick={() => navigate('/admin')} className="flex items-center text-gray-600 mb-6 hover:text-gray-900">
        <ArrowLeft size={20} className="mr-2" /> Retour au Dashboard
      </button>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Globe2 className="text-indigo-600" /> Articles Destinations
        </h1>
        <button onClick={() => navigate('/admin/articles/nouveau')} className="bg-[#cc0000] text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold shadow-md hover:bg-[#990000]">
          <Plus size={20} /> Nouvel Article
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b font-medium text-gray-500 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Titre & Catégorie</th>
                <th className="px-6 py-4">Lieu</th>
                <th className="px-6 py-4">Date & Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-gray-700">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900 mb-1 max-w-sm truncate">{article.titre}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${article.categorie === 'canada' ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700'}`}>
                      {article.categorie === 'canada' ? <Plane size={12} className="mr-1" /> : <Globe2 size={12} className="mr-1" />}
                      {article.sousCategorie || article.categorie}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{article.lieu || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-xs text-gray-500">{new Date(article.createdAt).toLocaleDateString()}</p>
                    <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${article.statut === 'approuve' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                      {article.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       <Button onClick={() => navigate(`/admin/articles/${article.id}`)} size="sm" className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 font-semibold rounded-lg">
                         <Edit2 size={16} />
                       </Button>
                       <Button onClick={() => deleteArticle(article.id)} size="sm" className="bg-white border hover:bg-red-50 text-red-500 px-3 font-semibold rounded-lg shadow-sm hover:border-red-200">
                         <Trash2 size={16} />
                       </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {articles.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Aucun article trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
