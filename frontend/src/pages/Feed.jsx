import { useEffect, useState } from "react";

function Feed() {
  const [puisi, setPuisi] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPuisi = async () => {
    try {
      setLoading(true);
      // Simulasi data puisi untuk demo
      const mockData = [
        {
          id: 1,
          judul: "Senja di Kota",
          isi: "Langit berwarna jingga\nMenyapa senja yang lelah\nKota mulai menyalakan lampunya\nSeperti bintang yang turun ke bumi\n\nAku berjalan di antara hiruk pikuk\nMencari ketenangan dalam keheningan\nSetiap langkah bercerita\nTentang hari yang telah berlalu",
          user_id: 1,
          author: "Penulis Anonim"
        },
        {
          id: 2,
          judul: "Hujan Pagi",
          isi: "Tetes-tetes air jatuh dari langit\nMembasahi bumi yang kering\nSeperti air mata kebahagiaan\nYang telah lama tertahan\n\nBunga-bunga mulai mekar\nDaun-daun hijau berkilau\nAku mendengar simfoni alam\nDalam setiap tetes hujan",
          user_id: 2,
          author: "Sang Penyair"
        },
        {
          id: 3,
          judul: "Mimpi di Malam Hari",
          isi: "Ketika malam tiba\nMimpi mulai menari\nMembawa aku ke dimensi lain\nDi mana segala mungkin terjadi\n\nBintang-bintang berbisik\nBulan tersenyum lembut\nAku terbang tanpa sayap\nDalam pelukan mimpi yang indah",
          user_id: 3,
          author: "Pemimpi Malam"
        }
      ];
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulasi loading
      setPuisi(mockData);
    } catch (err) {
      console.error("Gagal mengambil puisi", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPuisi();
  }, []);

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
                Memuat Puisi...
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
              Feed Puisi Publik
            </h1>
            <p className="text-gray-300 text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto">
              Temukan koleksi puisi dari para penulis berbakat dan nikmati keindahan kata-kata yang menginspirasi
            </p>
          </div>
          
          {/* Divider */}
          <div className="mt-8 w-24 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent rounded-full mx-auto animate-pulse"></div>
        </div>

        {/* Puisi Cards */}
        <div className="grid gap-6 lg:gap-8">
          {puisi.map((p, index) => (
            <div
              key={p.id}
              className="group cursor-pointer transform transition-all duration-500 hover:scale-[1.02] hover:-rotate-0.5"
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

                  {/* Author Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                        {p.author ? p.author.charAt(0).toUpperCase() : p.user_id}
                      </div>
                      <div>
                        <p className="text-purple-300 text-sm sm:text-base font-medium">
                          {p.author || `User #${p.user_id}`}
                        </p>
                        <p className="text-gray-500 text-xs sm:text-sm">
                          Penulis
                        </p>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-2 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                      <button className="p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 transition-colors duration-200">
                        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                        </svg>
                      </button>
                      <button className="p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 transition-colors duration-200">
                        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Corner Effects */}
                <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-purple-500/10 to-transparent rounded-br-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-purple-500/10 to-transparent rounded-tl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          ))}
        </div>

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
    </div>
  );
}

export default Feed;