// ...existing code...
import Link from 'next/link';
import { supabaseServer as supabase } from '@/lib/supabase';
import HewanFormClient from './HewanFormClient';

export default async function DetailPemilikPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams?: { page?: string; pageSize?: string };
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const page = Math.max(1, Number(resolvedSearchParams?.page ?? 1));
  const pageSize = Math.max(5, Number(resolvedSearchParams?.pageSize ?? 10));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // fetch pemilik (single) + paged hewan (with exact count)
  const [{ data: pemilik, error: pemError }, { data: hewanData, count, error: hewanError }] = await Promise.all([
    supabase.from('pemilik').select('*, hewan(id_hewan)').eq('id_pemilik', id).single(),
    supabase.from('hewan').select('*', { count: 'exact' }).eq('id_pemilik', id).range(from, to)
  ]);

  if (pemError || !pemilik) {
    return <div className="p-8 text-red-500">Pemilik tidak ditemukan!</div>;
  }
  if (hewanError) {
    console.error(hewanError);
  }

  const daftarHewan = hewanData ?? [];
  const total = typeof count === 'number' ? count : daftarHewan.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Link href="/klien" className="text-blue-600 hover:underline mb-4 block">← Kembali ke Daftar Pemilik</Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500">
            <h2 className="text-xl font-bold mb-4">{pemilik.nama_pemilik}</h2>
            <p className="text-sm text-gray-600">Tel: {pemilik.nomor_telepon}</p>
            <p className="text-sm text-gray-600">Alamat: {pemilik.alamat || '-'}</p>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Daftar Peliharaan ({total})</h2>
            </div>

            {daftarHewan.length === 0 ? (
              <p className="text-gray-500 italic p-4 bg-gray-50 rounded text-center">Belum ada hewan terdaftar.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-700 uppercase">
                    <tr>
                      <th className="px-4 py-2">ID Hewan</th>
                      <th className="px-4 py-2">Nama Hewan</th>
                      <th className="px-4 py-2">Jenis</th>
                      <th className="px-4 py-2">Ras</th>
                      <th className="px-4 py-2">Gender</th>
                      <th className="px-4 py-2">Tanggal Lahir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {daftarHewan.map((h: any) => (
                      <tr key={h.id_hewan} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{h.id_hewan}</td>
                        <td className="px-4 py-3">{h.nama}</td>
                        <td className="px-4 py-3">{h.jenis}</td>
                        <td className="px-4 py-3">{h.ras}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs text-white ${h.jenis_kelamin === 'Jantan' ? 'bg-blue-400' : 'bg-pink-400'}`}>
                            {h.jenis_kelamin || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3">{h.tanggal_lahir ? new Date(h.tanggal_lahir).toLocaleDateString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-2">
                {page > 1 && (
                  <Link href={`/klien/${id}?page=${page - 1}&pageSize=${pageSize}`} className="px-3 py-1 bg-gray-200 rounded">Prev</Link>
                )}
                {page < totalPages && (
                  <Link href={`/klien/${id}?page=${page + 1}&pageSize=${pageSize}`} className="px-3 py-1 bg-gray-200 rounded">Next</Link>
                )}
              </div>
              <div className="text-sm text-gray-600">Halaman {page} / {totalPages}</div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-2">Tambah Hewan</h3>
              <HewanFormClient pemilikId={pemilik.id_pemilik} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// ...existing code...