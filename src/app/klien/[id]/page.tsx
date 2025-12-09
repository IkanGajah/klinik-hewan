import { supabaseServer } from '@/lib/supabase'; // Gunakan client server untuk fetch awal pemilik
import Link from 'next/link';
import HewanManager from '@/components/HewanManager'; // Import komponen yang baru dibuat

export default async function DetailPemilikPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  // Fetch Data Pemilik (Server Side)
  const { data: pemilik, error } = await supabaseServer
    .from('pemilik')
    .select('*')
    .eq('id_pemilik', id)
    .single();

  if (error || !pemilik) {
    return <div className="p-8 text-red-500">Pemilik tidak ditemukan!</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Link href="/klien" className="text-blue-600 hover:underline mb-4 block">
        ← Kembali ke Daftar Pemilik
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* BAGIAN KIRI: INFO PEMILIK (Static) */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500">
            <h2 className="text-xl font-bold mb-4">{pemilik.nama_pemilik}</h2>
            <div className="space-y-2">
                <p className="text-sm text-gray-600"><strong>Telp:</strong> {pemilik.nomor_telepon}</p>
                <p className="text-sm text-gray-600"><strong>Alamat:</strong> {pemilik.alamat || '-'}</p>
            </div>
          </div>
        </div>

        {/* BAGIAN KANAN: MANAJER HEWAN (Interactive Client Component) */}
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md">
            {/* Panggil komponen HewanManager dan kirim ID Pemilik */}
            <HewanManager idPemilik={pemilik.id_pemilik} />
          </div>
        </div>

      </div>
    </div>
  );
}