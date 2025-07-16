import { useEffect, useState } from "react";
import axios from "axios";

function Feed() {
  const [puisi, setPuisi] = useState([]);

  const fetchPuisi = async () => {
    try {
      const res = await axios.get("http://localhost/api/puisi/puisi");
      setPuisi(res.data);
    } catch (err) {
      console.error("Gagal mengambil puisi", err);
    }
  };

  useEffect(() => {
    fetchPuisi();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">📜 Feed Puisi Publik</h1>
      <div className="grid gap-6 max-w-3xl mx-auto">
        {puisi.map((p) => (
          <div key={p.id} className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">{p.judul}</h2>
            <p className="text-gray-700 whitespace-pre-line">{p.isi}</p>
            <p className="text-sm text-gray-400 mt-4">oleh user #{p.user_id}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Feed;
