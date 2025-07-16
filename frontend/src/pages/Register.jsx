import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost/api/auth/register", form);
      navigate("/");
    } catch {
      setError("Gagal daftar. Username mungkin sudah dipakai.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-500 to-yellow-500">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Daftar ke KataKata</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded"
          />
          {error && <p className="text-red-600">{error}</p>}
          <button className="w-full bg-pink-600 text-white py-3 rounded hover:bg-pink-700">Daftar</button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Sudah punya akun? <Link to="/" className="text-pink-700 font-medium">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
