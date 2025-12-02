import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="max-h-screen bg-gray-50 mx-auto container p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Klinik Hewan</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition border-l-4 border-blue-500">
          <h2 className="text-xl font-semibold mb-2">📞 Buku Telepon</h2>
          <p className="text-gray-600 text-sm">Cari kontak Dokter & Klien (Union).</p>
        </Link>

        <Link href="/" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition border-l-4 border-green-500">
          <h2 className="text-xl font-semibold mb-2">📊 Laporan Dokter</h2>
          <p className="text-gray-600 text-sm">Lihat performa & keaktifan (Left Join).</p>
        </Link>

        <Link href="/" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition border-l-4 border-purple-500">
          <h2 className="text-xl font-semibold mb-2">🧾 Cetak Struk</h2>
          <p className="text-gray-600 text-sm">Contoh cetak struk ID #1 (Inner Join).</p>
        </Link>
      </div>
    </div>
  );
}