import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import puisiApi from "../services/puisiApi";

function MyPuisi() {
  const [puisiList, setPuisiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPuisi, setEditingPuisi] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    judul: "",
    isi: "",
    is_public: true
  });
  const [formLoading, setFormLoading] = useState(false);
  const navigate = useNavigate();

  const fetchMyPuisi = async () => {
    try {
      setLoading(true);
      setError("");
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) {
        throw new Error('User not found');
      }

      const response = await puisiApi.get(`/puisi/user/${user.id}`);
      setPuisiList(response.data);
    } catch (err) {
      console.error("Failed to fetch user puisi:", err);
      
      if (err.response?.status === 401) {
        setError("Sesi Anda telah berakhir. Silakan login kembali.");
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError("Gagal memuat puisi Anda. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePuisi = async (e) => {
    e.preventDefault();
    
    if (!formData.judul.trim() || !formData.isi.trim()) {
      setError("Judul dan isi puisi harus diisi.");
      return;
    }

    setFormLoading(true);
    setError("");

    try {
      await puisiApi.post('/puisi', formData);
      
      // Reset form and close modal
      setFormData({ judul: "", isi: "", is_public: true });
      setShowCreateForm(false);
      
      // Refresh list
      fetchMyPuisi();
    } catch (err) {
      console.error("Failed to create puisi:", err);
      setError(err.response?.data?.error || "Gagal membuat puisi.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdatePuisi = async (e) => {
    e.preventDefault();
    
    if (!formData.judul.trim() || !formData.isi.trim()) {
      setError("Judul dan isi puisi harus diisi.");
      return;
    }

    setFormLoading(true);
    setError("");

    try {
      await puisiApi.put(`/puisi/${editingPuisi.id}`, formData);
      
      // Reset form and close modal
      setFormData({ judul: "", isi: "", is_public: true });
      setEditingPuisi(null);
      
      // Refresh list
      fetchMyPuisi();
    } catch (err) {
      console.error("Failed to update puisi:", err);
      setError(err.response?.data?.error || "Gagal mengupdate puisi.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeletePuisi = async (puisiId) => {
    setFormLoading(true);
    setError("");

    try {
      await puisiApi.delete(`/puisi/${puisiId}`);
      
      // Close confirm modal
      setDeleteConfirm(null);
      
      // Refresh list
      fetchMyPuisi();
    } catch (err) {
      console.error("Failed to delete puisi:", err);
      setError(err.response?.data?.error || "Gagal menghapus puisi.");
    } finally {
      setFormLoading(false);
    }
  };

  const openEditForm = (puisi) => {
    setFormData({
      judul: puisi.judul,
      isi: puisi.isi,
      is_public: puisi.is_public
    });
    setEditingPuisi(puisi);
    setShowCreateForm(false);
  };

  const openCreateForm = () => {
    setFormData({ judul: "", isi: "", is_public: true });
    setEditingPuisi(null);
    setShowCreateForm(true);
  };

  const closeAllModals = () => {
    setShowCreateForm(false);
    setEditingPuisi(null);
    setDeleteConfirm(null);
    setFormData({ judul: "", isi: "", is_public: true });
    setError("");
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchMyPuisi();
  }, [navigate]);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0F0F0F] to-[#0B0B0B]">
        <div className="group">
          <div className="text-white rounded-3xl border border-purple-500/20 bg-gradient-to-tr from-[#0F0F0F] to-[#0B0B0B] shadow-2xl backdrop-blur-xl p-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 animate-ping"></div>
                <div className="p-6 rounded-full backdrop-blur-lg border border-purple-500/20 bg-gradient-to-br from-black/80 to-gray-900/60">
                  <svg className="w-8 h-8 text-purple-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-purple-500 to-purple-400 bg-clip-text text-transparent">
                Memuat Puisi Anda...
              </h2>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0F0F0F] to-[#0B0B0B] p-4 sm:p-6 lg:p-8">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-purple-400/10 opacity-40"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-gradient-to-tr from-purple-500/10 to-transparent blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-gradient-to-tr from-pink-500/10 to-transparent blur-3xl opacity-30 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 lg:mb-12">
          <div className="group inline-block">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 animate-ping"></div>
              <div className="p-4 sm:p-6 rounded-full backdrop-blur-lg border border-purple-500/20 bg-gradient-to-br from-black/80 to-gray-900/60 shadow-2xl transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 mx-auto w-fit">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-purple-500 fill-current group-hover:text-purple-400 transition-colors duration-300" viewBox="0 0 24 24">
                  <path d="M14,17H7V15H14M17,13H7V11H17M17,9H7V7H17M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z" fill="currentColor"/>
                </svg>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-purple-400 via-purple-500 to-purple-400 bg-clip-text text-transparent animate-pulse mb-3">
              Puisi Saya
            </h1>
            <p className="text-gray-300 text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto">
              Kelola koleksi puisi Anda - buat, edit, dan bagikan karya indah Anda
            </p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 space-y-4 sm:space-y-0">
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/feed')}
              className="px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-white rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              ← Kembali ke Feed
            </button>
          </div>
          
          <button
            onClick={openCreateForm}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-6 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
          >
            <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Buat Puisi Baru
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4 animate-pulse">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-red-200">{error}</p>
            </div>
          </div>
        )}

        {/* Puisi Grid */}
        {puisiList.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-white rounded-3xl border border-purple-500/20 bg-gradient-to-tr from-[#0F0F0F] to-[#0B0B0B] shadow-2xl backdrop-blur-xl p-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="p-6 rounded-full backdrop-blur-lg border border-purple-500/20 bg-gradient-to-br from-black/80 to-gray-900/60">
                  <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                  </svg>
                </div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-purple-500 to-purple-400 bg-clip-text text-transparent">
                  Belum Ada Puisi
                </h2>
                <p className="text-gray-300 text-sm mb-4">
                  Mulai perjalanan kreatif Anda dengan membuat puisi pertama!
                </p>
                <button
                  onClick={openCreateForm}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-6 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
                >
                  Buat Puisi Pertama
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:gap-8 md:grid-cols-2 xl:grid-cols-3">
            {puisiList.map((puisi, index) => (
              <div
                key={puisi.id}
                className="group transform transition-all duration-500 hover:scale-[1.02] hover:-rotate-0.5"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-white rounded-3xl border border-purple-500/20 bg-gradient-to-tr from-[#0F0F0F] to-[#0B0B0B] shadow-2xl duration-700 relative backdrop-blur-xl hover:border-purple-500/40 overflow-hidden hover:shadow-purple-500/10 hover:shadow-3xl h-full">
                  
                  {/* Card Background Effects */}
                  <div className="absolute inset-0 z-0 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-purple-400/10 opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-tr from-purple-500/10 to-transparent blur-2xl opacity-30 group-hover:opacity-50 transition-all duration-700"></div>
                  </div>

                  <div className="relative z-10 p-6 h-full flex flex-col">
                    {/* Status Badge */}
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        puisi.is_public 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {puisi.is_public ? 'Publik' : 'Privat'}
                      </span>
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-2 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={() => openEditForm(puisi)}
                          className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors duration-200"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(puisi)}
                          className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors duration-200"
                          title="Hapus"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-400 via-purple-500 to-pink-400 bg-clip-text text-transparent mb-3 group-hover:scale-105 transition-transform duration-300">
                      {puisi.judul}
                    </h3>

                    {/* Content Preview */}
                    <div className="flex-1 mb-4">
                      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line line-clamp-6 group-hover:text-gray-200 transition-colors duration-300">
                        {puisi.isi.length > 150 ? `${puisi.isi.substring(0, 150)}...` : puisi.isi}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>
                        {new Date(puisi.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="text-purple-400">
                        {puisi.isi.split('\n').length} baris
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateForm || editingPuisi) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-tr from-[#0F0F0F] to-[#0B0B0B] rounded-3xl border border-purple-500/20 shadow-2xl backdrop-blur-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 sm:p-8">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-purple-500 to-purple-400 bg-clip-text text-transparent">
                  {editingPuisi ? 'Edit Puisi' : 'Buat Puisi Baru'}
                </h2>
                <button
                  onClick={closeAllModals}
                  className="p-2 rounded-lg bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={editingPuisi ? handleUpdatePuisi : handleCreatePuisi} className="space-y-6">
                {/* Title Input */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Judul Puisi
                  </label>
                  <input
                    type="text"
                    value={formData.judul}
                    onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Masukkan judul puisi yang menarik..."
                    required
                    disabled={formLoading}
                  />
                </div>

                {/* Content Input */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Isi Puisi
                  </label>
                  <textarea
                    value={formData.isi}
                    onChange={(e) => setFormData({ ...formData, isi: e.target.value })}
                    rows={12}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Tuangkan inspirasi Anda dalam bentuk puisi yang indah..."
                    required
                    disabled={formLoading}
                  />
                </div>

                {/* Visibility Toggle */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={formData.is_public}
                    onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                    className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                    disabled={formLoading}
                  />
                  <label htmlFor="is_public" className="text-white text-sm">
                    Publikasikan puisi ini (orang lain dapat melihat di feed)
                  </label>
                </div>

                {/* Form Actions */}
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={closeAllModals}
                    className="flex-1 px-6 py-3 bg-gray-500/20 hover:bg-gray-500/30 text-white rounded-xl transition-all duration-200"
                    disabled={formLoading}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                  >
                    {formLoading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        {editingPuisi ? 'Mengupdate...' : 'Membuat...'}
                      </div>
                    ) : (
                      editingPuisi ? 'Update Puisi' : 'Buat Puisi'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-tr from-[#0F0F0F] to-[#0B0B0B] rounded-3xl border border-red-500/20 shadow-2xl backdrop-blur-xl w-full max-w-md">
            <div className="p-6 sm:p-8">
              {/* Modal Header */}
              <div className="text-center mb-6">
                <div className="p-4 rounded-full bg-red-500/20 w-fit mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Hapus Puisi
                </h2>
                <p className="text-gray-300 text-sm">
                  Apakah Anda yakin ingin menghapus puisi "{deleteConfirm.judul}"?
                </p>
                <p className="text-red-400 text-xs mt-2">
                  Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>

              {/* Actions */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-6 py-3 bg-gray-500/20 hover:bg-gray-500/30 text-white rounded-xl transition-all duration-200"
                  disabled={formLoading}
                >
                  Batal
                </button>
                <button
                  onClick={() => handleDeletePuisi(deleteConfirm.id)}
                  disabled={formLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {formLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                      </svg>
                      Menghapus...
                    </div>
                  ) : (
                    'Hapus'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyPuisi;