import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default async function DetailPemilikPage({ params }: { params: { id: string } }) {
  const idPemilik = params.id;

  // FETCH SAKTI: Ambil Pemilik BESERTA Hewan-hewannya
  // Hewan(*) artinya: Ambil semua kolom dari tabel Hewan yang relasinya ke pemilik ini
  const { data: pemilik, error } = await supabase
    .from('Pemilik')
    .select(`
      *,
      Hewan (*)
    `)
    .eq('id_pemilik', idPemilik)
    .single(); // .single() karena kita cuma cari 1 orang

  if (error || !pemilik) {
    return <div className="p-8 text-red-500">Pemilik tidak ditemukan!</div>;
  }

  // Karena Supabase mengembalikan data relasi sebagai array, kita tampung biar rapi
  const daftarHewan = pemilik.Hewan || [];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Link href="/klien" className="text-blue-600 hover:underline mb-4 block">
        ← Kembali ke Daftar Pemilik
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* BAGIAN 1: INFORMASI PEMILIK (Kiri/Atas) */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Profil Pemilik</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Nama</label>
                <p className="text-lg font-medium">{pemilik.nama_pemilik}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Telepon</label>
                <p className="text-gray-700">{pemilik.nomor_telepon}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Alamat</label>
                <p className="text-gray-700">{pemilik.alamat || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* BAGIAN 2: TABEL HEWAN (Kanan/Bawah) */}
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Daftar Peliharaan ({daftarHewan.length})</h2>
              {/* Nanti bisa tambah tombol "Tambah Hewan" di sini */}
            </div>

            {daftarHewan.length === 0 ? (
              <p className="text-gray-500 italic p-4 bg-gray-50 rounded text-center">
                Belum ada hewan terdaftar.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-700 uppercase">
                    <tr>
                      <th className="px-4 py-2">Nama Hewan</th>
                      <th className="px-4 py-2">Jenis</th>
                      <th className="px-4 py-2">Ras</th>
                      <th className="px-4 py-2">Gender</th>
                      <th className="px-4 py-2">Tanggal Lahir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {daftarHewan.map((hewan: any) => (
                      <tr key={hewan.id_hewan} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-bold">{hewan.nama}</td>
                        <td className="px-4 py-3">{hewan.jenis}</td>
                        <td className="px-4 py-3">{hewan.ras}</td>
                        <td className="px-4 py-3">{new Date(hewan.tanggal_lahir).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs text-white ${
                            hewan.jenis_kelamin === 'Jantan' ? 'bg-blue-400' : 'bg-pink-400'
                          }`}>
                            {hewan.jenis_kelamin}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}