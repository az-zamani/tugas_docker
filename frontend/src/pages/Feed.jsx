import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import puisiApi from "../services/puisiApi";
import reactionApi from "../services/reactionApi";

function Feed() {
  const [puisi, setPuisi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ judul: "", isi: "", is_public: true });
  const [formLoading, setFormLoading] = useState(false);
  
  // Like states
  const [likeLoading, setLikeLoading] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [userLikes, setUserLikes] = useState({});
  
  // Comment states
  const [comments, setComments] = useState({});
  const [commentCounts, setCommentCounts] = useState({});
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [commentLoading, setCommentLoading] = useState({});
  
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchPuisi = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await puisiApi.get('/puisi');
      setPuisi(response.data);
      
      // Fetch like counts, user likes, and comment counts for each puisi
      const likeCounts = {};
      const userLikes = {};
      const commentCounts = {};
      
      await Promise.all(
        response.data.map(async (p) => {
          try {
            // Get like count
            const countResponse = await reactionApi.get(`/like/count/${p.id}`);
            likeCounts[p.id] = countResponse.data.total || 0;
            
            // Get comment count
            const commentCountResponse = await reactionApi.get(`/komentar/count/${p.id}`);
            commentCounts[p.id] = commentCountResponse.data.total || 0;
            
            // Check if current user liked this puisi (only if logged in)
            const token = localStorage.getItem('token');
            if (token) {
              try {
                const likeResponse = await reactionApi.get(`/like/check/${p.id}`);
                userLikes[p.id] = likeResponse.data.liked || false;
              } catch (err) {
                userLikes[p.id] = false;
              }
            }
          } catch (err) {
            console.error(`Failed to fetch data for puisi ${p.id}:`, err);
            likeCounts[p.id] = 0;
            commentCounts[p.id] = 0;
            userLikes[p.id] = false;
          }
        })
      );
      
      setLikeCounts(likeCounts);
      setUserLikes(userLikes);
      setCommentCounts(commentCounts);
      
    } catch (err) {
      console.error("Failed to fetch puisi:", err);
      setError("Gagal memuat puisi. Silakan coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePuisi = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Silakan login terlebih dahulu untuk membuat puisi.");
      navigate('/login');
      return;
    }

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
      
      // Refresh feed
      fetchPuisi();
    } catch (err) {
      console.error("Failed to create puisi:", err);
      if (err.response?.status === 401) {
        alert("Sesi Anda telah berakhir. Silakan login kembali.");
        navigate('/login');
      } else {
        setError(err.response?.data?.error || "Gagal membuat puisi.");
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleLike = async (puisiId) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert("Silakan login terlebih dahulu untuk menyukai puisi.");
      navigate('/login');
      return;
    }

    setLikeLoading(prev => ({ ...prev, [puisiId]: true }));

    try {
      const isLiked = userLikes[puisiId];
      
      if (isLiked) {
        await reactionApi.post('/unlike', { puisi_id: puisiId });
        setUserLikes(prev => ({ ...prev, [puisiId]: false }));
        setLikeCounts(prev => ({ ...prev, [puisiId]: Math.max(0, (prev[puisiId] || 1) - 1) }));
      } else {
        await reactionApi.post('/like', { puisi_id: puisiId });
        setUserLikes(prev => ({ ...prev, [puisiId]: true }));
        setLikeCounts(prev => ({ ...prev, [puisiId]: (prev[puisiId] || 0) + 1 }));
      }
    } catch (err) {
      console.error('Like error:', err);
      if (err.response?.status === 401) {
        alert("Sesi Anda telah berakhir. Silakan login kembali.");
        navigate('/login');
      } else {
        alert("Gagal memproses like. Silakan coba lagi.");
      }
    } finally {
      setLikeLoading(prev => ({ ...prev, [puisiId]: false }));
    }
  };

  const fetchComments = async (puisiId) => {
    try {
      const response = await reactionApi.get(`/komentar/${puisiId}`);
      setComments(prev => ({ ...prev, [puisiId]: response.data }));
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  };

  const toggleComments = async (puisiId) => {
    if (showComments[puisiId]) {
      setShowComments(prev => ({ ...prev, [puisiId]: false }));
    } else {
      setShowComments(prev => ({ ...prev, [puisiId]: true }));
      if (!comments[puisiId]) {
        await fetchComments(puisiId);
      }
    }
  };

  const handleAddComment = async (puisiId) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert("Silakan login terlebih dahulu untuk berkomentar.");
      navigate('/login');
      return;
    }

    const commentText = newComment[puisiId]?.trim();
    if (!commentText) return;

    setCommentLoading(prev => ({ ...prev, [puisiId]: true }));

    try {
      const response = await reactionApi.post('/komentar', {
        puisi_id: puisiId,
        isi: commentText
      });

      // Add new comment to the list
      setComments(prev => ({
        ...prev,
        [puisiId]: [response.data, ...(prev[puisiId] || [])]
      }));

      // Clear input
      setNewComment(prev => ({ ...prev, [puisiId]: "" }));

      // Update comment count
      setCommentCounts(prev => ({ ...prev, [puisiId]: (prev[puisiId] || 0) + 1 }));

    } catch (err) {
      console.error('Comment error:', err);
      if (err.response?.status === 401) {
        alert("Sesi Anda telah berakhir. Silakan login kembali.");
        navigate('/login');
      } else {
        alert("Gagal menambahkan komentar. Silakan coba lagi.");
      }
    } finally {
      setCommentLoading(prev => ({ ...prev, [puisiId]: false }));
    }
  };

  const handleShare = (puisi) => {
    if (navigator.share) {
      navigator.share({
        title: puisi.judul,
        text: `Baca puisi "${puisi.judul}" oleh ${puisi.username || `User #${puisi.user_id}`}`,
        url: window.location.href
      }).catch(err => console.error('Share failed:', err));
    } else {
      const shareText = `Baca puisi "${puisi.judul}" oleh ${puisi.username || `User #${puisi.user_id}`}\n\n${puisi.isi}`;
      navigator.clipboard.writeText(shareText).then(() => {
        alert("Puisi telah disalin ke clipboard!");
      }).catch(() => {
        alert("Gagal menyalin puisi.");
      });
    }
  };

  useEffect(() => {
    fetchPuisi();
  }, []);

  // Loading state
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
                Memuat Feed...
              </h2>
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-200"></div>
              </div>
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
        <div className="absolute top-1/2 left-1/4 w-32 h-32 rounded-full bg-purple-500/5 blur-xl animate-ping"></div>
        <div className="absolute bottom-1/3 right-1/3 w-24 h-24 rounded-full bg-purple-500/5 blur-lg animate-ping delay-500"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 lg:mb-12">
          <div className="group inline-block">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 animate-ping"></div>
              <div className="p-4 sm:p-6 rounded-full backdrop-blur-lg border border-purple-500/20 bg-gradient-to-br from-black/80 to-gray-900/60 shadow-2xl transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 mx-auto w-fit">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-purple-500 fill-current group-hover:text-purple-400 transition-colors duration-300" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" fill="currentColor"/>
                </svg>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-purple-400 via-purple-500 to-purple-400 bg-clip-text text-transparent animate-pulse mb-3">
              KataKata Feed
            </h1>
            <p className="text-gray-300 text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto">
              Temukan inspirasi dan bagikan karya indah Anda bersama komunitas
            </p>
          </div>
          
          {/* Divider */}
          <div className="mt-8 w-24 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent rounded-full mx-auto animate-pulse"></div>
        </div>

        {/* Create Post Button */}
        <div className="mb-8 text-center">
          <button
            onClick={() => setShowCreateForm(true)}
            className="group bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-8 rounded-2xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
          >
            <svg className="w-5 h-5 inline-block mr-2 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Bagikan Puisi Anda
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

        {/* No Puisi State */}
        {puisi.length === 0 ? (
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
                <p className="text-gray-300 text-sm">
                  Jadilah yang pertama untuk membagikan puisi indah!
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-6 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
                >
                  Buat Puisi Pertama
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Puisi Cards */
          <div className="grid gap-6 lg:gap-8">
            {puisi.map((p, index) => (
              <div
                key={p.id}
                className="group transform transition-all duration-500 hover:scale-[1.01]"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-white rounded-3xl border border-purple-500/20 bg-gradient-to-tr from-[#0F0F0F] to-[#0B0B0B] shadow-2xl duration-700 relative backdrop-blur-xl hover:border-purple-500/40 overflow-hidden hover:shadow-purple-500/10 hover:shadow-3xl">
                  
                  {/* Card Background Effects */}
                  <div className="absolute inset-0 z-0 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-purple-400/10 opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-tr from-purple-500/10 to-transparent blur-2xl opacity-30 group-hover:opacity-50 transform group-hover:scale-110 transition-all duration-700"></div>
                    <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-purple-500/5 blur-lg animate-pulse"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000"></div>
                  </div>

                  <div className="relative z-10 p-6 sm:p-8 lg:p-10">
                    {/* Author Info */}
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        {p.username ? p.username.charAt(0).toUpperCase() : p.user_id}
                      </div>
                      <div>
                        <p className="text-purple-300 font-medium">
                          {p.username || `User #${p.user_id}`}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {new Date(p.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="mb-6">
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-400 via-purple-500 to-pink-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300 mb-2">
                        {p.judul}
                      </h2>
                      <div className="w-16 h-0.5 bg-gradient-to-r from-purple-500 to-transparent rounded-full transform group-hover:w-24 transition-all duration-500"></div>
                    </div>

                    {/* Content */}
                    <div className="mb-6">
                      <p className="text-gray-300 text-sm sm:text-base lg:text-lg leading-relaxed whitespace-pre-line transform group-hover:text-gray-200 transition-colors duration-300 font-light">
                        {p.isi}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between border-t border-white/10 pt-4">
                      <div className="flex items-center space-x-6">
                        {/* Like Button */}
                        <button 
                          onClick={() => handleLike(p.id)}
                          disabled={likeLoading[p.id]}
                          className={`flex items-center space-x-2 transition-all duration-200 ${
                            userLikes[p.id] 
                              ? 'text-red-400 hover:text-red-300' 
                              : 'text-gray-400 hover:text-red-400'
                          }`}
                        >
                          {likeLoading[p.id] ? (
                            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill={userLikes[p.id] ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                            </svg>
                          )}
                          <span className="font-medium">{likeCounts[p.id] || 0}</span>
                        </button>
                        
                        {/* Comment Button */}
                        <button 
                          onClick={() => toggleComments(p.id)}
                          className="flex items-center space-x-2 text-gray-400 hover:text-purple-400 transition-colors duration-200"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                          </svg>
                          <span className="font-medium">{commentCounts[p.id] || 0}</span>
                        </button>
                        
                        {/* Share Button */}
                        <button 
                          onClick={() => handleShare(p)}
                          className="flex items-center space-x-2 text-gray-400 hover:text-purple-400 transition-colors duration-200"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
                          </svg>
                          <span className="font-medium">Bagikan</span>
                        </button>
                      </div>
                    </div>

                    {/* Comments Section */}
                    {showComments[p.id] && (
                      <div className="mt-6 border-t border-white/10 pt-6">
                        {/* Add Comment Form */}
                        <div className="flex space-x-3 mb-4">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="flex-1 flex space-x-2">
                            <input
                              type="text"
                              value={newComment[p.id] || ""}
                              onChange={(e) => setNewComment(prev => ({ ...prev, [p.id]: e.target.value }))}
                              placeholder="Tulis komentar..."
                              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleAddComment(p.id);
                                }
                              }}
                            />
                            <button
                                onClick={() => handleAddComment(p.id)}
                                disabled={commentLoading[p.id] || !newComment[p.id]?.trim()}
                                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                              >
                                {commentLoading[p.id] ? (
                                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                                  </svg>
                                )}
                              </button>
                          </div>
                        </div>

                        {/* Comments List */}
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {comments[p.id] && comments[p.id].length > 0 ? (
                            comments[p.id].map((comment, idx) => (
                              <div key={comment.id || idx} className="flex space-x-3 animate-fadeIn">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                  {comment.username ? comment.username.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div className="flex-1 bg-white/5 rounded-xl p-3">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-purple-300 font-medium text-sm">
                                      {comment.username || `User #${comment.user_id}`}
                                    </span>
                                    <span className="text-gray-500 text-xs">
                                      {new Date(comment.created_at).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'short',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                  <p className="text-gray-300 text-sm">{comment.isi}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-gray-500 text-sm">Belum ada komentar. Jadilah yang pertama!</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Corner Effects */}
                  <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-purple-500/10 to-transparent rounded-br-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-purple-500/10 to-transparent rounded-tl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 lg:mt-16">
          <div className="flex space-x-2 justify-center opacity-60">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-500 rounded-full animate-bounce delay-200"></div>
          </div>
          <p className="text-gray-500 text-sm mt-4">
            Terus berbagi karya indah Anda
          </p>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-tr from-[#0F0F0F] to-[#0B0B0B] rounded-3xl border border-purple-500/20 shadow-2xl backdrop-blur-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 sm:p-8">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-purple-500 to-purple-400 bg-clip-text text-transparent">
                  Bagikan Puisi Anda
                </h2>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormData({ judul: "", isi: "", is_public: true });
                    setError("");
                  }}
                  className="p-2 rounded-lg bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCreatePuisi} className="space-y-6">
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
                    placeholder="Berikan judul yang menarik untuk puisi Anda..."
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
                    placeholder="Tuangkan perasaan dan pikiran Anda dalam bentuk puisi yang indah...

Contoh:
Langit biru di pagi hari
Menyapa dengan senyuman
Burung-burung bernyanyi riang
Menyambut hari yang baru"
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
                    Bagikan ke publik (akan muncul di feed untuk semua orang)
                  </label>
                </div>

                {/* Form Actions */}
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setFormData({ judul: "", isi: "", is_public: true });
                      setError("");
                    }}
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
                        Memposting...
                      </div>
                    ) : (
                      <>
                        <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                        </svg>
                        Bagikan Puisi
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .line-clamp-6 {
          display: -webkit-box;
          -webkit-line-clamp: 6;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

export default Feed;