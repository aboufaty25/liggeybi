import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminFormations() {
  const [formations, setFormations] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let hasToken = false;
    try { hasToken = !!localStorage.getItem('token'); } catch {}
    if (!user && !hasToken) {
      navigate('/connexion');
    }
  }, [user, navigate]);

  const fetchFormations = async () => {
    try {
      const res = await fetch('/api/admin/formations', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) setFormations(await res.json());
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchFormations();
  }, []);

  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const createFormation = async () => {
    if (!newTitle) return;
    try {
      const res = await fetch('/api/admin/formations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ titre: newTitle, description: '' })
      });
      if (res.ok) {
         fetchFormations();
         setNewTitle('');
         setIsCreating(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteFormation = async (id: string) => {
    if (!window.confirm('Supprimer cette formation ? (Cette action est irréversible)')) return;
    try {
      const res = await fetch(`/api/admin/formations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        fetchFormations();
      } else {
        const errorData = await res.json().catch(() => null);
        alert(`Erreur lors de la suppression: ${errorData?.error || res.status}`);
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
        <h1 className="text-2xl font-bold">Gestion des Formations</h1>
        <button onClick={() => setIsCreating(true)} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={20} /> Nouvelle Formation
        </button>
      </div>

      {isCreating && (
        <div className="bg-white p-4 rounded-xl shadow-sm border mb-6 flex gap-2">
           <input 
              autoFocus
              className="flex-1 border rounded-lg px-3 py-2" 
              placeholder="Titre de la nouvelle formation..." 
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createFormation()}
           />
           <button onClick={() => setIsCreating(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">Annuler</button>
           <button onClick={createFormation} className="px-4 py-2 bg-primary text-white rounded-lg">Créer</button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Formation</th>
              <th className="p-4">Statut</th>
              <th className="p-4">Prix</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {formations.map((f: any) => (
              <tr key={f.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4 font-medium">{f.titre}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${f.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {f.isPublished ? 'Publiée' : 'Brouillon'}
                  </span>
                </td>
                <td className="p-4">{f.prix === 0 ? 'Gratuit' : `${f.prix} FCFA`}</td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <Link to={`/admin/formations/${f.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Edit2 size={18} />
                  </Link>
                  <button onClick={() => deleteFormation(f.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {formations.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  Aucune formation pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
