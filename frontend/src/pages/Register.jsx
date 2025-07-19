import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../services/authApi";

function Register() {
  const [form, setForm] = useState({ username: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (!form.username.trim() || !form.password.trim() || !form.confirmPassword.trim()) {
      setError("Semua field harus diisi.");
      setLoading(false);
      return;
    }

    if (form.username.length < 3) {
      setError("Username minimal 3 karakter.");
      setLoading(false);
      return;
    }

    if (form.username.length > 20) {
      setError("Username maksimal 20 karakter.");
      setLoading(false);
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
      setError("Username hanya boleh mengandung huruf, angka, dan underscore.");
      setLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError("Password minimal 6 karakter.");
      setLoading(false);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.post('/register', {
        username: form.username.trim(),
        password: form.password
      });

      if (response.data.id) {
        setSuccess("Registrasi berhasil! Mengalihkan ke halaman login...");
        
        // Navigate to login after brief delay
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError("Registrasi gagal. Silakan coba lagi.");
      }
    } catch (err) {
      console.error('Register error:', err);
      
      // Handle different error types
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.status === 400) {
        setError("Username sudah digunakan atau data tidak valid.");
      } else if (err.response?.status >= 500) {
        setError("Server error. Silakan coba lagi nanti.");
      } else if (err.code === 'NETWORK_ERROR' || !err.response) {
        setError("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.");
      } else {
        setError("Terjadi kesalahan saat mendaftar. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0F0F0F] to-[#0B0B0B] p-4 sm:p-6 lg:p-8">
      <div className="group cursor-pointer transform transition-all duration-500 hover:scale-[1.02] w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl">
        <div className="text-white rounded-3xl border border-purple-500/20 bg-gradient-to-tr from-[#0F0F0F] to-[#0B0B0B] shadow-2xl duration-700 z-10 relative backdrop-blur-xl hover:border-purple-500/40 overflow-hidden hover:shadow-purple-500/10 hover:shadow-3xl w-full min-h-[700px] sm:min-h-[750px] lg:min-h-[800px]">
          
          {/* Background Effects */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-purple-400/10 opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
            <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-gradient-to-tr from-purple-500/10 to-transparent blur-3xl opacity-30 group-hover:opacity-50 transform group-hover:scale-110 transition-all duration-700 animate-bounce delay-500"></div>
            <div className="absolute top-10 left-10 w-16 h-16 rounded-full bg-purple-500/5 blur-xl animate-ping"></div>
            <div className="absolute bottom-16 right-16 w-12 h-12 rounded-full bg-purple-500/5 blur-lg animate-ping delay-1000"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000"></div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10 relative z-10">
            <div className="flex flex-col items-center text-center space-y-6">
              
              {/* Logo/Icon */}
              <div className="relative mb-2">
                <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 animate-ping"></div>
                <div className="absolute inset-0 rounded-full border border-purple-500/10 animate-pulse delay-500"></div>
                <div className="p-4 sm:p-6 rounded-full backdrop-blur-lg border border-purple-500/20 bg-gradient-to-br from-black/80 to-gray-900/60 shadow-2xl transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 hover:shadow-purple-500/20">
                  <div className="transform group-hover:rotate-180 transition-transform duration-700">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 fill-current group-hover:text-purple-400 transition-colors duration-300 filter drop-shadow-lg" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="transform group-hover:scale-105 transition-transform duration-300 space-y-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 via-purple-500 to-purple-400 bg-clip-text text-transparent animate-pulse">
                  KataKata
                </h1>
                <p className="text-white font-semibold text-sm sm:text-base lg:text-lg transform group-hover:scale-105 transition-transform duration-300">
                  Bergabung dengan Kami
                </p>
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed transform group-hover:text-gray-200 transition-colors duration-300 max-w-xs mx-auto">
                  Buat akun baru dan mulai berbagi cerita indah Anda
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 w-full max-w-sm">
                <div className="space-y-2">
                  <label htmlFor="username" className="block text-xs sm:text-sm font-medium text-white/80 text-left">
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Pilih username unik"
                    value={form.username}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                    minLength={3}
                    maxLength={20}
                  />
                  <p className="text-white/60 text-xs sm:text-sm">
                    3-20 karakter, hanya huruf, angka, dan underscore
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-white/80 text-left">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Buat password yang kuat"
                    value={form.password}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium text-white/80 text-left">
                    Konfirmasi Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Ketik ulang password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                    minLength={6}
                  />
                  <p className="text-white/60 text-xs sm:text-sm">
                    Password minimal 6 karakter
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 animate-pulse">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-red-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <p className="text-red-200 text-xs sm:text-sm">{error}</p>
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 animate-pulse">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <p className="text-green-200 text-xs sm:text-sm">{success}</p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2.5 sm:py-3 px-4 rounded-xl font-medium text-sm sm:text-base hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-purple-500/25"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sedang mendaftar...
                    </div>
                  ) : (
                    "Daftar"
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="w-1/3 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent rounded-full transform group-hover:w-1/2 group-hover:h-1 transition-all duration-500 animate-pulse"></div>

              {/* Links */}
              <div className="text-center space-y-3">
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed transform group-hover:text-gray-200 transition-colors duration-300">
                  Sudah punya akun?{" "}
                  <button
                    onClick={() => navigate("/login")}
                    className="text-purple-300 hover:text-purple-200 font-medium transition-colors duration-200 underline"
                    disabled={loading}
                  >
                    Login di sini
                  </button>
                </p>
                
                {/* Terms */}
                <div className="text-xs text-gray-400 max-w-xs mx-auto">
                  <p>
                    Dengan mendaftar, Anda menyetujui{" "}
                    <button 
                      className="text-purple-300 hover:text-purple-200 underline transition-colors duration-200"
                      onClick={() => alert("Fitur Syarat & Ketentuan belum tersedia")}
                    >
                      Syarat & Ketentuan
                    </button>{" "}
                    dan{" "}
                    <button 
                      className="text-purple-300 hover:text-purple-200 underline transition-colors duration-200"
                      onClick={() => alert("Fitur Kebijakan Privasi belum tersedia")}
                    >
                      Kebijakan Privasi
                    </button>{" "}
                    kami.
                  </p>
                </div>
              </div>

              {/* Animated Dots */}
              <div className="flex space-x-2 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>

          {/* Corner Effects */}
          <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-transparent rounded-br-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-purple-500/10 to-transparent rounded-tl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
      </div>
    </div>
  );
}

export default Register;