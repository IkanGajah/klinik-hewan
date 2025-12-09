import { supabaseServer } from '@/lib/supabase';
import Link from 'next/link';
import PembayaranManager from '@/components/PembayaranManager';
import LayananManager from '@/components/LayananManager'; // Import komponen baru

export const dynamic = 'force-dynamic';

export default async function DetailKunjunganPage({ 
  params 
}: { 
  params: Promise<{ pembayaran: string }> 
}) {
  const { pembayaran: idKunjungan } = await params;

  // ... (Fetch Data Kunjungan Header TETAP SAMA seperti sebelumnya) ...
  const { data: kunjungan, error } = await supabaseServer
    .from('kunjungan')
    .select(`*, dokter (nama_dokter), hewan (nama, jenis, pemilik (nama_pemilik, alamat))`)
    .eq('id_kunjungan', idKunjungan)
    .single();

  if (error || !kunjungan) return <div>Data tidak ditemukan</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 print:bg-white print:p-0 print:min-h-0 print:h-auto">
      
      {/* Tombol Back */}
      <div className="print:hidden mb-4">
        <Link href="/kunjungan" className="text-blue-600 hover:underline">← Kembali ke Riwayat</Link>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* BAGIAN 1: HEADER (INFO KUNJUNGAN) */}
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-purple-500 print:shadow-none print:border-none print:p-0">
           {/* ... (Isi Header Kunjungan SAMA PERSIS seperti sebelumnya) ... */}
           <div className="flex justify-between items-start">
             <div><h1 className="text-2xl font-bold">Invoice #{kunjungan.id_kunjungan}</h1></div>
             <div><span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">Dokter: {kunjungan.dokter?.nama_dokter}</span></div>
           </div>
           {/* ... Info Pasien ... */}
           <div className="mt-4"><p><strong>Pasien:</strong> {kunjungan.hewan?.nama}</p></div>
        </div>


        {/* BAGIAN 2: MANAGER LAYANAN (INPUT TINDAKAN) */}
        <div className="bg-white p-6 rounded-lg shadow-md print:hidden">
           <LayananManager idKunjungan={kunjungan.id_kunjungan} />
        </div>


        {/* BAGIAN 3: MANAGER PEMBAYARAN (KASIR) */}
        <div className="bg-white p-6 rounded-lg shadow-md print:shadow-none print:p-0 print:mt-4">
           {/* PembayaranManager akan menampilkan Rincian Tagihan (Read Only) & Form Bayar */}
           <PembayaranManager idKunjungan={kunjungan.id_kunjungan} />
        </div>

        {/* Footer Print */}
        <div className="hidden print:block text-center text-xs mt-8 text-gray-500">
            <p>Terima kasih atas kepercayaan Anda.</p>
        </div>

      </div>
    </div>
  );
}