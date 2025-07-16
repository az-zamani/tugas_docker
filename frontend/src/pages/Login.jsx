import { useState } from "react";

function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      // Simulasi API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (form.username === "admin" && form.password === "admin") {
        alert("Login berhasil!");
        // navigate("/feed");
      } else {
        setError("Username atau password salah.");
      }
    } catch {
      setError("Username atau password salah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%)'
    }}>
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="relative w-full max-w-md">
        <div className="bg-white bg-opacity-10 border border-white border-opacity-20 rounded-2xl shadow-2xl p-8" style={{
          backdropFilter: 'blur(20px)'
        }}>
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{
              background: 'linear-gradient(45deg, #a855f7, #ec4899)'
            }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">KataKata</h1>
            <p className="text-white opacity-70">Masuk ke akun Anda</p>
          </div>

          <div className="space-y-5">
            <div className="space-y-1">
              <label htmlFor="username" className="block text-sm font-medium text-white opacity-80">
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="Masukkan username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-medium text-white opacity-80">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Masukkan password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 border-opacity-30 rounded-lg p-3">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full text-white py-3 px-4 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
              style={{
                background: loading ? '#6b7280' : 'linear-gradient(45deg, #a855f7, #ec4899)',
                ':hover': {
                  background: 'linear-gradient(45deg, #9333ea, #db2777)'
                }
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.background = 'linear-gradient(45deg, #9333ea, #db2777)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.background = 'linear-gradient(45deg, #a855f7, #ec4899)';
                }
              }}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sedang masuk...
                </div>
              ) : (
                "Masuk"
              )}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-white opacity-70 text-sm">
              Belum punya akun?{" "}
              <button
                onClick={() => alert("Fitur daftar belum tersedia")}
                className="text-purple-300 hover:text-purple-200 font-medium transition-colors duration-200"
              >
                Daftar sekarang
              </button>
            </p>
          </div>

          <div className="mt-4 text-center">
            <button 
              onClick={() => alert("Fitur lupa password belum tersedia")}
              className="text-purple-300 hover:text-purple-200 text-sm transition-colors duration-200"
            >
              Lupa password?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;